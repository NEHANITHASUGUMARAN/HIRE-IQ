import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createSession, getSessions,reset,deleteSession } from '../features/sessions/sessionSlice'
import { toast } from 'react-toastify'
import SessionCard from "../components/SessionCard"
import axios from 'axios';

const ROLES = [
  "MERN Stack Developer", "MEAN Stack Developer", "Full Stack Python", "Full Stack Java", "Frontend Developer", "Backend Developer", "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer", "Cloud Engineer (AWS/Azure/GCP)", "Cybersecurity Engineer", "Blockchain Developer", "Mobile Developer (iOS/Android)", "Game Developer", "UI/UX Designer", "QA Automation Engineer", "Product Manager"
];
const LEVELS = ["Junior", "Mid-Level", "Senior"];
const TYPES = [
  { label: 'Oral only', value: 'oral-only' }, 
  { label: 'Coding Mix', value: 'coding-mix' },
  { label: 'MCQ (Multiple Choice)', value: 'mcq' }
];
const COUNTS = [5, 10, 15];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sessions, isLoading, isGenerating, isError, message } = useSelector((state) => state.sessions);
  const [activeApps, setActiveApps] = useState([]);
  const [localProcessing, setLocalProcessing] = useState(false);
  const isProcessing = isGenerating || localProcessing;

  const [formData, setFormData] = useState({
    role: user.preferredRole || ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  });

  useEffect(() => {
    if (user && user.accountRole === 'recruiter') {
        navigate('/dashboard/recruiter?tab=overview');
        return;
    }
    dispatch(getSessions());

    // Fetch Native Job Applications
    const fetchApplications = async () => {
        try {
            const res = await axios.get('/api/applications/me', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setActiveApps(res.data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchApplications();
  }, [dispatch, user, navigate]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === 'count' ? parseInt(value, 10) : value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createSession(formData));
  }

  const viewSession = (session) => {
    if (session.status === 'completed') {
      navigate(`/review/${session._id}`);
    } else if(session.status === 'in-progress') {
      navigate(`/interview/${session._id}`);
    }else{
      toast.info('Session not ready yet')
    }
  }


  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this session?')) {
      dispatch(deleteSession(sessionId));
      toast.error('Session Deleted')
    }
  }

  const executeApplicationTest = async (app) => {
      const job = app.jobId;
      setLocalProcessing(true);
      try {
          // 1. Generate Interview Session explicitly mapped against Recruiter constraints
          const sessionPayload = {
              role: job.title,
              interviewType: job.testConfig?.interviewType || 'coding-mix',
              count: job.testConfig?.questionCount || 5,
              level: job.testConfig?.difficulty || 'Mid-Level'
          };
          
          const sessionAction = await dispatch(createSession(sessionPayload)).unwrap();
          const sessionId = sessionAction.sessionId;
          
          // 2. Map generated session ID to Application
          await axios.put(`/api/applications/${app._id}`, { sessionResultId: sessionId }, {
              headers: { Authorization: `Bearer ${user.token}` }
          });

          // 3. Remove immediate navigation. Let the global socket handler (QUESTIONS_READY) perform the navigation once the session is truly ready.
          // navigate(`/interview/${sessionId}`);

      } catch (error) {
          toast.error("AI Node failed to spool custom test.");
          setLocalProcessing(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 animate-in duration-700 relative">
      
      {/* FULLSCREEN AI PROCESSING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-[#020008]/90 backdrop-blur-xl transition-all">
            <div className="text-center p-8 glass-panel rounded-[3rem] shadow-2xl relative overflow-hidden">
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 dark:via-neon-cyan to-transparent animate-pulse shadow-[0_0_15px_#00f7ff]"></div>
                
                <div className="w-24 h-24 border-4 border-slate-200 dark:border-space-700 border-t-teal-500 dark:border-t-neon-cyan rounded-full animate-spin mx-auto shadow-glow"></div>
                
                <h2 className="mt-8 text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-display tracking-tight text-glow">
                  Initializing <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500 dark:from-neon-cyan dark:to-neon-purple">Neural Engine</span>
                </h2>
                
                <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                  Allocating computational resources and generating customized technical evaluations...
                </p>
                <div className="mt-6 text-[10px] font-black tracking-[0.3em] uppercase text-teal-600 dark:text-neon-cyan animate-pulse">
                  Please Wait
                </div>
            </div>
        </div>
      )}

      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/10 dark:bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6 sm:pb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight font-display transition-colors">
            Welcome, <span className="gradient-text">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-lg font-medium transition-colors">Ready for your technical prep?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex sm:block items-center gap-2 shadow-sm dark:shadow-[0_0_15px_rgba(0,247,255,0.1)]">
            <p className="text-[10px] text-teal-600 dark:text-neon-cyan font-black uppercase tracking-widest text-glow">Total Sessions</p>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none drop-shadow-sm transition-colors">{sessions.length}</p>
          </div>
        </div>
      </div>

      {/* ACTIVE JOB APPLICATIONS HUB */}
      {activeApps.length > 0 && (
         <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 flex items-center px-2 font-display">
              <span className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 text-sm sm:text-lg">🏢</span>
              Scheduled Applications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeApps.map(app => (
                    <div key={app._id} className="glass-panel p-6 rounded-[2rem] border border-neon-cyan/20 relative shadow-[0_0_15px_rgba(0,247,255,0.05)] border-l-4 border-l-neon-cyan">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black dark:text-white text-slate-800">{app.jobId?.title || "Deleted Job"}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{app.status} • Scheduled for {new Date(app.scheduledDate).toLocaleDateString()}</p>
                            </div>
                            <span className="bg-neon-purple/10 border border-neon-purple/30 text-neon-purple font-mono uppercase text-[10px] px-3 py-1 rounded">
                                {app.jobId?.testConfig?.interviewType ? app.jobId.testConfig.interviewType.replace('-', ' ') : "Dynamic"}
                            </span>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            {app.status === 'Pending' ? (
                                <button onClick={() => executeApplicationTest(app)} disabled={isProcessing} className="bg-gradient-to-r from-neon-cyan to-blue-500 text-white font-black uppercase tracking-widest px-6 py-2 rounded-xl text-xs hover:scale-105 transition-all shadow-glow">
                                    Execute AI Test
                                </button>
                            ) : (
                                <button disabled className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-widest px-6 py-2 rounded-xl text-xs flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                    Test Completed
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
         </div>
      )}

      <div className="glass-panel rounded-2xl sm:rounded-[2.5rem] overflow-hidden relative">
        {/* Subtle border glow effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 dark:via-neon-cyan/50 to-transparent"></div>
        
        <div className="bg-white/80 dark:bg-space-900/80 backdrop-blur-md px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-100 dark:border-white/5 transition-colors">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center transition-colors">
            <span className="bg-teal-500 dark:bg-neon-cyan w-1.5 h-5 rounded-full mr-3 shadow-md dark:shadow-[0_0_10px_#00f7ff] transition-all"></span>
            <span className="font-display tracking-wide">New Interview</span>
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 items-end relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 transition-colors">Role</label>
            <select name="role" value={formData.role} onChange={onChange} className="w-full glass-input rounded-xl sm:rounded-2xl p-3 text-sm font-semibold focus:outline-none appearance-none cursor-pointer">
              {ROLES.map((role) => <option key={role} value={role} className="text-black bg-white">{role}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:contents">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 transition-colors">Level</label>
              <select name="level" value={formData.level} onChange={onChange} className="w-full glass-input rounded-xl sm:rounded-2xl p-3 text-sm font-semibold focus:outline-none appearance-none cursor-pointer">
                {LEVELS.map((level) => <option key={level} value={level} className="text-black bg-white">{level}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 transition-colors">Length</label>
              <select name="count" value={formData.count} onChange={onChange} className="w-full glass-input rounded-xl sm:rounded-2xl p-3 text-sm font-semibold focus:outline-none appearance-none cursor-pointer">
                {COUNTS.map((count) => <option key={count} value={count} className="text-black bg-white">{count} Qs</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 transition-colors">Type</label>
            <select name="interviewType" value={formData.interviewType} onChange={onChange} className="w-full glass-input rounded-xl sm:rounded-2xl p-3 text-sm font-semibold focus:outline-none appearance-none cursor-pointer">
              {TYPES.map((type) => <option key={type.value} value={type.value} className="text-black bg-white">{type.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={isProcessing} className={`w-full h-[48px] rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-glow hover:scale-[1.02] active:scale-[0.98] ${isProcessing ? 'bg-slate-300 dark:bg-space-700 opacity-70 cursor-not-allowed text-slate-500 dark:text-white' : 'bg-gradient-to-r from-teal-500 to-indigo-500 dark:from-neon-cyan dark:to-neon-purple text-white'}`}>
            {isProcessing ? <><span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full border-slate-500 dark:border-white"></span></> : <span className="text-sm tracking-wide">Start System</span>}
          </button>
        </form>
      </div> 

      {/* HISTORY LIST */}
      <div className="space-y-6 pb-20 sm:pb-0">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 flex items-center px-2 font-display transition-colors">
          <span className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 text-sm sm:text-lg shadow-sm dark:shadow-inner transition-colors">📊</span>
          Interview History
        </h2>
        {isLoading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-teal-500 dark:border-neon-cyan rounded-full"></div>
          </div>
        ) : (
          sessions.length === 0 ? (
            <div className="glass-panel border-dashed border-slate-300 dark:border-white/20 rounded-2xl sm:rounded-[2rem] py-16 sm:py-20 text-center transition-colors">
              <p className="text-slate-500 dark:text-slate-400 font-bold text-base sm:text-lg tracking-widest uppercase transition-colors">No sessions instantiated.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard key={session._id} session={session} onClick={viewSession} onDelete={handleDelete}/>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
export default Dashboard