const SessionCard = ({ session, onClick, onDelete }) => {

    const isDeletable = session.status !== 'pending';
    const getIcon = () => {
        const r = session.role;

        if (r.includes('Python')) return '🐍';
        if (r.includes('MERN') || r.includes('MEAN') || r.includes('React') || r.includes('Frontend')) return '⚛️';
        if (r.includes('Data') || r.includes('Machine') || r.includes('AI')) return '📊';
        if (r.includes('DevOps') || r.includes('Cloud') || r.includes('SRE')) return '☁️';
        if (r.includes('Security') || r.includes('Cyber')) return '🛡️';
        if (r.includes('Blockchain') || r.includes('Web3')) return '⛓️';
        if (r.includes('Mobile') || r.includes('iOS') || r.includes('Android')) return '📱';
        if (r.includes('Game')) return '🎮';
        if (r.includes('UI') || r.includes('UX') || r.includes('Designer')) return '🎨';
        if (r.includes('QA') || r.includes('Test')) return '🧪';
        if (r.includes('Product') || r.includes('Manager')) return '📝';
        if (r.includes('Java') || r.includes('Backend')) return '☕';

        return '💻'; // Default
    };
    
    // Status color mapping for neo-dark theme + light theme
    const statusColor = session.status === 'completed' ? 'bg-teal-100/50 dark:bg-neon-cyan/20 text-teal-700 dark:text-neon-cyan border border-teal-200 dark:border-neon-cyan/30' : session.status === 'in-progress' ? 'bg-amber-100/80 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' : 'bg-indigo-100/50 dark:bg-neon-purple/20 text-indigo-600 dark:text-neon-purple border border-indigo-200 dark:border-neon-purple/30';

    const iconBg = session.status === 'completed' ? 'bg-white dark:bg-space-800 border-teal-200 dark:border-neon-cyan/50 text-teal-600 dark:text-neon-cyan shadow-sm dark:shadow-[0_0_10px_rgba(0,247,255,0.2)]' : 'bg-white dark:bg-space-800 border-indigo-200 dark:border-neon-purple/50 text-indigo-600 dark:text-neon-purple shadow-sm dark:shadow-[0_0_10px_rgba(183,0,255,0.2)]';

    const scoreColor = session.status === 'completed' ? (session.overallScore > 75 ? 'text-teal-600 dark:text-neon-cyan dark:drop-shadow-[0_0_8px_rgba(0,247,255,0.5)]' : 'text-amber-500 dark:text-amber-400') : 'text-slate-400 dark:text-slate-500';

    return (
        <div onClick={() => onClick(session)} className='group glass-panel hover:bg-white/90 dark:hover:bg-space-800/80 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col md:flex-row items-center gap-4 transition-all duration-300 dark:hover:shadow-[0_0_20px_rgba(0,247,255,0.15)] hover:shadow-lg hover:-translate-y-1 hover:border-teal-300 dark:hover:border-neon-cyan/30 active:scale-[0.98] cursor-pointer'>
            
            <div className='flex items-center gap-4 sm:gap-6 w-full md:w-auto flex-grow'>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl border flex items-center justify-center text-xl sm:text-2xl transition-colors ${iconBg}`}>
                  {getIcon()}
                </div>
                <div className='overflow-hidden'>
                    <h3 className='font-bold text-slate-900 dark:text-white text-base sm:text-lg truncate group-hover:text-teal-600 dark:group-hover:text-neon-cyan transition-colors font-display'>
                      {session.role}
                    </h3>
                    <div className='flex items-center gap-2 text-[10px] font-black text-slate-500 mt-1 uppercase tracking-tight transition-colors'>
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className='text-teal-600 dark:text-neon-cyan bg-teal-50 dark:bg-neon-cyan/10 px-2 py-0.5 rounded-md border border-teal-200 dark:border-neon-cyan/20 transition-colors'>{session.level}</span>
                    </div>
                </div>
            </div>

            <div className='flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t border-slate-100 dark:border-white/5 md:border-t-0 pt-4 md:pt-0 transition-colors'>
                <div className='text-left md:text-center w-24'>
                    <p className='text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors'>Global Score</p>
                    <p className={`text-xl sm:text-3xl font-black font-display font-variant-numeric:tabular-nums transition-colors ${scoreColor}`}>
                        {session.status === 'completed' ? session.overallScore : '--'}
                    </p>
                </div>

                <div className='flex flex-col items-end gap-2'>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor} text-glow transition-colors`}>
                      {session.status}
                    </span>
                    <span className='text-slate-400 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white font-bold text-xs flex items-center transition-colors'>
                        {session.status === 'completed' ? 'View Intel' : 'Resume'}
                        <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </span>
                </div>
            </div>

            <div className='hidden md:block w-px h-12 bg-slate-200 dark:bg-white/10 mx-3 transition-colors'></div>

            <button onClick={(e) => { e.stopPropagation(); if (isDeletable) onDelete(e, session._id) }} className='p-3 text-slate-400 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all' title='Terminate Session'>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    )
}

export default SessionCard