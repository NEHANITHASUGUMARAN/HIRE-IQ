import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createSession } from '../features/sessions/sessionSlice';

const JobBoard = () => {
    const { user } = useSelector(state => state.auth);
    const { isLoading } = useSelector(state => state.sessions);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get('/api/jobs');
            setJobs(res.data);
        } catch (error) {
            toast.error("Failed to fetch jobs.");
        }
    };

    const handleApply = (job) => {
        if (!user) {
            toast.warning("Please login to apply securely.");
            navigate('/login');
            return;
        }
        if (user.accountRole !== 'student') {
            toast.warning("Only candidates can execute apply flows.");
            return;
        }

        navigate(`/apply/${job._id}`);
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 text-slate-900 dark:text-slate-100">
             <div className="text-center mb-16">
                 <h1 className="text-4xl md:text-5xl font-black font-display text-glow">Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">Job Board</span></h1>
                 <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Click "Apply" to instantly launch a custom-tailored AI Mock Test graded dynamically against the Recruiter's expectations.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {jobs.length === 0 ? (
                     <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-slate-500 py-20 italic">
                         No jobs are actively listed at this moment.
                     </div>
                 ) : jobs.map(job => (
                     <div key={job._id} className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-t border-neon-purple/30">
                         <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         
                         <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{job.title}</h3>
                         <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
                             <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px]">R</span>
                             <span className="font-bold text-slate-700 dark:text-slate-300">{job.recruiterId?.name || "Anonymous Recruiter"}</span>
                         </div>

                         <p className="text-sm text-slate-400 mb-6 line-clamp-3">{job.description}</p>

                         <div className="flex flex-wrap gap-2 mb-6">
                             {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                                 <span key={idx} className="bg-slate-200 dark:bg-space-800 border border-slate-300 dark:border-white/5 px-3 py-1 rounded-full text-xs text-slate-700 dark:text-slate-300">{skill}</span>
                             ))}
                             {job.requiredSkills.length > 4 && <span className="bg-slate-200 dark:bg-space-800 border border-slate-300 dark:border-white/5 px-3 py-1 rounded-full text-xs text-slate-700 dark:text-slate-300">+{job.requiredSkills.length - 4}</span>}
                         </div>

                         <div className="border-t border-white/10 pt-4 flex justify-between items-center mt-auto">
                             <div className="flex flex-col">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Test Format</span>
                                  <span className="text-xs text-neon-cyan font-mono tracking-widest uppercase">{job.testConfig.interviewType}</span>
                             </div>

                             <button 
                                 onClick={() => handleApply(job)}
                                 disabled={isLoading}
                                 className="bg-indigo-600 hover:bg-neon-purple text-white font-bold py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50">
                                 {isLoading ? 'Processing...' : 'Apply via AI'}
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
};

export default JobBoard;
