import uvicorn
import os
import io
import json
import tempfile
from fastapi import FastAPI,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
import ollama
import whisper
from pydub import AudioSegment

load_dotenv()

AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT",8000))
OLLAMA_MODEL_NAME=os.getenv("OLLAMA_MODEL_NAME","mistral")

app=FastAPI(title="AI Interviewer Microservice",version="1.0")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WHISPER_MODEL=None

try:
    print("Loading Whisper Model ...")
    WHISPER_MODEL=whisper.load_model("base.en")
    print("Whisper Model Loaded Successfully")
except Exception as e:
    print("Error while loading Whisper Model")
    print(e)

class QuestionResquest(BaseModel):
    role:str="MERN Stack Developer"
    level:str="Junior"
    count:int=5
    interview_type:str="coding-mix"


class QuestionResponse(BaseModel):
    questions:list[str]
    model_used:str

class EvaluationRequest(BaseModel):
    question:str
    question_type:str
    role:str
    level:str
    user_answer:Optional[str]=None
    user_code:Optional[str]=None

class EvaluationResponse(BaseModel):
    technicalScore:int
    confidenceScore:int
    aiFeedback:str
    idealAnswer:str

@app.get("/")
async def root():
    return {"message":"Hello from AI Interviewer Microservice !","model":OLLAMA_MODEL_NAME}


@app.post("/generate-questions",response_model=QuestionResponse)
async def generate_questions(request:QuestionResquest):
   
    try:
        if request.interview_type=="coding-mix":
            coding_count=int(request.count*0.2)
            oral_oral=int(request.count)-int(coding_count)

            intruction=(
                f"The first {coding_count} questions MUST be coding challenge requiring function implementation."
                f"The remaining {oral_oral} questions MUST be conceptual oral questions."
            )
        else :
            intruction="All questions MUST be conceptual oral questions. Do Not generate any coding or implementation challenges."

        system_prompt=(
            "You are a professional technical interviewer. "
            "Task: Generate interview questions. No conversational text or numbering. "
            f"Crucial : {intruction}"
            "Output exactly one question per line. "
        )

        user_prompt=(
            f"Generate exactly {request.count} unique interview questions for a {request.level}  level {request.role} "
        )
        response=ollama.generate(
            model=OLLAMA_MODEL_NAME,
            prompt=user_prompt,
            system=system_prompt,
            options={"temperature":0.6}
        )

        raw_text=response['response'].strip()
        questions=[q.strip() for q in raw_text.split('\n') if q.strip()]
        return QuestionResponse(questions=questions[:request.count],model_used=OLLAMA_MODEL_NAME)

    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    

@app.post("/transcribe")
async def transcribe_audio(file:UploadFile=File(...)):
    try:
        audio_bytes=await file.read()
        audio_in_memory=io.BytesIO(audio_bytes)
        audio_segment=AudioSegment.from_file(audio_in_memory)
        with tempfile.NamedTemporaryFile(delete=False,suffix=".mp3") as tmp:
            temp_audio_path=tmp.name
            audio_segment.export(temp_audio_path,format="mp3")
        if not WHISPER_MODEL:
            raise HTTPException(status_code=503,detail="Whisper Model is not loaded")
        
        result=WHISPER_MODEL.transcribe(temp_audio_path)
                
        os.remove(temp_audio_path)
        return {"transcription":result["text"].strip()}

    except Exception as e:
        if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        raise HTTPException(status_code=500,detail=str(e))

@app.post("/evaluate",response_model=EvaluationResponse)
async def evaluate(request:EvaluationRequest):
    try:
        if request.question_type=="oral":
            assessment_intruction=(
                "This is a conceptual oral question. Focus purely on candidate's veral explanation. "
                "Ignore any code blocks. "
                "CRITICAL: If the transcript is empty, nonsense (e.g. 'blah blah','testing') or irrelevent to the question, SCORE 0."
            )
        else:
            assessment_intruction=(
                "This is a coding challenge question. Evaluate the code logic and efficiency. "
                "Use the transcription only for insight into their thought process. "
                "CRITICAL: If the code is 'udefined',empty, just random comments, or random characters, SCORE 0."
            )
        
        system_prompt=(
            "You are a sstrict technical interviewer. "
            "Do NOT hallucinate positive reviews for bad input. "
            "RULE 1: If the answer is gibberish, irrelevant, or missing, return 'technicalScore':0 and 'confidenceScore':0. "
            "RULE 2: For 'idealAnswer', provide a clean Markdown string.Do NOT return a nested JSON object. "
            f"Context:{assessment_intruction}"
            "Respond ONLY with a JSON object. "
            "Required keys: 'technicalScore' (0-100), 'confidenceScore' (0-100), 'aiFeedback', 'idealAnswer'. "
        )
        user_prompt=(
           
            f"Role: {request.role}\n"
            f"Question: {request.question}\n"
            f"Level: {request.level}\n"
            f"Verbal Answer: {request.user_answer or 'No verbal answer provided'}\n"
            f"Code Answer: {request.user_code or 'No code provided'}\n"
        )
        response=ollama.generate(
            model=OLLAMA_MODEL_NAME,
            prompt=user_prompt,
            system=system_prompt,
            format="json",
            options={"temperature":0.1}
        )
        response_text=response['response'].strip()
        try:
            evaluation_data=json.loads(response_text)
            if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'],str):
                evaluation_data['idealAnswer']=json.dumps(evaluation_data['idealAnswer'])
            return EvaluationResponse(**evaluation_data)
        except json.JSONDecodeError:
            import re
            fixed_text=re.sub(r'[\r\n\t]',' ',response_text)
            try :
                evaluation_data=json.loads(fixed_text)
                if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'],str):
                    evaluation_data['idealAnswer']=json.dumps(evaluation_data['idealAnswer'])
                return EvaluationResponse(**evaluation_data)
            except :
                print(f"Failed to parse response: {response_text}")
                return EvaluationResponse(technicalScore=0,confidenceScore=0,aiFeedback="Failed to parse response",idealAnswer="Failed to parse response")

    except Exception as e:
        print(f"Failed to generate response: {e}")
        raise HTTPException(status_code=500,detail=str(e))
        

if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0",port=AI_SERVICE_PORT)