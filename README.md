# HIRE-IQ 

## 1. Final Folder Structure

```
HIRE-IQ/
│
├── ai-service/
│   ├── .env                 # Added AI Service config
│   ├── .env.example         # Added AI Service config example
│   ├── main.py
│   └── requirements.txt     
│
├── backend/
│   ├── .env                 # Added Backend config
│   ├── .env.example         # Added Backend config example
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── .env                 # Added Frontend config
│   ├── .env.example         # Added Frontend config example
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js       
│   └── (other config files)
│
├── install.bat              # Added master installation script
├── run_all.bat              # Added master run script
└── README.md                # This file
```

## 2. Technologies Identified
- **Frontend:** React 19, Vite, TailwindCSS, Redux Toolkit, Axios, Socket.io-client.
- **Backend:** Node.js, Express, Mongoose (MongoDB), Socket.io, JWT, Google Auth Library.
- **AI Service:** Python, FastAPI, Uvicorn, Ollama, Whisper, Pydub.

## 3. Communication Integration
- **Frontend -> Backend:**
  Uses `VITE_API_URL` pointing to `http://localhost:5000/api`. Handled via Axios in frontend feature slices.
- **Backend -> AI Service:**
  Uses `process.env.AI_SERVICE_URL` (with fallback to `http://localhost:8000`). Tested using Node Fetch in `sessionController.js` to communicate with AI generation/transcription endpoints.

## 4. Installation Steps
You can run the provided single install script or run commands manually.

### Option A: Using the Installer Script
1. Navigate to the project root directory (`HIRE-IQ`).
2. Run `install.bat`. This will automatically install dependencies for the Backend, Frontend, and AI Service.

### Option B: Manual Installation
- **Frontend:** `cd frontend` -> `npm install`
- **Backend:** `cd backend` -> `npm install`
- **AI Service:** `cd ai-service` -> `python -m pip install -r requirements.txt` (Make sure Python and pip are installed on the system).
*Note: The AI Service requires Ollama & Whisper to be functional on the host machine. You should have `ffmpeg` installed for `pydub` to process audio files.*

## 5. Starting the System from Scratch
First, make sure **MongoDB** is running locally on port 27017, and **Ollama** is running on your system with the `mistral` model downloaded (`ollama run mistral`).

### Option A: Using the Single Run Script
1. Open a terminal in the root directory (`HIRE-IQ`).
2. Run `run_all.bat`.
3. Three new command prompts will open, starting the Frontend, Backend, and AI Service respectively.

### Option B: Starting Manually
1. **Start AI Service:**
   ```sh
   cd ai-service
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Start Backend:**
   ```sh
   cd backend
   npm run dev
   ```
3. **Start Frontend:**
   ```sh
   cd frontend
   npm run dev
   ```
The application will be accessible at `http://localhost:5173` or `http://localhost:5174` (check the frontend terminal).
