import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResumeAnalyzer = () => {
    const { user } = useSelector(state => state.auth);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [inputType, setInputType] = useState('file'); // 'file' or 'text'
    const [jobRole, setJobRole] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are supported format at this time.');
                setResumeFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size exceeds 5MB limit.');
                setResumeFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setResumeFile(file);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        
        if (!jobRole.trim()) {
            toast.warning("Please provide a target job role.");
            return;
        }

        if (inputType === 'file' && !resumeFile) {
            toast.warning("Please upload a PDF resume.");
            return;
        }

        if (inputType === 'text' && !resumeText.trim()) {
            toast.warning("Please paste your resume text.");
            return;
        }

        try {
            setIsAnalyzing(true);
            setResults(null);
            
            let formData;
            let headers = { Authorization: `Bearer ${user.token}` };

            if (inputType === 'file') {
                formData = new FormData();
                formData.append('resumePdf', resumeFile);
                formData.append('job_role', jobRole);
                headers['Content-Type'] = 'multipart/form-data';
            } else {
                formData = {
                    resume_text: resumeText,
                    job_role: jobRole
                };
            }
            
            const res = await axios.post('/api/resume/analyze', formData, { headers });
            
            setResults(res.data);
            toast.success("AI Successfully analyzed your Resume Constraints");
        } catch (error) {
            toast.error(error.response?.data?.message || "Analysis Failed. Please try again or simplify the text payload.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 text-slate-100">
             <div className="text-center mb-10">
                 <h1 className="text-4xl font-black font-display text-glow">Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-500">Analyzer AI</span></h1>
                 <p className="text-slate-400 mt-2 text-lg">Upload your PDF resume to instantly map your ATS compatability score.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="glass-panel p-6 rounded-3xl h-fit">
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

                           <div className="space-y-4">
                                <div className="flex bg-space-900 border border-white/10 rounded-xl p-1 relative">
                                    <button
                                        type="button"
                                        onClick={() => setInputType('file')}
                                        className={`flex-1 py-2 text-sm font-bold tracking-widest uppercase rounded-lg transition-all z-10 ${inputType === 'file' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Upload PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputType('text')}
                                        className={`flex-1 py-2 text-sm font-bold tracking-widest uppercase rounded-lg transition-all z-10 ${inputType === 'text' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Paste Text
                                    </button>
                                    {/* Animated Pill Background */}
                                    <div 
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-neon-cyan/80 to-blue-500/80 rounded-lg transition-transform duration-300 ease-out`}
                                        style={{ transform: inputType === 'file' ? 'translateX(0)' : 'translateX(100%)' }}
                                    ></div>
                                </div>

                                {inputType === 'file' ? (
                                    <div className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center bg-space-900/50 hover:bg-space-900 transition-colors relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf,application/pdf"
                                            className="hidden" 
                                        />
                                        <div className="text-5xl mb-4">📄</div>
                                        {resumeFile ? (
                                            <div className="text-center">
                                                <p className="text-neon-cyan font-bold">{resumeFile.name}</p>
                                                <p className="text-slate-400 text-sm mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setResumeFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="mt-4 text-xs text-rose-500 hover:text-rose-400 uppercase tracking-widest font-bold">Remove File</button>
                                            </div>
                                        ) : (
                                            <div className="text-center pointer-events-none">
                                                <p className="text-white font-bold mb-1">Click to Upload PDF Resume</p>
                                                <p className="text-slate-500 text-sm">Max size 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                   <div className="space-y-2">
                                       <textarea
                                          value={resumeText}
                                          onChange={(e) => setResumeText(e.target.value)}
                                          className="w-full h-[250px] bg-space-900 border border-white/10 p-4 rounded-xl text-white text-sm font-mono outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                                          placeholder="John Doe\nExperience: 5 Years React..."
                                       />
                                   </div>
                                )}
                           </div>

                           <button 
                               disabled={isAnalyzing}
                               className="w-full bg-gradient-to-r from-neon-cyan to-blue-600 text-white font-bold p-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,247,255,0.4)] disabled:opacity-50 transition-all uppercase tracking-widest text-sm relative overflow-hidden group"
                           >
                                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                               {isAnalyzing ? "Analyzing Matrices..." : "Commence Scan"}
                           </button>
                      </form>
                 </div>

                 <div className="glass-panel p-6 rounded-3xl flex flex-col min-h-[500px]">
                      {!results && !isAnalyzing && (
                          <div className="text-slate-500 flex-1 flex flex-col items-center justify-center">
                              <div className="w-32 h-32 mb-6 border-4 border-dashed border-slate-700 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <span className="text-5xl -rotate-[10s]">🧠</span>
                              </div>
                              <p className="text-lg">Awaiting payload injection.</p>
                              <p className="text-sm mt-2 opacity-60">Upload a PDF to see ATS Score, Missing Skills, and Feedback.</p>
                          </div>
                      )}
                      
                      {isAnalyzing && (
                          <div className="flex flex-col items-center justify-center flex-1">
                              <div className="w-20 h-20 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-6"></div>
                              <div className="text-neon-cyan font-mono animate-pulse uppercase tracking-widest flex items-center gap-2">
                                  <span>Parsing Nodes</span>
                                  <span className="flex space-x-1">
                                      <span className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                      <span className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                      <span className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                                  </span>
                              </div>
                          </div>
                      )}

                      {results && !isAnalyzing && (
                          <div className="w-full h-full animate-in fade-in zoom-in duration-500 flex flex-col gap-6 custom-scrollbar overflow-y-auto pr-2">
                               {/* ATS Score Header */}
                                <div className="text-center pb-6 border-b border-white/10 flex flex-col items-center bg-space-900/40 p-6 rounded-2xl">
                                    <div className="relative inline-block mb-2">
                                        <svg className="w-40 h-40 transform -rotate-90">
                                            <circle className="text-space-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="60" cx="80" cy="80"/>
                                            <circle 
                                                className={`transition-all duration-1000 ease-out shadow-[0_0_20px_currentColor] ${(results.atsScore || results.experienceMatch) > 75 ? 'text-emerald-500' : (results.atsScore || results.experienceMatch) > 50 ? 'text-yellow-400' : 'text-rose-500'}`} 
                                                strokeWidth="10" 
                                                strokeDasharray={377} 
                                                strokeDashoffset={377 - (377 * (results.atsScore || results.experienceMatch || 0)) / 100} 
                                                strokeLinecap="round" 
                                                stroke="currentColor" 
                                                fill="transparent" 
                                                r="60" cx="80" cy="80"
                                            />
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                            <span className="text-4xl font-black font-display">
                                                {results.atsScore || results.experienceMatch || 0}%
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg uppercase tracking-widest text-slate-300 font-black">ATS Match Score</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Calculated against: <span className="text-neon-cyan">{jobRole}</span></p>
                                </div>

                                {/* Skills Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-space-900/60 p-4 rounded-xl border border-emerald-500/20">
                                        <h4 className="text-xs uppercase tracking-widest text-emerald-400 mb-3 font-bold flex items-center gap-2">
                                            <span className="p-1 bg-emerald-500/20 rounded-full">✅</span> Current Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {results.skillsFound?.length > 0 ? results.skillsFound.map((sk, idx) => (
                                                <span key={idx} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 text-xs rounded-full font-medium">{sk}</span>
                                            )) : <span className="text-slate-500 italic text-sm">No specific skills detected.</span>}
                                        </div>
                                    </div>

                                    <div className="bg-space-900/60 p-4 rounded-xl border border-rose-500/20">
                                        <h4 className="text-xs uppercase tracking-widest text-rose-400 mb-3 font-bold flex items-center gap-2">
                                            <span className="p-1 bg-rose-500/20 rounded-full">❌</span> Missing Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {results.missingSkills?.length > 0 ? results.missingSkills.map((sk, idx) => (
                                                <span key={idx} className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-1 text-xs rounded-full font-medium">{sk}</span>
                                            )) : <span className="text-slate-500 italic text-sm">None identified! Excellent.</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Improvement Checklist */}
                                {results.improvements && results.improvements.length > 0 && (
                                    <div className="bg-gradient-to-br from-space-800 to-space-900 p-5 rounded-xl border border-yellow-500/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
                                        <h4 className="text-xs uppercase tracking-widest text-yellow-400 mb-4 font-bold flex items-center gap-2">
                                            <span className="p-1 bg-yellow-500/20 rounded-full">💡</span> Actionable Improvements
                                        </h4>
                                        <ul className="space-y-3 relative z-10">
                                            {results.improvements.map((imp, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm bg-space-900/50 p-3 rounded-lg border border-white/5">
                                                    <span className="text-yellow-500 mt-0.5 opacity-80">▹</span>
                                                    <span className="leading-relaxed">{imp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* AI Formatted Feedback */}
                                <div className="bg-space-800/80 p-5 rounded-xl border border-neon-purple/30 relative">
                                    <h4 className="text-xs uppercase tracking-widest text-neon-purple mb-3 font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse shadow-[0_0_10px_#9d00ff]"></div>
                                        Executive AI Summary
                                    </h4>
                                    <p className="text-slate-200 text-sm leading-relaxed border-l-2 border-neon-purple/50 pl-4 py-1 italic">"{results.feedback}"</p>
                                </div>
                          </div>
                      )}
                 </div>
             </div>
        </div>
    );
};

export default ResumeAnalyzer;
