import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Leaderboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get('/api/leaderboard');
            setCandidates(res.data);
            setIsLoading(false);
        } catch (error) {
            toast.error("Failed to fetch global leaderboard.");
            setIsLoading(false);
        }
    };

    if (isLoading) {
         return (
             <div className="flex justify-center items-center min-h-[80vh]">
                 <div className="animate-spin w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full"></div>
             </div>
         );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 text-slate-900 dark:text-slate-100">
             <div className="text-center mb-12">
                 <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-glow uppercase">Global Ranking</h1>
                 <p className="text-slate-400 mt-4 max-w-lg mx-auto">Top AI assessed candidates stacked globally based on structural mock interview efficiency and problem-solving thresholds.</p>
             </div>

             <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,247,255,0.1)] border border-neon-cyan/20">
                 {candidates.length === 0 ? (
                      <div className="text-center text-slate-500 py-10 italic">
                          No candidates exist on the global registry yet. Take a Mock Test to be the first!
                      </div>
                 ) : (
                      <div className="space-y-4">
                          {candidates.map((candidate, index) => (
                               <div key={candidate._id} className={`flex items-center justify-between p-4 md:p-6 rounded-2xl transition-all hover:scale-[1.01] ${index === 0 ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/5 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : index === 1 ? 'bg-slate-100 dark:bg-slate-300/10 border border-slate-300 dark:border-slate-300/30' : index === 2 ? 'bg-amber-100 dark:bg-amber-700/20 border border-amber-300 dark:border-amber-700/30' : 'bg-white dark:bg-space-900 border-slate-200 dark:border-white/5 hover:border-neon-cyan/30'}`}>
                                    
                                    <div className="flex items-center gap-4 md:gap-6">
                                         <div className={`w-12 h-12 md:w-16 md:h-16 flex justify-center items-center rounded-2xl font-black text-xl md:text-2xl font-display shadow-inner ${index === 0 ? 'bg-amber-400 text-amber-900' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-100 dark:bg-space-800 text-slate-500 dark:text-slate-400'}`}>
                                             #{index + 1}
                                         </div>
                                         <div>
                                              <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white">{candidate.name}</h3>
                                              <p className="text-xs md:text-sm text-slate-400 font-mono tracking-widest">{candidate.preferredRole || "Software Engineer"}</p>
                                         </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                         <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Global Score</span>
                                         <div className={`text-2xl md:text-3xl font-black font-mono tracking-tighter ${index === 0 ? 'text-amber-400 text-glow' : 'text-neon-cyan'}`}>
                                             {candidate.totalScore.toLocaleString()}
                                         </div>
                                    </div>
                               </div>
                          ))}
                      </div>
                 )}
             </div>
        </div>
    );
};

export default Leaderboard;
