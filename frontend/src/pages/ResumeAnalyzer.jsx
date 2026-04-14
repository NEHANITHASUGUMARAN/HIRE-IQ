import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResumeAnalyzer = () => {
    const { user } = useSelector(state => state.auth);
    const [resumeText, setResumeText] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if(!resumeText.trim() || !jobRole.trim()){
            toast.warning("Please fill out both the resume block and job role target.");
            return;
        }

        try {
            setIsAnalyzing(true);
            setResults(null);
            
            const res = await axios.post('/api/resume/analyze', {
                resume_text: resumeText,
                job_role: jobRole
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            setResults(res.data);
            toast.success("AI Successfully analyzed your Resume Constraints");
        } catch (error) {
            toast.error("Analysis Failed. Please try again or simplify the text payload.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 text-slate-100">
             <div className="text-center mb-10">
                 <h1 className="text-4xl font-black font-display text-glow">Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-500">Analyzer AI</span></h1>
                 <p className="text-slate-400 mt-2">Paste your resume string below to instantly map your experience matrix against real job architectures.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="glass-panel p-6 rounded-3xl">
                      <form onSubmit={handleAnalyze} className="space-y-6">
                           <div className="space-y-2">
                               <label className="text-xs font-bold tracking-widest uppercase text-neon-cyan">Target Job Role</label>
                               <input 
                                  type="text" 
                                  value={jobRole}
                                  onChange={(e) => setJobRole(e.target.value)}
                                  className="w-full bg-space-900 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-neon-cyan transition-colors"
                                  placeholder="e.g. Senior MERN Developer"
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-xs font-bold tracking-widest uppercase text-neon-purple">Resume Paste Block</label>
                               <textarea
                                  value={resumeText}
                                  onChange={(e) => setResumeText(e.target.value)}
                                  className="w-full h-[300px] bg-space-900 border border-white/10 p-4 rounded-xl text-white text-sm font-mono outline-none focus:border-neon-purple transition-colors resize-none custom-scrollbar"
                                  placeholder="John Doe\nExperience: 5 Years React..."
                               />
                           </div>
                           <button 
                               disabled={isAnalyzing}
                               className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold p-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,247,255,0.4)] disabled:opacity-50 transition-all uppercase tracking-widest text-sm"
                           >
                               {isAnalyzing ? "Analyzing Matrices..." : "Commence Scan"}
                           </button>
                      </form>
                 </div>

                 <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
                      {!results && !isAnalyzing && (
                          <div className="text-slate-500 text-center">
                              <span className="text-5xl block mb-4">🤖</span>
                              <p>Awaiting raw text payload to construct analysis.</p>
                          </div>
                      )}
                      
                      {isAnalyzing && (
                          <div className="flex flex-col items-center">
                              <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
                              <span className="text-neon-cyan font-mono animate-pulse uppercase tracking-widest">Compiling Nodes...</span>
                          </div>
                      )}

                      {results && !isAnalyzing && (
                          <div className="w-full h-full animate-in fade-in zoom-in duration-500 flex flex-col space-y-6">
                               <div className="text-center pb-6 border-b border-white/10">
                                   <div className="relative inline-block">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                           <circle className="text-space-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                                           <circle className={`transition-all duration-1000 ease-out ${results.experienceMatch > 70 ? 'text-neon-cyan' : results.experienceMatch > 40 ? 'text-yellow-400' : 'text-rose-500'}`} strokeWidth="8" strokeDasharray={314} strokeDashoffset={314 - (314 * results.experienceMatch) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-black font-display">
                                            {results.experienceMatch}%
                                        </div>
                                   </div>
                                   <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">Overall Fit</p>
                               </div>

                               <div>
                                   <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Skills Registered</h4>
                                   <div className="flex flex-wrap gap-2">
                                       {results.skillsFound.map((sk, idx) => (
                                          <span key={idx} className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 text-xs rounded-full">{sk}</span>
                                       ))}
                                       {results.skillsFound.length === 0 && <span className="text-slate-500 italic text-sm">No viable technical skills extracted.</span>}
                                   </div>
                               </div>

                               <div className="bg-space-800 p-4 rounded-xl border border-white/5 flex-1">
                                   <h4 className="text-xs uppercase tracking-widest text-neon-purple mb-2 font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></div>AI Feedback Loop</h4>
                                   <p className="text-slate-300 text-sm leading-relaxed">{results.feedback}</p>
                               </div>
                          </div>
                      )}
                 </div>
             </div>
        </div>
    );
};

export default ResumeAnalyzer;
