import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logout, reset } from "../features/auth/authSlice"
import { useTheme } from "../context/ThemeContext"

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass-panel sticky top-0 z-50 py-3 mb-6 border-b border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group shrink-0">
          <div className="bg-white dark:bg-space-700 border border-teal-200 dark:border-neon-cyan/30 p-1.5 rounded-lg group-hover:rotate-12 dark:group-hover:shadow-[0_0_15px_rgba(0,247,255,0.4)] group-hover:shadow-md transition-all duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="font-display text-lg sm:text-xl font-black tracking-tighter uppercase text-slate-800 dark:text-white transition-colors">
            Hire<span className="gradient-text font-bold">IQ</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          
          <button 
            onClick={toggleTheme} 
            className="p-2 mr-2 rounded-full bg-slate-100 dark:bg-space-800 text-slate-500 dark:text-slate-300 hover:text-teal-600 dark:hover:text-neon-cyan hover:bg-slate-200 dark:hover:bg-space-700 transition-colors shadow-sm"
            aria-label="Toggle Theme"
            title="Toggle Day/Night Mode"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> // Sun
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> // Moon
            )}
          </button>

          {user ? (
            user.accountRole === 'recruiter' ? (
              <>
                <Link to="/dashboard/recruiter?tab=overview" className={`text-sm font-bold uppercase tracking-widest transition-all ${location.search.includes('tab=overview') || !location.search ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Dashboard</Link>
                <Link to="/dashboard/recruiter?tab=create" className={`text-sm font-bold uppercase tracking-widest transition-all ${location.search.includes('tab=create') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Create Job</Link>
                <Link to="/dashboard/recruiter?tab=candidates" className={`text-sm font-bold uppercase tracking-widest transition-all ${location.search.includes('tab=candidates') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Candidates</Link>
                <Link to="/leaderboard" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/leaderboard') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Rankings</Link>
                <Link to="/dashboard/recruiter?tab=analytics" className={`text-sm font-bold uppercase tracking-widest transition-all ${location.search.includes('tab=analytics') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Analytics</Link>
                
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-space-900/60 px-4 py-1.5 rounded-full border border-slate-200 dark:border-space-700 shadow-inner">
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-green-400 rounded-full animate-pulse blur-[1px]"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">{user.name}</span>
                </div>
                <button onClick={onLogout} className="bg-slate-900 dark:bg-white text-white dark:text-space-900 text-sm font-bold uppercase tracking-widest py-2 px-5 rounded-xl transition-all hover:scale-105 shadow-md">Logout</button>
              </>
            ) : (
              <>
                <Link to="/jobs" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/jobs') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Jobs</Link>
                <Link to="/leaderboard" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/leaderboard') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Rankings</Link>
                <Link to="/dashboard" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/dashboard') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Dashboard</Link>
                <Link to="/dashboard/resume" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/dashboard/resume') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Resume AI</Link>
                <Link to="/dashboard/profile" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/dashboard/profile') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Profile</Link>
                
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-space-900/60 px-4 py-1.5 rounded-full border border-slate-200 dark:border-space-700 shadow-inner">
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-green-400 rounded-full animate-pulse blur-[1px]"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">{user.name}</span>
                </div>
                <button onClick={onLogout} className="bg-slate-900 dark:bg-white text-white dark:text-space-900 text-sm font-bold uppercase tracking-widest py-2 px-5 rounded-xl transition-all hover:scale-105 shadow-md">Logout</button>
              </>
            )
          ) : (
            <div className="flex items-center space-x-6">
              <Link to="/jobs" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/jobs') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Jobs</Link>
              <Link to="/leaderboard" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/leaderboard') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow text-glow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Rankings</Link>
              <Link to="/login" className={`text-sm font-bold uppercase tracking-widest transition-all ${isActive('/login') ? 'text-teal-600 dark:text-neon-cyan dark:text-glow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Login</Link>
              <Link to="/register" className={`bg-gradient-to-r from-teal-500 to-indigo-500 dark:from-neon-cyan dark:to-neon-purple text-white text-sm font-bold uppercase tracking-widest py-2 px-5 rounded-xl transition-all hover:scale-105 hover:shadow-lg dark:hover:shadow-glow`}>Register</Link>
            </div>
          )}
        </nav>

        {/* Mobile Nav Toggles */}
        <div className="md:hidden flex items-center space-x-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg bg-slate-100 dark:bg-space-800 text-slate-500 dark:text-slate-300 hover:text-teal-600 dark:hover:text-neon-cyan"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> 
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> 
            )}
          </button>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg bg-white dark:bg-space-800 border border-slate-200 dark:border-space-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-neon-cyan dark:hover:border-neon-cyan/50 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-50 dark:bg-space-900 border-t border-slate-200 dark:border-space-700 animate-in slide-in-from-top-2 duration-300 mt-3 w-full shadow-2xl absolute">
          <div className="px-6 py-8 space-y-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3 mb-6 p-4 glass-panel rounded-2xl">
                   <div className="w-3 h-3 bg-teal-500 dark:bg-neon-cyan rounded-full animate-pulse"></div>
                   <span className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-slate-200">{user.name}</span>
                </div>
                {user.accountRole === 'recruiter' ? (
                  <>
                    <Link to="/dashboard/recruiter?tab=overview" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${location.search.includes('tab=overview') || !location.search ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Dashboard</Link>
                    <Link to="/dashboard/recruiter?tab=create" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${location.search.includes('tab=create') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Create Job</Link>
                    <Link to="/dashboard/recruiter?tab=candidates" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${location.search.includes('tab=candidates') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Candidates</Link>
                    <Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/leaderboard') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Rankings</Link>
                    <Link to="/dashboard/recruiter?tab=analytics" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${location.search.includes('tab=analytics') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Analytics</Link>
                    <button onClick={onLogout} className="w-full mt-6 bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-neon-purple dark:to-pink-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg dark:shadow-[0_0_15px_rgba(183,0,255,0.4)] active:scale-95 transition-all">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/jobs" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/jobs') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Jobs</Link>
                    <Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/leaderboard') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Rankings</Link>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/dashboard') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Dashboard</Link>
                    <Link to="/dashboard/resume" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/dashboard/resume') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Resume AI</Link>
                    <Link to="/dashboard/profile" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/dashboard/profile') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Profile</Link>
                    <button onClick={onLogout} className="w-full mt-6 bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-neon-purple dark:to-pink-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg dark:shadow-[0_0_15px_rgba(183,0,255,0.4)] active:scale-95 transition-all">Logout</button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/jobs" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/jobs') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Jobs</Link>
                <Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/leaderboard') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Rankings</Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest border-b border-slate-200 dark:border-space-800 ${isActive('/login') ? 'text-teal-600 dark:text-neon-cyan' : 'text-slate-600 dark:text-slate-400'}`}>Login</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className={`block py-4 text-xl font-black uppercase tracking-widest ${isActive('/register') ? 'text-indigo-600 dark:text-neon-purple dark:glow' : 'text-slate-600 dark:text-slate-400'}`}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header