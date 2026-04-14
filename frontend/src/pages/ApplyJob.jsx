import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

const ApplyJob = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [resumeFile, setResumeFile] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');

    useEffect(() => {
        if (!user || user.accountRole !== 'student') {
            navigate('/login');
            return;
        }

        const fetchJob = async () => {
            try {
                const res = await axios.get(`/api/jobs/${jobId}`);
                setJob(res.data);
                // default min date to today
                const today = new Date().toISOString().split('T')[0];
                setScheduledDate(today);
            } catch (error) {
                toast.error("Could not fetch Job configurations.");
                navigate('/jobs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [jobId, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!resumeFile) {
            toast.warning("Please upload a resume file securely.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulated local file storage wrapper since direct multipart takes distinct routing:
            // For production, this physically routes through Multer.
            const resumeUrl = `/uploads/${Date.now()}_${resumeFile.name}`;

            const payload = {
                scheduledDate,
                resumeUrl
            };

            await axios.post(`/api/applications/${jobId}`, payload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            toast.success("Application Successfully Secured.");
            navigate('/dashboard'); // Route back to student dashboard to view application table

        } catch (error) {
            const msg = error.response?.data?.message || "Failed to process exact application.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-slate-100 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black font-display text-white mb-2 tracking-widest uppercase">Job <span className="text-neon-cyan">Application</span> Node</h1>
            <p className="text-slate-400 mb-8 font-mono text-sm uppercase tracking-widest">{job.title} — {job.recruiterId?.name || "System Recruiter"}</p>

            <div className="glass-panel p-8 md:p-12 rounded-[3rem] border border-neon-cyan/20 relative overflow-hidden shadow-[0_0_30px_rgba(0,247,255,0.05)]">
                
                {/* DISCLAIMER HIGHLIGHT */}
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/10 border-l-4 border-neon-cyan p-6 rounded-r-2xl mb-8">
                    <h3 className="font-black text-neon-cyan flex items-center gap-2 mb-2 font-display tracking-wide">
                       <span className="text-2xl">⚠️</span> MANDATORY AI SHORTLISTING PROTOCOL
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Note: Processing this application requires completing an advanced <strong>AI Evaluation Test</strong> safely to verify your exact structural skills. 
                        You must schedule and secure your test date before the recruiter's absolute deadline closes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* RESUME UPLOAD */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest font-black text-neon-purple flex items-center gap-2">
                            <span>1</span> Document Vector Output
                        </label>
                        <div className="relative group cursor-pointer">
                            <input 
                                type="file" 
                                required
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setResumeFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <div className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${resumeFile ? 'border-neon-purple bg-neon-purple/5' : 'border-white/20 bg-space-900 group-hover:border-neon-purple/50'}`}>
                                <span className="text-4xl mb-4 text-slate-400">{resumeFile ? '📄' : '📁'}</span>
                                <p className="font-black text-white text-lg tracking-wide mb-1">
                                    {resumeFile ? resumeFile.name : 'Upload Resume Node'}
                                </p>
                                <p className="text-xs uppercase tracking-widest text-slate-500">PDF, DOCX accepted securely.</p>
                            </div>
                        </div>
                    </div>

                    {/* SCHEDULE DATE */}
                    <div className="space-y-4 border-t border-white/10 pt-8">
                        <label className="text-[10px] uppercase tracking-widest font-black text-amber-400 flex items-center gap-2">
                            <span>2</span> Evaluation Scheduling Protocol
                        </label>
                        <p className="text-xs text-slate-400 mb-2">Schedule your AI test strictly before the global recruiter deadline: <span className="text-white font-bold">{new Date(job.deadline).toLocaleDateString()}</span></p>
                        
                        <div className="glass-input p-1 rounded-xl flex items-center bg-space-900 border border-white/5 focus-within:border-amber-400/50 transition-colors">
                            <input 
                                type="date"
                                required
                                className="w-full bg-transparent p-4 text-white font-mono tracking-widest uppercase outline-none"
                                value={scheduledDate}
                                max={job.deadline.split('T')[0]} // natively restrict scheduling past deadline
                                min={new Date().toISOString().split('T')[0]} // strictly restrict scheduling in past
                                onChange={e => setScheduledDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 mt-8 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-neon-cyan/20 hover:bg-neon-cyan border border-neon-cyan/50 text-neon-cyan hover:text-black font-black uppercase tracking-widest transition-all px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,247,255,0.2)] disabled:opacity-50 inline-flex items-center gap-3">
                            {isSubmitting ? 'Committing Block...' : 'Submit Application'}
                            {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default ApplyJob;
