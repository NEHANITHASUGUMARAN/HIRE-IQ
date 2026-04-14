import {useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {register,reset} from '../features/auth/authSlice'
import { useNavigate,Link } from 'react-router-dom'
import {toast} from 'react-toastify'
import { useTheme } from '../context/ThemeContext'

const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    accountRole: 'student'
  })

  const {name,email,password,password2,accountRole} = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme } = useTheme();

  const {user,isLoading,isError,isSuccess,message} = useSelector((state) => state.auth)

  useEffect(() => {
    if(isError){
      toast.error(message, { className: theme === 'dark' ? 'dark:bg-space-800 dark:text-white' : '' })
      dispatch(reset())
    }
    if(isSuccess ){
      toast.success('User Registered Successfully', { className: theme === 'dark' ? 'dark:bg-space-800 dark:text-white' : '' })
      if (user && user.accountRole === 'recruiter') {
        navigate('/dashboard/recruiter?tab=overview')
      } else {
        navigate('/dashboard')
      }
      dispatch(reset())
    }
    if(user && !isSuccess){
      if (user.accountRole === 'recruiter') {
        navigate('/dashboard/recruiter?tab=overview')
      } else {
        navigate('/dashboard')
      }
    }
  }, [user,isError,isSuccess,message,navigate,dispatch, theme])


  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if(password !== password2){
      toast.error('Passwords do not match', { className: theme === 'dark' ? 'dark:bg-space-800 dark:text-white' : '' })
    }else{
      const userData = {
        name,
        email,
        password,
        accountRole
      }
      dispatch(register(userData))
    }
  }

  if(isLoading){
    return(
      <div className='flex justify-center items-center min-h-[80vh] relative'>
        <div className="absolute w-32 h-32 bg-indigo-300/30 dark:bg-neon-purple/20 blur-xl rounded-full animate-blob"></div>
        <div className='animate-spin flex items-center justify-center rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 dark:border-neon-purple z-10'></div>
      </div>
    )
  }

  return (
    <div className='flex justify-center items-center min-h-[85vh] relative overflow-hidden sm:px-6 py-10 transition-colors'>

      {/* Background Blobs (Dark Only for Galaxy Theme) */}
      <div className="hidden dark:block absolute top-1/4 right-10 w-72 h-72 bg-teal-300 dark:bg-neon-cyan rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-30 dark:opacity-20 animate-blob"></div>
      <div className="hidden dark:block absolute bottom-1/4 left-10 w-96 h-96 bg-indigo-300 dark:bg-neon-purple rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-40 dark:opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className='glass-panel w-full max-w-md p-8 sm:p-12 rounded-[2rem] shadow-2xl relative z-10 transition-colors' >
        <div className='text-center mb-10 transition-colors'>
          <h2 className='text-xs font-black uppercase tracking-[0.3em] text-indigo-500 dark:text-neon-purple dark:text-glow-purple mb-3 transition-colors'>HireIQ</h2>
          <h1 className='text-3xl font-display font-black text-slate-800 dark:text-white leading-tight mb-2 transition-colors'>
            Get <span className='gradient-text'>Started</span>
          </h1>
          <p className='text-slate-500 dark:text-slate-400 mt-2 text-sm transition-colors'>
            Join thousands of developers practicing with AI.
          </p>
        </div>

        <form onSubmit={onSubmit} className='grid grid-cols-1 gap-5 relative z-20'>
          <div className='space-y-2 relative group'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-neon-cyan transition-colors ml-1'>Full Name</label>
            <input type="text" name="name" value={name} className='w-full p-3.5 glass-input rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600' placeholder='Nehanitha' onChange={onChange} required />
          </div>
          
          <div className='space-y-2 relative group'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-neon-purple transition-colors ml-1'>Email</label>
            <input type="email" name="email" value={email} className='w-full p-3.5 glass-input rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600' placeholder='developer@earth.com' onChange={onChange} required />
          </div>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-2 relative group'>
              <label className='text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-neon-cyan transition-colors ml-1'>Password</label>
              <input type="password" name="password" value={password} className='w-full p-3.5 glass-input rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600' placeholder='********' onChange={onChange} required />
            </div>
            <div className='space-y-2 relative group'>
              <label className='text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-neon-cyan transition-colors ml-1'>Confirm</label>
              <input type="password" name="password2" value={password2} className='w-full p-3.5 glass-input rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600' placeholder='********' onChange={onChange} required />
            </div>
          </div>
          
          <div className='flex items-center gap-4 mt-2 mb-2'>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${accountRole === 'student' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 dark:bg-neon-purple/20 dark:border-neon-purple dark:text-neon-purple' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-space-800'}`}>
              <input type="radio" name="accountRole" value="student" checked={accountRole === 'student'} onChange={onChange} className="hidden" />
              👨‍🎓 Student
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${accountRole === 'recruiter' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 dark:bg-neon-purple/20 dark:border-neon-purple dark:text-neon-purple' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-space-800'}`}>
               <input type="radio" name="accountRole" value="recruiter" checked={accountRole === 'recruiter'} onChange={onChange} className="hidden" />
               🏢 Recruiter
            </label>
          </div>

          <button type="submit" className='w-full bg-gradient-to-r from-indigo-500 to-pink-500 dark:from-neon-purple dark:to-pink-600 text-white p-4 rounded-xl font-bold hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(183,0,255,0.4)] transition-all mt-2 active:scale-[0.98]'>
            Create My Account
          </button>
        </form>

        <p className='mt-8 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors'>
          Already have an account? <Link to="/login" className='text-indigo-600 dark:text-neon-purple font-bold hover:text-slate-800 dark:hover:text-white transition-colors'>Sign In</Link>
        </p>

      </div>
    </div>
  )
}

export default Register