# HIRE-IQ: AI-Powered Recruitment Platform

## 1. Project Overview
HIRE-IQ is a comprehensive, full-stack platform designed to automate and enhance the technical recruitment process. It leverages an intelligent pipeline consisting of a React frontend, a Node.js/Express backend, and a dedicated Python AI microservice to handle candidate assessment, test generation, and evaluation seamlessly.

## 2. End-to-End Workflow (How It Works)

The system is designed with two primary user roles: **Recruiters** and **Candidates**. Here is the step-by-step workflow:

### A. Job Posting & Discovery
- **Recruiter Dashboard:** Recruiters log into the platform and create a new Job Posting, specifying the required domain, skills, and overall criteria.
- **Candidate Dashboard:** Candidates log in and browse the list of open job positions. They can select a job that matches their skill set and apply.

### B. AI-Driven Assessment Phase
- **Test Generation:** Upon applying, a request is sent to the backend, which proxies a request to the **AI Microservice**. The AI service uses advanced LLMs (Ollama/Mistral) to dynamically generate tailored, domain-specific interview questions based on the job description.
- **Taking the Test:** The candidate navigates to the assessment interface. Questions are presented sequentially.
- **Speech/Text Inputs:** Candidates answer questions using either text or audio. If audio is provided, it is sent to the AI service where **Whisper** processes and transcribes the speech into text in real-time.

### C. Automated Evaluation
- **Analysis:** Once the candidate completes the test, all answers (transcriptions and text) are forwarded to the AI microservice.
- **Scoring:** The AI model evaluates the answers based on technical accuracy, relevance, and communication. It generates a detailed performance report and computes a final score.
- **Saving Results:** The score and evaluation feedback are securely saved to the MongoDB Atlas database via the backend.

### D. Final Review & Leaderboards
- **Leaderboards:** The platform automatically ranks candidates based on their AI-evaluated scores.
- **Candidate Selection:** Recruiters access their dashboard to view a leaderboard for specific job postings. They can assess candidate metrics, view the AI feedback, and make data-driven hiring decisions effortlessly.

---

## 3. High-Security AI Proctoring Engine

To ensure maximum academic integrity during the online tech interviews, a robust strict-mode proctoring system automatically runs during the test phase:

- **Pre-Exam Verification Gate**: The exam remains fundamentally locked until the AI neural networks process a live baseline facial verification snapshot. 
- **Tab & Window Freezing**: The system invokes Full-Screen mode automatically. Candidates who press `ESC` or switch to another tab natively trigger a screen-wide red lockout, freezing all test navigation until they comply and return to the exam boundaries.
- **Deep Code-Editor Paste Blocking**: Utilizing embedded `MonacoEditor` configuration traps, right-click, `CTRL+V`, and copy functions are entirely neutralized and severed natively to prevent injecting external code solutions.
- **Aggressive Absence Tracking**: Overlaid with `face-api.js` tracking intervals, if the candidate physically vanishes out of the webcam’s view for extended intervals (debounced to filter AI misfires/shifting), an amber blockage interrupts the screen, forcing them to orient effectively back into the mirror frame to continue. 
- **Real-Time Risk Scoring**: Every infraction maps directly to a dynamically compounding Risk Score schema synced via the Redux state and persistent MongoDB data modeling to notify recruiters internally.

---

## 4. Technology Stack

- **Frontend:** React 19, Vite, TailwindCSS, Redux Toolkit, Axios, Socket.io-client.
- **Backend:** Node.js, Express, Mongoose (MongoDB Atlas), Socket.io, JWT for authentication, Google Auth Library.
- **AI Microservice:** Python, FastAPI, Uvicorn, Ollama (Mistral model), Whisper (Audio Transcription), Pydub.

---

## 5. System Architecture & Communication

- **Frontend -> Backend:**
  Uses standard REST APIs pointing to `http://localhost:5001/api` (managed via `VITE_API_URL`). Axios is used for handling state-driven requests in Redux slices.
- **Backend -> AI Service:**
  The Node.js backend acts as an intermediary. It communicates with the AI microservice running on `http://localhost:8000` via internal API calls to proxy test generation, audio processing, and evaluation routines.
- **Database:** MongoDB Atlas is used as the global cloud database (`hireiq`) connecting all persistent data efficiently.

---

## 6. Installation Steps

You can run the provided single install script or run commands manually.

### Option A: Using the Installer Script
1. Navigate to the project root directory (`HIRE-IQ`).
2. Run `install.bat`. This will automatically install dependencies for the Backend, Frontend, and AI Service.

### Option B: Manual Installation
- **Frontend:** `cd frontend` -> `npm install`
- **Backend:** `cd backend` -> `npm install`
- **AI Service:** `cd ai-service` -> `python -m pip install -r requirements.txt` (Ensure Python and pip are installed).
*Note: The AI Service requires Ollama & Whisper to be functional on the host machine. You must have `ffmpeg` installed for `pydub` to process audio files.*

---

## 7. Starting the System

Before starting, ensure an active internet connection to connect to MongoDB Atlas, and ensure **Ollama** is running on your system with the `mistral` model downloaded (`ollama run mistral`).

### Option A: Using the Single Run Script
1. Open a terminal in the root directory (`HIRE-IQ`).
2. Run `run_all.bat`.
3. Three command windows will open, spinning up the Frontend, Backend, and AI Service concurrently.

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

The web application will be accessible at `http://localhost:5173` (check the frontend terminal for the exact URL).
