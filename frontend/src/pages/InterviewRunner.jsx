// frontend/src/pages/InterviewRunner.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, submitAnswer, endSession } from '../features/sessions/sessionSlice';
import MonacoEditor from '@monaco-editor/react';
import { toast } from 'react-toastify';
import ProctoringSystem from '../components/ProctoringSystem';

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
    const textAnswer = draft?.textAnswer || '';

    if (!code && !audio && !textAnswer) {
      toast.warning("Please provide an answer.");
      return;
    }

    // ✅ 1. OPTIMISTIC UPDATE: Lock UI instantly
    setSubmittedLocal(prev => ({ ...prev, [currentQuestionIndex]: true }));

    const formData = new FormData();
    formData.append('questionIndex', currentQuestionIndex);
    if (code) formData.append('code', code);
    if (audio) formData.append('audioFile', audio, 'answer.webm');
    if (textAnswer) formData.append('textAnswer', textAnswer);

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
    <ProctoringSystem sessionId={sessionId}>
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 relative">
        {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-blob"></div>

      <div className="flex justify-between items-center glass-panel p-6 rounded-[2rem] shadow-2xl mb-6 relative z-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display text-glow">{activeSession.role}</h1>
          <div className="flex gap-2 mt-3">
            {activeSession?.questions?.map((q, i) => (
              <div
                key={i}
                onClick={() => handleNavigation(i)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all shadow-glow ${i === currentQuestionIndex ? 'bg-neon-cyan scale-125 ring-2 ring-neon-cyan/50' :
                  q.isEvaluated ? 'bg-emerald-400' :
                    (q.isSubmitted || submittedLocal[i]) ? 'bg-neon-purple animate-pulse' : 'bg-space-600'
                  }`}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleFinishInterview}
          disabled={isLoading}
          className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(225,29,72,0.5)] transition-all disabled:opacity-50"
        >
          {isLoading ? "Finalizing..." : "Finish Interview"}
        </button>
      </div>

      <div className="bg-space-900 border border-white/10 text-white p-8 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-purple/20 blur-3xl rounded-full"></div>
        <span className="text-neon-cyan text-xs font-black uppercase tracking-[0.2em] text-glow">Question {currentQuestionIndex + 1}</span>
        <h2 className="text-xl sm:text-2xl mt-3 font-medium leading-relaxed font-display text-slate-100">{currentQuestion?.questionText}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {currentQuestion?.questionType === 'mcq' ? (
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center min-h-[300px] col-span-1 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Select your Answer</h3>
            <div className="space-y-4 max-w-3xl mx-auto w-full relative z-10">
              {currentQuestion.options?.map((opt, idx) => {
                const isSelected = currentDraft.textAnswer === opt;
                return (
                  <label key={idx} className={`flex items-center space-x-4 p-5 rounded-2xl cursor-pointer transition-all border ${isSelected ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_rgba(0,247,255,0.2)]' : 'border-white/5 bg-space-800 hover:bg-space-700'} ${isQuestionLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <input 
                      type="radio" 
                      name="mcq-option" 
                      value={opt} 
                      disabled={isQuestionLocked}
                      checked={isSelected}
                      onChange={(e) => {
                        if (!isQuestionLocked) {
                          setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], textAnswer: e.target.value }}));
                        }
                      }}
                      className="hidden" 
                    />
                    <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-neon-cyan' : 'border-slate-500'}`}>
                      {isSelected && <div className="w-3 h-3 bg-neon-cyan rounded-full transition-transform"></div>}
                    </div>
                    <span className="text-slate-200 text-base md:text-lg">{opt}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Verbal Answer</h3>
    
              {!isRecording && !currentDraft.audioBlob ? (
                <button
                  onClick={startRecording}
                  disabled={isQuestionLocked}
                  className="w-24 h-24 bg-space-800 border-2 border-neon-cyan/50 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,247,255,0.2)] hover:shadow-[0_0_40px_rgba(0,247,255,0.4)] hover:scale-105 transition-all disabled:opacity-50 disabled:border-slate-700 disabled:shadow-none disabled:cursor-not-allowed group"
                >
                  <span className="text-3xl group-hover:drop-shadow-[0_0_10px_#00f7ff]">🎤</span>
                </button>
              ) : isRecording ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center animate-pulse text-white text-3xl cursor-pointer shadow-[0_0_30px_rgba(244,63,94,0.6)]" onClick={stopRecording}>
                    ⏹
                  </div>
                  <p className="mt-6 font-mono text-rose-400 font-bold tracking-widest">{recordingTime}s</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-emerald-400 font-black text-lg mb-3 drop-shadow-md">Audio Captured ✅</div>
                  {!isQuestionLocked && (
                    <button onClick={() => setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], audioBlob: null } }))} className="text-xs text-slate-400 underline hover:text-rose-400 transition-colors">
                      Delete & Re-record
                    </button>
                  )}
                </div>
              )}
            </div>
    
            <div className="glass-panel p-2 rounded-3xl overflow-hidden h-[400px] flex flex-col">
              <div className="flex justify-between items-center px-4 py-3 bg-space-900 border-b border-white/5 rounded-t-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code Editor</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  disabled={isQuestionLocked}
                  className="text-xs glass-input rounded-lg px-3 py-1.5 focus:outline-none appearance-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map(l => <option key={l.value} value={l.value} className="bg-space-800">{l.label}</option>)}
                </select>
              </div>
              <div className="flex-1 rounded-b-2xl overflow-hidden">
                <MonacoEditor
                  height="100%"
                  language={selectedLanguage}
                  theme="vs-dark"
                  value={currentDraft.code || ''}
                  onChange={updateDraftCode}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    scrollBeyondLastLine: false,
                    readOnly: isQuestionLocked,
                    domReadOnly: isQuestionLocked,
                    padding: { top: 16 }
                  }}
                  onMount={(editor, monaco) => {
                    editor.onKeyDown((e) => {
                      if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV) {
                        e.preventDefault();
                        e.stopPropagation();
                        toast.error("WARNING: Pasting code is strictly prohibited!");
                      }
                    });
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {currentQuestion?.isEvaluated && (
        <div className="mt-8 bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <h3 className="text-emerald-400 font-bold mb-3 flex items-center"><span className="text-xl mr-2">🤖</span> AI Feedback</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{currentQuestion.aiFeedback}</p>
          <div className="mt-5 flex gap-4">
            <span className="bg-emerald-500/20 border border-emerald-500/50 px-4 py-1.5 rounded-xl text-xs font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Score: {currentQuestion.technicalScore}/100</span>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 glass-panel border-t-0 border-white/10 p-4 px-6 md:px-12 flex justify-between items-center z-50 rounded-t-[2rem]">
        <button
          onClick={() => handleNavigation(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
          className="text-slate-400 font-bold text-sm hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-slate-400 uppercase tracking-wider"
        >
          ← Previous
        </button>

        <div className="flex flex-col items-center">
          {/* STATUS BAR */}
          {isProcessing && message && (
            <div className="mb-3 text-xs font-mono text-neon-cyan font-bold uppercase tracking-widest animate-pulse drop-shadow-[0_0_8px_cyan]">
              🤖 {message}...
            </div>
          )}

          <button
            onClick={handleSubmitAnswer}
            disabled={isQuestionLocked}
            className={`px-10 py-3.5 rounded-2xl font-black text-white shadow-xl transition-all uppercase tracking-widest ${isProcessing ? 'bg-space-600 text-slate-400 cursor-wait shadow-none' :
              currentQuestion?.isEvaluated ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                isQuestionLocked ? 'bg-space-700 text-slate-400 shadow-none' :
                  'bg-gradient-to-r from-neon-cyan to-neon-purple hover:scale-[1.03] active:scale-[0.98] shadow-glow'
              }`}
          >
            {isProcessing ? "Analyzing..." : currentQuestion?.isEvaluated ? "Evaluated" : isQuestionLocked ? "Submitted" : "Submit Answer"}
          </button>
        </div>

        <button
          onClick={() => handleNavigation(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex === activeSession.questions.length - 1}
          className="text-slate-400 font-bold text-sm hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-slate-400 uppercase tracking-wider"
        >
          Next →
        </button>
      </div>
    </div>
    </ProctoringSystem>
  );
}

export default InterviewRunner;