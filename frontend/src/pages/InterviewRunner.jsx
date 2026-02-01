// frontend/src/pages/InterviewRunner.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, submitAnswer, endSession } from '../features/sessions/sessionSlice';
import MonacoEditor from '@monaco-editor/react';
import { toast } from 'react-toastify';

const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'R Language', value: 'r' },
  { label: 'SQL', value: 'sql' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Solidity', value: 'solidity' },
  { label: 'Shell', value: 'shell' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Plain Text', value: 'plaintext' },
];

const ROLE_LANGUAGE_MAP = {
  "MERN Stack Developer": "javascript",
  "MEAN Stack Developer": "typescript",
  "Full Stack Python": "python",
  "Full Stack Java": "java",
  "Frontend Developer": "javascript",
  "Backend Developer": "javascript",
  "Data Scientist": "python",
  "Data Analyst": "python",
  "Machine Learning Engineer": "python",
  "DevOps Engineer": "shell",
  "Cloud Engineer (AWS/Azure/GCP)": "yaml",
  "Cybersecurity Engineer": "python",
  "Blockchain Developer": "solidity",
  "Mobile Developer (iOS/Android)": "swift",
  "Game Developer": "csharp",
  "QA Automation Engineer": "python",
  "UI/UX Designer": "css",
  "Product Manager": "markdown"
};
function InterviewRunner() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeSession, isLoading, message } = useSelector(state => state.sessions);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');


  // If submittedLocal[0] is true, we lock Question 0 immediately.
  const [submittedLocal, setSubmittedLocal] = useState({});

  const [drafts, setDrafts] = useState(() => {
    const saved = localStorage.getItem(`drafts_${sessionId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (activeSession?.role) {
      const detectedLang =
        ROLE_LANGUAGE_MAP[activeSession.role] || "plaintext";

      setSelectedLanguage(detectedLang);
    }
  }, [activeSession?.role]);


  useEffect(() => {
    localStorage.setItem(`drafts_${sessionId}`, JSON.stringify(drafts));
  }, [drafts, sessionId]);

  useEffect(() => {
    dispatch(getSessionById(sessionId));
  }, [dispatch, sessionId]);

  const currentQuestion = activeSession?.questions?.[currentQuestionIndex];


  // 1. Is it submitted in Redux? (Backend confirmed)
  const isReduxSubmitted = currentQuestion?.isSubmitted === true;

  // 2. Did I just click submit locally? (Optimistic update)
  const isLocallySubmitted = submittedLocal[currentQuestionIndex] === true;

  // 3. Lock if EITHER is true
  const isQuestionLocked = isReduxSubmitted || isLocallySubmitted;

  // 4. Show "Analyzing..." status if Locked AND not yet evaluated
  const isProcessing = isQuestionLocked && !currentQuestion?.isEvaluated;


  const handleNavigation = (index) => {
    if (index >= 0 && index < activeSession?.questions.length) {
      if (isRecording) stopRecording();
      setCurrentQuestionIndex(index);
      setRecordingTime(0);
    }
  };

  const updateDraftCode = (newCode) => {
    if (isQuestionLocked) return;
    setDrafts(prev => ({
      ...prev,
      [currentQuestionIndex]: { ...prev[currentQuestionIndex], code: newCode }
    }));
  };

  const startRecording = async () => {
    if (isQuestionLocked) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setDrafts(prev => ({
          ...prev,
          [currentQuestionIndex]: { ...prev[currentQuestionIndex], audioBlob: blob }
        }));
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (err) {
      toast.error("Microphone denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (isQuestionLocked) return;
    if (isRecording) stopRecording();

    const draft = drafts[currentQuestionIndex];
    const code = draft?.code || '';
    const audio = draft?.audioBlob;

    if (!code && !audio) {
      toast.warning("Please provide code or an audio answer.");
      return;
    }

    // ✅ 1. OPTIMISTIC UPDATE: Lock UI instantly
    setSubmittedLocal(prev => ({ ...prev, [currentQuestionIndex]: true }));

    const formData = new FormData();
    formData.append('questionIndex', currentQuestionIndex);
    if (code) formData.append('code', code);
    if (audio) formData.append('audioFile', audio, 'answer.webm');

    // ✅ 2. Send Request
    dispatch(submitAnswer({ sessionId, formData }))
      .unwrap()
      .catch((err) => {
        // If backend fails, UNLOCK so user can try again
        setSubmittedLocal(prev => ({ ...prev, [currentQuestionIndex]: false }));
        toast.error("Submission failed. Please try again.");
      });
  };

  const handleFinishInterview = () => {
    if (!window.confirm("Are you sure you want to finish?")) return;

    dispatch(endSession(sessionId))
      .unwrap()
      .then(() => {
        localStorage.removeItem(`drafts_${sessionId}`);
        navigate(`/review/${sessionId}`);
      })
      .catch(err => toast.error("Could not finish session. Ai is working on it."));
  };

  if (!activeSession) return <div className="text-center py-20 text-slate-400">Loading...</div>;

  const currentDraft = drafts[currentQuestionIndex] || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">{activeSession.role}</h1>
          <div className="flex gap-2 mt-2">
            {activeSession?.questions?.map((q, i) => (
              <div
                key={i}
                onClick={() => handleNavigation(i)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${i === currentQuestionIndex ? 'bg-blue-600 scale-125 ring-2 ring-blue-200' :
                  q.isEvaluated ? 'bg-emerald-500' :
                    (q.isSubmitted || submittedLocal[i]) ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleFinishInterview}
          disabled={isLoading}
          className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50"
        >
          {isLoading ? "Finalizing..." : "Finish Interview"}
        </button>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl mb-6">
        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Question {currentQuestionIndex + 1}</span>
        <h2 className="text-2xl mt-2 font-medium leading-relaxed">{currentQuestion?.questionText}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Verbal Answer</h3>

          {!isRecording && !currentDraft.audioBlob ? (
            <button
              onClick={startRecording}
              disabled={isQuestionLocked}
              className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              🎤
            </button>
          ) : isRecording ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center animate-pulse text-white text-3xl cursor-pointer" onClick={stopRecording}>
                ⏹
              </div>
              <p className="mt-4 font-mono text-rose-500 font-bold">{recordingTime}s</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-emerald-500 font-bold text-lg mb-2">Audio Captured ✅</div>
              {!isQuestionLocked && (
                <button onClick={() => setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], audioBlob: null } }))} className="text-xs text-slate-400 underline hover:text-rose-500">
                  Delete & Re-record
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[400px]">
          <div className="flex justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase py-2">Code Editor</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isQuestionLocked}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {SUPPORTED_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <MonacoEditor
            height="100%"
            language={selectedLanguage}
            theme="vs-dark"
            value={currentDraft.code || ''}
            onChange={updateDraftCode}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              readOnly: isQuestionLocked,
              domReadOnly: isQuestionLocked
            }}
          />
        </div>
      </div>

      {currentQuestion?.isEvaluated && (
        <div className="mt-6 bg-emerald-50 border border-emerald-100 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-emerald-800 font-bold mb-2">💡 AI Feedback</h3>
          <p className="text-emerald-700 text-sm leading-relaxed">{currentQuestion.aiFeedback}</p>
          <div className="mt-4 flex gap-4">
            <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-emerald-600 shadow-sm">Score: {currentQuestion.technicalScore}/100</span>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-6 md:px-12 flex justify-between items-center z-50">
        <button
          onClick={() => handleNavigation(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
          className="text-slate-500 font-bold text-sm hover:text-slate-800 disabled:opacity-30"
        >
          ← Previous
        </button>

        <div className="flex flex-col items-center">
          {/* ✅ STATUS BAR: Shows if Locked but not Evaluated yet */}
          {isProcessing && message && (
            <div className="mb-2 text-xs font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse border border-blue-100">
              🤖 {message}...
            </div>
          )}

          <button
            onClick={handleSubmitAnswer}
            disabled={isQuestionLocked}
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${isProcessing ? 'bg-slate-400 cursor-wait' :
              currentQuestion?.isEvaluated ? 'bg-emerald-500' :
                isQuestionLocked ? 'bg-slate-400' :
                  'bg-slate-900 hover:bg-slate-800 active:scale-95'
              }`}
          >
            {isProcessing ? "Analyzing..." : currentQuestion?.isEvaluated ? "Answer Submitted" : isQuestionLocked ? "Submitted" : "Submit Answer"}
          </button>
        </div>

        <button
          onClick={() => handleNavigation(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex === activeSession.questions.length - 1}
          className="text-slate-500 font-bold text-sm hover:text-slate-800 disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default InterviewRunner;