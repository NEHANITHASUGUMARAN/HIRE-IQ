@echo off
echo Starting HIRE-IQ Application Setup...

echo ==============================================
echo Installing AI Service Dependencies...
echo ==============================================
cd ai-service
REM Assuming python is available
python -m pip install -r requirements.txt
cd ..

echo ==============================================
echo Installing Backend Dependencies...
echo ==============================================
cd backend
npm install
cd ..

echo ==============================================
echo Installing Frontend Dependencies...
echo ==============================================
cd frontend
npm install
cd ..

echo ==============================================
echo All dependencies installed properly!
echo ==============================================
