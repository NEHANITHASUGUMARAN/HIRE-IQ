import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile, reset } from '../features/auth/authSlice';

const ROLES = [
  "MERN Stack Developer", "MEAN Stack Developer", "Full Stack Python", "Full Stack Java", "Frontend Developer", "Backend Developer", "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer", "Cloud Engineer (AWS/Azure/GCP)", "Cybersecurity Engineer", "Blockchain Developer", "Mobile Developer (iOS/Android)", "Game Developer", "UI/UX Designer", "QA Automation Engineer", "Product Manager"
];

const inputBase = 'w-full glass-input bg-white dark:bg-space-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-semibold text-slate-800 dark:text-white outline-none focus:border-teal-500 dark:focus:border-neon-cyan transition-colors';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isSuccess, isError, message, isProfileLoading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferredRole: '',
    skills: '',
  });

  // Safe Initialization
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        preferredRole: user?.preferredRole || '',
        skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (typeof user?.skills === 'string' ? user.skills : ''),
      });
    }
  }, [user]);

  useEffect(() => {
    if (isError) {
      toast.error(message, { className: 'dark:bg-space-800 dark:text-white' });
    }
    if (isSuccess) {
      toast.success('Profile Updated Successfully', { className: 'dark:bg-space-800 dark:text-white' });
      setIsEditing(false);
    }
    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const baseSkills = typeof formData.skills === 'string' ? formData.skills : '';
    const submittedSkills = baseSkills.split(',').map(s => s.trim()).filter(s => s);
    const existingSkills = Array.isArray(user?.skills) ? user.skills : [];
    const skillsUnchanged = submittedSkills.length === existingSkills.length && submittedSkills.every((val, index) => val === existingSkills[index]);

    if (formData.name === user?.name && formData.preferredRole === user?.preferredRole && skillsUnchanged) {
      toast.info('No changes to save.', { className: 'dark:bg-space-800 dark:text-white' });
      setIsEditing(false);
      return;
    }
    dispatch(updateProfile({
       ...formData,
       skills: submittedSkills
    }));
  };

  if (!user) {
     return (
       <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
       </div>
     )
  }

  // Derive initials for avatar safely
  const rawName = typeof user.name === 'string' ? user.name.trim() : '';
  const nameParts = rawName ? rawName.split(' ') : [];
  let initials = 'AI';
  if (nameParts.length > 0) {
    initials = nameParts.map(n => n[0] || '').join('').substring(0, 2).toUpperCase() || 'AI';
  }
  
  const displaySkills = Array.isArray(user?.skills) ? user.skills : (typeof user?.skills === 'string' ? [user.skills] : []);

  return (
    <div className='max-w-5xl mx-auto px-4 py-8 sm:py-12 pb-24'>
      
      {/* LinkedIn-Style Profile Card */}
      <div className='glass-panel rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-space-900 border border-slate-200 dark:border-white/5 relative'>
        
        {/* Banner with Safe Tailwind - NO CUSTOM SVG ENCODING */}
        <div className="h-48 sm:h-64 bg-gradient-to-tr from-teal-900 via-indigo-900 to-space-900 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan via-transparent to-transparent"></div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 sm:px-10 pb-10 relative">
            
            {/* Avatar & Edit Button */}
            <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-space-900 bg-gradient-to-br from-teal-400 to-indigo-500 dark:from-neon-cyan dark:to-neon-purple flex items-center justify-center text-4xl sm:text-6xl font-black text-white shadow-xl relative z-10 shrink-0">
                    {initials}
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white text-white hover:text-black transition-all border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg mb-2 flex items-center gap-2 shrink-0 z-10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        Edit Profile
                    </button>
                )}
            </div>

            {/* View Mode vs Edit Mode */}
            {!isEditing ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white">{user.name || "Unknown User"}</h1>
                        <h2 className="text-xl sm:text-2xl text-slate-500 dark:text-slate-300 font-medium mt-1">{user.preferredRole || "No Role Set"}</h2>
                        <p className="text-sm font-mono text-teal-600 dark:text-neon-cyan mt-3 uppercase tracking-widest">{user.email || "No Email"} • HIRE-IQ Candidate</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                        
                        {/* About / Summary Stub */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">About</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Passionate {user.preferredRole || 'technologist'} actively training on the HIRE-IQ platform. Specializing in highly scalable architectures and robust software patterns. Dedicated to continuous learning and AI-driven skill mapping.
                            </p>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mt-4 max-w-sm">
                                <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-1">Global Platform Score</p>
                                <p className="text-2xl font-black text-emerald-300 font-mono tracking-tighter shadow-sm">{user.totalScore || 0}</p>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Featured Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {displaySkills.length > 0 ? displaySkills.map((sk, idx) => (
                                    <span key={idx} className="bg-slate-100 dark:bg-space-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                                        {sk}
                                    </span>
                                )) : (
                                    <p className="text-slate-500 italic text-sm">No specific skills listed yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="mb-6 flex justify-between items-center border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Profile Info</h2>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className='space-y-6 max-w-2xl'>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Full Name</label>
                            <input type="text" className={inputBase} name="name" value={formData.name} onChange={handleChange} placeholder='Enter your name' required />
                        </div>

                        <div className="space-y-2 opacity-70">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address (Locked)</label>
                            <input type="email" className={`${inputBase} bg-space-800/50 cursor-not-allowed text-slate-500`} disabled value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Headline (Target Role)</label>
                            <div className='relative'>
                                <select name="preferredRole" value={formData.preferredRole} onChange={handleChange} className={`${inputBase} cursor-pointer appearance-none`}>
                                    {ROLES.map((role) => <option key={role} value={role} className="bg-space-800 text-white">{role}</option>)}
                                </select>
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Skills (Comma Separated)</label>
                            <input type="text" className={inputBase} name="skills" value={formData.skills} onChange={handleChange} placeholder='React, Node, Python, AWS...' />
                        </div>

                        <div className='pt-6 flex gap-4'>
                            <button type='submit' disabled={isProfileLoading} className={`flex-1 py-4 font-bold rounded-xl transition-all shadow-glow hover:scale-[1.02] ${isProfileLoading ? 'bg-space-800 text-slate-500 cursor-wait' : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'}`}>
                                {isProfileLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className='w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full' />
                                        Saving...
                                    </span>
                                ) : 'Save Modifications'}
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 font-bold rounded-xl bg-space-800 text-white hover:bg-space-700 transition-colors border border-white/5">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;