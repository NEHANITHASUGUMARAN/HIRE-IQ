import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
    const { user } = useSelector(state => state.auth);

    return (
        <div className="w-full min-h-screen text-slate-200 font-sans pb-20 relative overflow-hidden flex flex-col">
            {/* Ambient Backgrounds */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-neon-purple/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-cyan/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-blob animation-delay-2000"></div>

            {/* 1. Hero Section */}
            <section className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 relative z-10 w-full max-w-7xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-black font-display mb-6 tracking-tight text-glow">
                    HIRE-IQ – Smart <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">AI-Powered Hiring</span> Platform
                </h1>
                <p className="text-lg md:text-2xl text-slate-400 mb-10 max-w-3xl leading-relaxed">
                    Evaluate coding, communication, and aptitude in one intelligent platform. Let Artificial Intelligence streamline your technical screening.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 mb-16 w-full justify-center">
                    <Link to={user ? "/dashboard" : "/login"} className="px-10 py-4 bg-gradient-to-r from-neon-cyan to-blue-500 rounded-full font-bold text-white text-lg shadow-[0_0_20px_rgba(0,247,255,0.4)] hover:scale-105 transition-transform w-[250px] whitespace-nowrap">
                        Get Started
                    </Link>
                    <Link to="/login" className="px-10 py-4 bg-space-800 border border-white/10 rounded-full font-bold text-white text-lg hover:bg-space-700 hover:border-white/20 transition-all w-[250px] whitespace-nowrap hidden sm:flex items-center justify-center">
                        Take Demo Test
                    </Link>
                </div>
                {/* Small Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl opacity-80 mt-4">
                    <div className="flex items-center justify-center gap-3 glass-panel py-3 px-6 rounded-full border-none shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                        <span>🤖</span> AI Evaluation
                    </div>
                    <div className="flex items-center justify-center gap-3 glass-panel py-3 px-6 rounded-full border-none shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                        <span>⚡</span> Coding + MCQ + Voice
                    </div>
                    <div className="flex items-center justify-center gap-3 glass-panel py-3 px-6 rounded-full border-none shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                        <span>⏱️</span> Instant Feedback
                    </div>
                </div>
            </section>

            {/* 2. Features Section */}
            <section className="py-24 px-4 relative z-10 w-full max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black font-display mb-4">Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Features</span></h2>
                    <p className="text-slate-400">Everything you need to deeply assess a candidate's true potential.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform group border-t border-neon-cyan/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-glow transition-transform group-hover:scale-110">💻</div>
                        <h3 className="text-xl font-bold mb-3 text-white">Coding Assessment</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">Real-time logic challenge processing with integrated high-level syntax parsing.</p>
                        <ul className="text-xs text-slate-300 space-y-2 font-mono">
                            <li className="flex gap-2">✓ Test Cases</li>
                            <li className="flex gap-2">✓ 15+ Languages</li>
                        </ul>
                    </div>
                    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform group border-t border-neon-purple/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-glow transition-transform group-hover:scale-110">🎤</div>
                        <h3 className="text-xl font-bold mb-3 text-white">Voice Evaluation</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">Analyze raw conceptual understanding natively through audio logic.</p>
                        <ul className="text-xs text-slate-300 space-y-2 font-mono">
                            <li className="flex gap-2">✓ Speech-to-text</li>
                            <li className="flex gap-2">✓ Comms Scoring</li>
                        </ul>
                    </div>
                    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform group border-t border-rose-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-glow transition-transform group-hover:scale-110">🧠</div>
                        <h3 className="text-xl font-bold mb-3 text-white">MCQ Tests</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">Blast through foundational baseline concepts rapidly using auto-graded logic sets.</p>
                        <ul className="text-xs text-slate-300 space-y-2 font-mono">
                            <li className="flex gap-2">✓ Aptitude Quizzes</li>
                            <li className="flex gap-2">✓ Tech Definitions</li>
                        </ul>
                    </div>
                    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform group border-t border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-glow transition-transform group-hover:scale-110">🤖</div>
                        <h3 className="text-xl font-bold mb-3 text-white">AI Grading</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">Instant deterministic grading mapping your metrics natively into the system.</p>
                        <ul className="text-xs text-slate-300 space-y-2 font-mono">
                            <li className="flex gap-2">✓ Neutral Analysis</li>
                            <li className="flex gap-2">✓ Instant Output</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 3. How It Works */}
            <section className="py-24 px-4 bg-space-900/50 backdrop-blur-md relative z-10 w-full mt-12 mb-12 shadow-[inset_0_20px_50px_rgba(0,0,0,0.4)]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black font-display mb-4">How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-500">Works</span></h2>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-emerald-400 opacity-30"></div>

                        {[
                            { step: "1", title: "Sign Up / Login", icon: "👤", desc: "Create your verified profile." },
                            { step: "2", title: "Choose Protocol", icon: "⚙️", desc: "Select MCQ, Coding, or Oral Mixed." },
                            { step: "3", title: "Complete Assessment", icon: "💻", desc: "Execute logic inside the dashboard." },
                            { step: "4", title: "Get Evaluation", icon: "📊", desc: "AI maps your scores instantaneously." }
                        ].map((s, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center z-10 w-full md:w-1/4">
                                <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center text-3xl border-2 border-white/20 mb-6 relative hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-space-800">
                                    {s.icon}
                                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-neon-cyan text-[10px] text-space-950 font-black rounded-full flex items-center justify-center border-2 border-space-900 shadow-glow">{s.step}</div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                                <p className="text-sm text-slate-400 px-4">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Why HIRE-IQ & Demo Preview */}
            <section className="py-24 px-4 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black font-display mb-8">Why <span className="text-neon-cyan">HIRE-IQ</span>?</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 text-xl border border-emerald-500/20">⚡</div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">Fast AI Evaluation</h4>
                                <p className="text-slate-400 text-sm">Automated logic pipeline scores in milliseconds.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0 text-xl border border-blue-500/20">🎯</div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">Accurate Skill Mapping</h4>
                                <p className="text-slate-400 text-sm">Prevents bias using strictly technical grading baselines.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 shrink-0 text-xl border border-rose-500/20">📉</div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">Reduces Hiring Time</h4>
                                <p className="text-slate-400 text-sm">Save 60%+ time filtering candidates before final rounds.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0 text-xl border border-purple-500/20">📈</div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">Data-Driven Insights</h4>
                                <p className="text-slate-400 text-sm">Dashboard plotting Confidence vs Technical strength.</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mockup Preview */}
                <div className="relative w-full aspect-video glass-panel rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col group">
                    <div className="h-8 bg-space-900 border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex-1 bg-space-950 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 blur-[100px] rounded-full"></div>
                        <div className="w-1/3 h-8 bg-space-800 rounded mb-6 border border-white/5"></div>
                        <div className="flex gap-4 mb-4">
                            <div className="w-2/3 h-32 bg-space-800/80 rounded-2xl border border-white/5"></div>
                            <div className="w-1/3 h-32 bg-space-800/80 rounded-2xl border border-white/5"></div>
                        </div>
                        <div className="w-full h-40 bg-space-800/50 rounded-2xl border border-white/5 mt-auto flex items-center justify-center">
                            <span className="text-neon-cyan/50 font-mono tracking-widest uppercase text-xs font-bold">Live Coding Environment</span>
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-space-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                           <Link to="/login" className="px-6 py-2 border-2 border-neon-cyan text-neon-cyan font-bold rounded-lg uppercase tracking-widest hover:bg-neon-cyan hover:text-space-950 transition-colors">Start Simulation</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Dual Audience Split */}
            <section className="py-24 px-4 w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Students */}
                    <div className="glass-panel p-10 rounded-[2rem] border-t border-neon-cyan/50 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-space-800 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-[0_0_20px_rgba(0,247,255,0.2)]">👩‍🎓</div>
                        <h3 className="text-2xl font-black mb-4">For Students</h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">Practice real-world coding interview scenarios and get exact AI feedback to improve your technical prowess.</p>
                        <ul className="text-sm text-slate-300 space-y-3 font-mono inline-block text-left relative z-10 w-fit">
                            <li><span className="text-neon-cyan mr-2">➜</span> Real-time Practice Tests</li>
                            <li><span className="text-neon-cyan mr-2">➜</span> Identify Skill Gaps</li>
                            <li><span className="text-neon-cyan mr-2">➜</span> Instant Tech Feedback</li>
                        </ul>
                    </div>
                    {/* Recruiters */}
                    <div className="glass-panel p-10 rounded-[2rem] border-t border-neon-purple/50 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-space-800 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">🏢</div>
                        <h3 className="text-2xl font-black mb-4">For Recruiters</h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">Filter noise and hire true talent by automating the initial technical screening processes natively.</p>
                        <ul className="text-sm text-slate-300 space-y-3 font-mono inline-block text-left relative z-10 w-fit">
                            <li><span className="text-neon-purple mr-2">➜</span> Mass Candidate Filtering</li>
                            <li><span className="text-neon-purple mr-2">➜</span> Massive Time Saves</li>
                            <li><span className="text-neon-purple mr-2">➜</span> Smart Output Reports</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 7. Testimonials */}
            <section className="py-24 px-4 bg-space-900/30 border-y border-white/5 text-center mt-12 w-full shadow-[inset_0_20px_50px_rgba(0,0,0,0.4)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black font-display mb-12">Trusted by Future <span className="text-emerald-400">Leaders</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-panel p-8 rounded-2xl relative">
                            <span className="text-6xl text-white/5 absolute top-2 left-4 font-serif">"</span>
                            <p className="text-slate-300 italic mb-6 relative z-10">"Using HIRE-IQ before my real interviews gave me the confidence I needed to present my code fluidly. The Voice Evaluation was perfectly identical to my actual technical rounds!"</p>
                            <div className="flex items-center gap-4 border-t border-white/10 pt-4 mt-auto">
                                <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-blue-500 rounded-full"></div>
                                <div className="text-left">
                                    <h5 className="font-bold text-sm">Alex R.</h5>
                                    <span className="text-xs text-slate-500 font-mono">Software Engineer Candidate</span>
                                </div>
                            </div>
                        </div>
                        <div className="glass-panel p-8 rounded-2xl relative">
                            <span className="text-6xl text-white/5 absolute top-2 left-4 font-serif">"</span>
                            <p className="text-slate-300 italic mb-6 relative z-10">"Our startup deployed this platform to test 140 frontend applicants. It immediately highlighted the top 5 candidates and saved our recruiting team over 60 hours of manual testing."</p>
                            <div className="flex items-center gap-4 border-t border-white/10 pt-4 mt-auto">
                                <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-pink-500 rounded-full"></div>
                                <div className="text-left">
                                    <h5 className="font-bold text-sm">Sarah Jenkins</h5>
                                    <span className="text-xs text-slate-500 font-mono">Technical Recruiter</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Footer */}
            <footer className="pt-24 pb-8 px-4 w-full max-w-7xl mx-auto flex flex-col items-center">
                <div className="flex gap-3 items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl shadow-[0_0_15px_rgba(0,247,255,0.5)] flex items-center justify-center font-black text-white text-xl cursor-default">HQ</div>
                    <span className="text-2xl font-black tracking-tighter uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">HIRE-IQ</span>
                </div>
                <div className="flex gap-8 mb-12 text-sm font-bold text-slate-400">
                    <Link to="/login" className="hover:text-neon-cyan transition-colors uppercase tracking-widest">Platform</Link>
                    <a href="https://github.com/Antigravity-AI" className="hover:text-neon-purple transition-colors uppercase tracking-widest">GitHub</a>
                    <Link to="/" className="hover:text-emerald-400 transition-colors uppercase tracking-widest">About Us</Link>
                    <Link to="/" className="hover:text-rose-400 transition-colors uppercase tracking-widest">Contact</Link>
                </div>
                <div className="w-full border-t border-white/10 pt-8 text-center text-xs text-slate-500 font-mono uppercase tracking-widest">
                    © 2026 HIRE-IQ. Smart Platform Simulation.
                </div>
            </footer>
        </div>
    );
};

export default Home;
