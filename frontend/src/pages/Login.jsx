import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, googleLogin, reset } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import { useTheme } from '../context/ThemeContext' // imported to check theme if needed for toast

const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme } = useTheme();

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) {
      toast.error(message, { className: theme === 'dark' ? 'dark:bg-space-800 dark:text-white' : '' });
      dispatch(reset())
    }

    if (isSuccess || user) {
      if (user && user.accountRole === 'recruiter') {
        navigate('/dashboard/recruiter?tab=overview');
      } else {
        navigate('/dashboard');
      }
      dispatch(reset())
    }
  }, [user, isError, isSuccess, message, navigate, dispatch, theme])


  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    const userData = {
      email,
      password
    }
    dispatch(login(userData))
  }

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      dispatch(googleLogin(credentialResponse.credential))
    } else {
      toast.error('Something went wrong. Please try again.', { className: theme === 'dark' ? 'dark:bg-space-800 dark:text-white' : '' })
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[80vh] relative'>
        <div className="absolute w-32 h-32 bg-teal-300/30 dark:bg-neon-cyan/20 blur-xl rounded-full animate-blob"></div>
        <div className='animate-spin flex items-center justify-center rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 dark:border-neon-cyan z-10'></div>
      </div>
    )
  }

  return (
    <div className='flex justify-center items-center min-h-[85vh] relative overflow-hidden sm:px-6 py-10 transition-colors'>
      
      {/* Background Blobs (Dark Only for Galaxy Theme) */}
      <div className="hidden dark:block absolute top-10 left-10 w-72 h-72 bg-indigo-300 dark:bg-neon-purple rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 dark:opacity-30 animate-blob"></div>
      <div className="hidden dark:block absolute bottom-10 right-10 w-96 h-96 bg-teal-300 dark:bg-neon-cyan rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className='glass-panel w-full max-w-md p-8 sm:p-12 rounded-[2rem] shadow-2xl relative z-10 transition-colors' >
        <div className='text-center mb-10 transition-colors'>
          <h2 className='text-xs font-black uppercase tracking-[0.3em] text-teal-600 dark:text-neon-cyan dark:text-glow mb-3 transition-colors'>HireIQ</h2>
          <h1 className='text-3xl font-display font-black text-slate-800 dark:text-white leading-tight mb-2 transition-colors'>
            Welcome <span className='gradient-text'>Back</span>
          </h1>
          <p className='text-slate-500 dark:text-slate-400 mt-2 text-sm transition-colors'>
            Sign In to sharpen your technical skills.
          </p>
        </div>

        <form onSubmit={onSubmit} className='grid grid-cols-1 gap-6 relative z-20'>
          <div className='space-y-2 relative group'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-neon-cyan transition-colors ml-1'>Email</label>
            <input type="email" name="email" value={email} className='w-full p-4 glass-input rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600' placeholder='developer@earth.com' onChange={onChange} required />
          </div>

          <div className='space-y-2 relative group'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-neon-purple transition-colors ml-1'>Password</label>
            <input type="password" name="password" value={password} className='w-full p-4 glass-input rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600' placeholder='********' onChange={onChange} required />
          </div>

          <button type="submit" className='w-full bg-gradient-to-r from-teal-500 to-indigo-500 dark:from-neon-cyan dark:to-neon-purple text-white p-4 rounded-xl font-bold hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(0,247,255,0.4)] transition-all mt-4 active:scale-[0.98]'>
             Login to Account
          </button>
        </form>

        <div className="my-8 flex items-center transition-colors">
          <div className="flex-grow border-t border-slate-200 dark:border-space-600 transition-colors"></div>
          <span className="mx-4 text-slate-400 dark:text-slate-500 text-[10px] font-black tracking-widest uppercase transition-colors">Social Login</span>
          <div className="flex-grow border-t border-slate-200 dark:border-space-600 transition-colors"></div>
        </div>

        <div className="w-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity drop-shadow-md">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google login failed')}
            theme={theme === 'dark' ? "filled_black" : "outline"}
            size="large"
            width="100%"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
          New here? <Link to="/register" className="text-teal-600 dark:text-neon-cyan font-bold hover:text-slate-800 dark:hover:text-white transition-colors">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

export default Login