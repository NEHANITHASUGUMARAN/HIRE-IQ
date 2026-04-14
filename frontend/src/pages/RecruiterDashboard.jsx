import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RecruiterDashboard = () => {
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    const [jobs, setJobs] = useState([]);
    const [allApplications, setAllApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'overview';

    useEffect(() => {
        if (!user || user.accountRole !== 'recruiter') {
            navigate('/dashboard');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const jobsRes = await axios.get('/api/jobs/recruiter/my-jobs', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const jobsArray = Array.isArray(jobsRes.data) ? jobsRes.data : [];
            setJobs(jobsArray);

            // Fetch applications for ALL jobs linearly for Analytics & Candidate tables.
            let apps = [];
            for (let j of jobsArray) {
                try {
                    const appRes = await axios.get(`/api/applications/job/${j._id}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    const appsArray = Array.isArray(appRes.data) ? appRes.data : [];
                    // Attach job reference explicitly for filtering
                    const configuredApps = appsArray.map(a => ({ ...a, jobData: j }));
                    apps = [...apps, ...configuredApps];
                } catch(e) {
                    console.error("Failed to map application matrix loop.");
                }
            }
            setAllApplications(apps);
        } catch (error) {
            toast.error("Failed to sync structural ecosystem data");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[80vh]">
                <div className="animate-spin w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full shadow-[0_0_15px_rgba(183,0,255,0.4)]"></div>
            </div>
        );
    }

    // Dynamic Navigation Renderer
    return (
        <div className="max-w-[1400px] mx-auto py-8 px-4 text-slate-900 dark:text-slate-100">
             <div className="animate-in fade-in zoom-in-95 duration-500 mt-2">
                 {currentTab === 'overview' && <OverviewTab jobs={jobs} applications={allApplications} user={user} refreshData={fetchDashboardData} />}
                 {currentTab === 'create' && <CreateJobTab user={user} refreshData={fetchDashboardData} navigate={navigate} />}
                 {currentTab === 'candidates' && <CandidatesTab applications={allApplications} user={user} refreshData={fetchDashboardData} />}
                 {currentTab === 'analytics' && <AnalyticsTab applications={allApplications} />}
             </div>
        </div>
    );
};

// ----------------------------------------------------
// TAB 1: OVERVIEW CONTROL PANEL
// ----------------------------------------------------
const OverviewTab = ({ jobs, applications, user, refreshData }) => {
    const activeTestsCount = jobs.length; // Active Job equals Active Test portal
    const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to completely erase this Live Listing?")) return;
        try {
            await axios.delete(`/api/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success("Job mapping permanently deleted.");
            refreshData();
        } catch (error) {
            toast.error("Failed to delete secure listing.");
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black font-display uppercase tracking-widest text-slate-800 dark:text-slate-200">System <span className="text-neon-cyan text-glow-none">Overview</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Job Posts" value={jobs.length} icon="🏢" color="from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400" />
                <StatCard title="Total Applicants" value={applications.length} icon="👥" color="from-neon-purple/20 to-fuchsia-500/10 border-neon-purple/30 text-neon-purple" />
                <StatCard title="Active Tests" value={activeTestsCount} icon="⚡" color="from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400" />
                <StatCard title="Shortlisted Candidates" value={shortlistedCount} icon="🏆" color="from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400" />
            </div>
            
            {jobs.length === 0 ? (
                <div className="glass-panel p-8 rounded-3xl mt-8 flex flex-col items-center justify-center border-dashed border-white/10 text-slate-400">
                    <span className="text-3xl mb-4">🚀</span>
                    <p className="font-mono tracking-widest uppercase text-center text-sm">Dashboard is actively tracking {applications.length} candidates securely via Edge Cloud protocols.</p>
                </div>
            ) : (
                <div className="mt-12">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
                        Live Active Postings
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {jobs.map(job => {
                            const appliedCount = applications.filter(a => a.jobData?._id === job._id).length;
                            return (
                                <div key={job._id} className="glass-panel p-6 rounded-[2rem] border border-white/5 relative group hover:border-neon-cyan/20 transition-all flex flex-col justify-between shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                    {/* Action Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{job.title}</h4>
                                            <p className="text-[10px] font-mono text-neon-purple uppercase mt-1">Domain Floor: {job.experienceLevel}</p>
                                        </div>
                                        <button onClick={() => handleDelete(job._id)} className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 p-2 rounded-xl transition-all shadow-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    
                                    {/* Data Blocks */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {job.requiredSkills.map(sk => <span key={sk} className="text-[10px] font-bold text-slate-300 bg-space-800 border border-white/5 px-2 py-1 rounded">{sk}</span>)}
                                    </div>

                                    {/* Stats Footer */}
                                    <div className="border-t border-white/10 pt-4 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                                            <span className="text-xl">👥</span>
                                            {appliedCount} Candidates Applied
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex flex-col items-end">
                                            <span>Difficulty Protocol</span>
                                            <span className="text-neon-cyan">{job.testConfig?.difficulty || 'Standard'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className={`glass-panel p-6 rounded-[2rem] border transition-all hover:scale-[1.02] bg-gradient-to-br ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs uppercase tracking-widest opacity-80 font-bold">{title}</p>
                <h3 className="text-5xl font-black font-display mt-2 drop-shadow-xl">{value}</h3>
            </div>
            <span className="text-3xl bg-white/5 p-3 rounded-2xl">{icon}</span>
        </div>
    </div>
);

// ----------------------------------------------------
// TAB 2: CREATE JOB
// ----------------------------------------------------
const CreateJobTab = ({ user, refreshData, navigate }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', requiredSkills: '', testInterviewType: 'coding-mix', difficulty: 'Junior', experienceLevel: 'Junior', deadline: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
                experienceLevel: formData.experienceLevel,
                deadline: formData.deadline,
                testConfig: { interviewType: formData.testInterviewType, difficulty: formData.difficulty }
            };
            await axios.post('/api/jobs', payload, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success("Job Portal Uploaded Securely.");
            refreshData();
            navigate('?tab=overview');
        } catch (error) {
            console.error("Payload Mapping Flaw:", error);
            const serverMessage = error.response?.data?.message || error.message || "Failed to process payload.";
            toast.error(`Backend System Denied: ${serverMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-panel max-w-3xl border-neon-cyan/20 p-8 md:p-10 rounded-[2.5rem] shadow-[0_0_30px_rgba(0,247,255,0.05)] mx-auto">
             <h2 className="text-2xl font-black mb-8 border-b border-slate-300 dark:border-white/5 pb-4 uppercase tracking-widest text-slate-800 dark:text-slate-300">Construct Job Matrix</h2>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-neon-cyan font-bold">Job Title</label>
                    <input required type="text" className="w-full glass-input p-4 rounded-xl font-bold bg-space-900 border-white/5 focus:border-neon-cyan" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-neon-purple font-bold">Targeted Skills (Comma Separated)</label>
                    <input required type="text" className="w-full glass-input p-4 rounded-xl bg-space-900 border-white/5 focus:border-neon-purple font-mono text-sm" placeholder="React, Python, AWS" value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Description Block</label>
                    <textarea required className="w-full glass-input p-4 rounded-xl h-32 bg-space-900 border-white/5 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Experience Floor</label>
                    <select className="w-full glass-input p-4 rounded-xl bg-space-900 border-white/5 text-sm font-bold" value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})}>
                        <option value="Junior">Junior / Entry</option>
                        <option value="Mid-Level">Mid-Level Robust</option>
                        <option value="Senior">Senior Architect</option>
                        <option value="Any">Not Constrained</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Application Deadline</label>
                    <input type="date" required className="w-full glass-input p-4 rounded-xl bg-space-900 border-white/5 text-sm uppercase tracking-widest text-slate-300 pointer-events-auto" style={{colorScheme: 'dark'}} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">AI Interview Type</label>
                    <select className="w-full glass-input p-4 rounded-xl bg-space-900 border-white/5 text-sm font-bold" value={formData.testInterviewType} onChange={e => setFormData({...formData, testInterviewType: e.target.value})}>
                        <option value="coding-mix">Coding + Theory</option>
                        <option value="mcq">Absolute MCQ Arrays</option>
                        <option value="oral-only">Verbal Concept Only</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Assessment Difficulty</label>
                    <select className="w-full glass-input p-4 rounded-xl bg-space-900 border-white/5 text-sm font-bold" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                        <option value="Junior">Standard Parameter</option>
                        <option value="Mid-Level">Advanced Tuning</option>
                        <option value="Senior">Strict Evaluation</option>
                    </select>
                 </div>

                 <button disabled={isSubmitting} type="submit" className="md:col-span-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-black uppercase tracking-widest py-4 mt-6 rounded-2xl shadow-glow active:scale-95 transition-all">
                     {isSubmitting ? 'Compiling Server Vectors...' : 'Publish LIVE Listing'}
                 </button>
             </form>
        </div>
    );
};

// ----------------------------------------------------
// TAB 3: CANDIDATES + FILTER DATABASE & DETAIL VIEW
// ----------------------------------------------------
const CandidatesTab = ({ applications, user, refreshData }) => {
    const [selectedApp, setSelectedApp] = useState(null); // Detail Modal
    
    // Filters
    const [skillFilter, setSkillFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [scoreThreshold, setScoreThreshold] = useState(0);

    const filteredApps = useMemo(() => {
        return applications.filter(app => {
            const hasSkill = skillFilter ? app.jobData.requiredSkills.join('').toLowerCase().includes(skillFilter.toLowerCase()) : true;
            const hasStatus = statusFilter ? app.status === statusFilter : true;
            const meetsScore = app.overallScore !== null ? app.overallScore >= scoreThreshold : scoreThreshold === 0;
            return hasSkill && hasStatus && meetsScore;
        });
    }, [applications, skillFilter, statusFilter, scoreThreshold]);

    const updateStatus = async (appId, status) => {
        try {
            await axios.put(`/api/applications/${appId}/status`, { status }, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success(`Candidate flag shifted to ${status}`);
            refreshData();
            if(selectedApp) setSelectedApp({...selectedApp, status});
        } catch (error) {
            toast.error("Pipeline shift failed");
        }
    };

    return (
        <div>
            {/* Filter Hub */}
            <div className="glass-panel p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 border-dashed border-white/10 items-center justify-between bg-space-900/50">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    <input type="text" placeholder="Filter by Skills (e.g. React)..." className="glass-input p-3 rounded-xl text-sm" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} />
                    <select className="glass-input p-3 rounded-xl text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending Sync</option>
                        <option value="Tested">Tested (AI Result)</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <div className="flex items-center gap-3 glass-input px-4 py-2 rounded-xl">
                         <label className="text-xs uppercase tracking-widest text-neon-cyan font-bold shrink-0">Min Score: {scoreThreshold}</label>
                         <input type="range" min="0" max="100" className="w-full accent-neon-cyan cursor-pointer" value={scoreThreshold} onChange={e => setScoreThreshold(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-space-800/80 border-b border-white/10 text-xs uppercase tracking-widest text-slate-400">
                                <th className="p-5 font-bold">Candidate</th>
                                <th className="p-5 font-bold">Job Role Matrix</th>
                                <th className="p-5 font-bold">AI Score</th>
                                <th className="p-5 font-bold">Pipeline Status</th>
                                <th className="p-5 font-bold text-center">Action Vector</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApps.length === 0 ? (
                                <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No candidates match the exact analytic thresholds.</td></tr>
                            ) : filteredApps.map(app => (
                                <tr key={app._id} className="border-b border-white/5 hover:bg-space-800/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-slate-900 dark:text-white text-lg">{app.candidateId?.name || "Deleted Candidate"}</p>
                                        <p className="text-xs text-slate-500">{app.candidateId?.email || "Unknown Email"}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-sm font-bold text-slate-300">{app.jobData.title}</p>
                                        <p className="text-[10px] uppercase font-mono text-neon-purple">{app.jobData.experienceLevel}</p>
                                    </td>
                                    <td className="p-5">
                                        {app.overallScore !== null ? (
                                            <span className="text-xl font-black font-mono text-neon-cyan text-glow-none">{app.overallScore}</span>
                                        ) : <span className="text-slate-500 italic text-xs">Waiting...</span>}
                                    </td>
                                    <td className="p-5">
                                         <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg border ${
                                                app.status === 'Shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                                app.status === 'Tested' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                'bg-slate-700/50 text-slate-400 border-slate-600'
                                            }`}>
                                                {app.status}
                                            </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button onClick={() => setSelectedApp(app)} className="bg-white/10 hover:bg-white text-white hover:text-black py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Inspect Profile</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAIL MODAL POPUP */}
            {selectedApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-space-900/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-space-900 border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-teal-900 to-indigo-900 p-8 pt-12 pb-24 relative">
                             <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all">X</button>
                             <div className="flex justify-between items-end relative z-10">
                                 <div>
                                     <h2 className="text-4xl font-black font-display tracking-tight text-white">{selectedApp.candidateId?.name || "Deleted Candidate"}</h2>
                                     <p className="text-teal-300 font-mono text-sm tracking-widest uppercase mt-2">{selectedApp.candidateId?.email || "Unknown"}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">Overall Matrix Match</p>
                                     <div className="text-6xl font-black font-mono text-white text-glow-none tracking-tighter">
                                         {selectedApp.overallScore !== null ? selectedApp.overallScore : '?'}
                                     </div>
                                 </div>
                             </div>
                             {/* Decorative Curve */}
                             <svg className="absolute bottom-0 left-0 w-full text-space-900 translate-y-1" viewBox="0 0 1440 100" fill="currentColor"><path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path></svg>
                        </div>
                        
                        {/* Body */}
                        <div className="p-8 -mt-10 relative z-20 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                             
                             <div className="space-y-6">
                                 <div className="glass-panel p-6 rounded-3xl border-t border-l border-white/10 shadow-lg">
                                     <h4 className="text-[10px] uppercase tracking-widest font-bold text-neon-cyan mb-4">Role Fit Parameters</h4>
                                     <p className="text-sm font-bold text-slate-300 mb-1">Applying For: <span className="text-white">{selectedApp.jobData.title}</span></p>
                                     <p className="text-sm font-bold text-slate-300">Test Path: <span className="text-white uppercase font-mono">{selectedApp.jobData.testConfig?.interviewType || 'N/A'}</span></p>
                                 </div>

                                 <div className="glass-panel p-6 rounded-3xl border-t border-l border-teal-500/10 shadow-lg bg-teal-900/10">
                                     <h4 className="text-[10px] uppercase tracking-widest font-bold text-teal-400 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>Candidate Profile Overview</h4>
                                     <p className="text-sm font-bold text-slate-300 mb-1">Career Goal: <span className="text-white">{selectedApp.candidateId?.preferredRole || "Not specified"}</span></p>
                                     <p className="text-sm font-bold text-slate-300 mb-4">Global Career Score: <span className="text-neon-cyan font-mono">{selectedApp.candidateId?.totalScore || 0}</span></p>
                                     
                                     <p className="text-[10px] uppercase tracking-widest font-bold text-teal-300 mb-2">Registered Skills Array</p>
                                     <div className="flex flex-wrap gap-2">
                                          {(selectedApp.candidateId?.skills || []).map((sk, idx) => (
                                              <span key={idx} className="bg-teal-500/10 border border-teal-500/30 text-teal-400 px-3 py-1 text-[10px] font-mono rounded">{sk}</span>
                                          ))}
                                          {(!selectedApp.candidateId?.skills || selectedApp.candidateId.skills.length === 0) && <span className="text-slate-500 italic text-[10px]">Candidate has not uploaded skills.</span>}
                                     </div>
                                 </div>
                             </div>

                             <div className="space-y-6">
                                 <div className="glass-panel p-6 rounded-3xl border-white/5 bg-space-800 flex items-center justify-between">
                                      <div>
                                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Current Node Status</p>
                                          <p className="text-xl font-bold mt-1 text-white">{selectedApp.status}</p>
                                      </div>
                                      <div className="flex gap-2">
                                          {selectedApp.status !== 'Shortlisted' && <button onClick={() => updateStatus(selectedApp._id, 'Shortlisted')} className="bg-emerald-500 text-black font-black uppercase tracking-widest py-3 px-6 rounded-xl hover:scale-105 transition-all text-xs">Shortlist</button>}
                                          {selectedApp.status !== 'Rejected' && <button onClick={() => updateStatus(selectedApp._id, 'Rejected')} className="bg-rose-500 text-white font-black uppercase tracking-widest py-3 px-6 rounded-xl hover:scale-105 transition-all text-xs">Reject</button>}
                                      </div>
                                 </div>

                                 <div className="glass-panel p-6 rounded-3xl border-t border-l border-emerald-500/10 shadow-lg bg-emerald-900/10">
                                     <h4 className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>AI Interview Vector Record</h4>
                                     <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-4">{selectedApp.resumeAiSummary || "AI Testing data has not been thoroughly extracted or generated yet."}</p>
                                 </div>

                                 <div className="glass-panel p-6 rounded-3xl border border-neon-purple/20 bg-space-900">
                                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-neon-purple mb-4">Required Architectures</h4>
                                      <div className="flex flex-wrap gap-2">
                                          {selectedApp.jobData.requiredSkills.map((sk, idx) => (
                                              <span key={idx} className="bg-space-800 border border-white/10 text-white px-3 py-1 text-[10px] font-mono rounded overflow-hidden relative group">
                                                  <div className="absolute inset-0 bg-neon-purple/10 translate-y-full group-hover:translate-y-0 transition-all"></div>
                                                  <span className="relative z-10">{sk}</span>
                                              </span>
                                          ))}
                                      </div>
                                 </div>
                             </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------
// TAB 4: ANALYTICS OVERLAY
// ----------------------------------------------------
const AnalyticsTab = ({ applications }) => {
    // Pure aggregate math.
    const testedApps = applications.filter(a => a.overallScore !== null && a.overallScore > 0);
    const totalAttempted = testedApps.length;
    const avgScore = totalAttempted > 0 ? (testedApps.reduce((sum, a) => sum + a.overallScore, 0) / totalAttempted).toFixed(1) : 0;
    const highestScore = totalAttempted > 0 ? Math.max(...testedApps.map(a => a.overallScore)) : 0;
    const lowestScore = totalAttempted > 0 ? Math.min(...testedApps.map(a => a.overallScore)) : 0;

    return (
        <div className="space-y-8">
             <div className="text-center md:text-left mb-10">
                 <h2 className="text-3xl font-black font-display uppercase tracking-widest text-slate-800 dark:text-slate-200">Global <span className="text-neon-cyan text-glow-none">Analytics</span></h2>
                 <p className="text-slate-400 mt-2">Macro analysis spanning the entire active Recruiter environment.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Aggregate Grid */}
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-space-900 border border-white/5 p-6 rounded-3xl">
                         <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-2">Total Evaluated</p>
                         <h3 className="text-4xl font-black text-slate-200">{totalAttempted}</h3>
                     </div>
                     <div className="bg-space-900 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-xl rounded-full"></div>
                         <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold text-emerald-400 mb-2">Maximum Score</p>
                         <h3 className="text-4xl font-black text-emerald-300 font-mono tracking-tighter">{highestScore}</h3>
                     </div>
                     <div className="bg-space-900 border border-rose-500/30 p-6 rounded-3xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-xl rounded-full"></div>
                         <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold text-rose-400 mb-2">Minimum Threshold</p>
                         <h3 className="text-4xl font-black text-rose-300 font-mono tracking-tighter">{lowestScore}</h3>
                     </div>
                     <div className="bg-gradient-to-br from-neon-cyan/20 to-blue-500/10 border border-neon-cyan/50 p-6 rounded-3xl shadow-[0_0_20px_rgba(0,247,255,0.1)]">
                         <p className="text-[10px] uppercase tracking-widest font-bold text-neon-cyan mb-2">Average Global Score</p>
                         <h3 className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-md">{avgScore}</h3>
                     </div>
                 </div>

                 {/* Visualization Sandbox */}
                 <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center items-center relative overflow-hidden min-h-[300px]">
                      {totalAttempted > 0 ? (
                           <div className="w-full space-y-4 relative z-10">
                               <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-6 border-b border-white/10 pb-4">Standard Deviation Graph Matrix</p>
                               {[
                                   { label: '> 80 (Elite)', count: testedApps.filter(a => a.overallScore >= 80).length, color: 'bg-emerald-400' },
                                   { label: '60 - 79 (Standard)', count: testedApps.filter(a => a.overallScore >= 60 && a.overallScore < 80).length, color: 'bg-amber-400' },
                                   { label: '< 60 (Deficient)', count: testedApps.filter(a => a.overallScore < 60).length, color: 'bg-rose-400' },
                               ].map(bar => (
                                   <div key={bar.label} className="w-full">
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span>{bar.label}</span>
                                            <span>{bar.count} candidates</span>
                                        </div>
                                        <div className="w-full bg-space-800 rounded-full h-3 overflow-hidden border border-white/5">
                                            <div className={`${bar.color} h-full rounded-full transition-all duration-1000 ease-in-out`} style={{width: `${(bar.count / totalAttempted) * 100}%`}}></div>
                                        </div>
                                   </div>
                               ))}
                           </div>
                      ) : (
                          <div className="text-center text-slate-500">
                             <div className="text-5xl mb-4 opacity-50">🧭</div>
                             <p>Awaiting live candidate payload aggregates to construct tracking graphs.</p>
                          </div>
                      )}
                      
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYwYyIvPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>
                 </div>
             </div>
        </div>
    );
};

export default RecruiterDashboard;
