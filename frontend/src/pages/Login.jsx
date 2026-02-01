import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, googleLogin, reset } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset())
    }

    if (isSuccess || user) {
      navigate('/');
      dispatch(reset())
    }


  }, [user, isError, isSuccess, message, navigate, dispatch])



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
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500'></div>
      </div>
    )
  }

  return (
    <div className='flex justify-center items-center min-h-[90vh] bg-gray-50 sm:px-6 py-10'>
      <div className='w-full max-w-md bg-white p-6 sm:p-10 border border-gray-200 rounded-2xl shadow-xl' >
        <div className='text-center mb-8'>
          <h2 className='text-xs font-black uppercase tracking-[0.3em] text-teal-600 mb-2'>AI Interviewer</h2>
          <h1 className='text-3xl sm:text-4xl font-black text-gray-900 leading-tight'>Welcome <span className='text-teal-500'>Back</span></h1>
          <p className='text-gray-500 mt-3 text-sm sm:text-base px-2'>
            Sign In to sharpen your technical skills.
          </p>
        </div>

        <form onSubmit={onSubmit} className='grid grid-cols-1 gap-4'>

          <div className='space-y-1'>
            <label className='text-[10px] font-bold uppercase text-gray-400 ml-1'>Email</label>
            <input type="email" name="email" value={email} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all ' placeholder='siddhant@gmail.com' onChange={onChange} required />

          </div>

          <div className='space-y-1'>
            <label className='text-[10px] font-bold uppercase text-gray-400 ml-1'>Password</label>
            <input type="password" name="password" value={password} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all ' placeholder='********' onChange={onChange} required />

          </div>


          <button type="submit" className='w-full bg-teal-600 text-white p-3.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 mt-4 active:scale-[0.98]'>Login to Account</button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-400 text-[10px] font-black tracking-widest uppercase">Social Login</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="w-full flex items-center justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google login failed')}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="circle"
          />
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          New here? <Link to="/register" className="text-teal-600 font-bold hover:underline">Create an account</Link>
        </p>

      </div>
    </div>


  )
}

export default Login