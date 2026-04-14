@echo off
echo Starting HIRE-IQ Application...

echo Starting AI Service...
cd ai-service
start "AI Service" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo Starting Backend...
cd backend
start "Backend Service" cmd /k "npm run dev"
cd ..

echo Starting Frontend...
cd frontend
start "Frontend Service" cmd /k "npm run dev"
cd ..

echo All services are starting up in separate windows!
