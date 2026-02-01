import {useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {register,reset} from '../features/auth/authSlice'
import { useNavigate,Link } from 'react-router-dom'
import {toast} from 'react-toastify'



const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  })

  const {name,email,password,password2} = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {user,isLoading,isError,isSuccess,message} = useSelector((state) => state.auth)

  useEffect(() => {
    if(isError){
      toast.error(message)
      dispatch(reset())
    }
    if(isSuccess ){
      toast.success('User Registered Successfully')
      navigate('/')
      dispatch(reset())
    }
    if(user && !isSuccess){
      navigate('/')
      
    }
  }, [user,isError,isSuccess,message,navigate,dispatch])


  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if(password !== password2){
      toast.error('Passwords do not match')
    }else{
      const userData = {
        name,
        email,
        password
      }
      dispatch(register(userData))
    }
  }

  if(isLoading){
    return(
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
          <h1 className='text-3xl sm:text-4xl font-black text-gray-900 leading-tight'>Get <span className='text-teal-500'>Started</span></h1>
          <p className='text-gray-500 mt-3 text-sm sm:text-base px-2'>
            Join thousands of developers practicing with AI Interviewer
          </p>
        </div>

        <form onSubmit={onSubmit} className='grid grid-cols-1 gap-4'>
          <div className='space-y-1'>
            <label className='text-[10px] font-bold uppercase text-gray-400 ml-1'>Full Name</label>
            <input type="text" name="name" value={name} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all ' placeholder='Siddhant Saxena' onChange={onChange} required />
          </div>
          <div className='space-y-1'>
            <label className='text-[10px] font-bold uppercase text-gray-400 ml-1'>Email</label>
            <input type="email" name="email" value={email} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all ' placeholder='siddhant@gmail.com' onChange={onChange} required />

          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <label className='text-[10px] font-bold uppercase text-gray-400 ml-1'>Password</label>
              <input type="password" name="password" value={password} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all ' placeholder='********' onChange={onChange} required />

            </div>
            <div className='space-y-1'>
              <label className='text-[10px] font-bold uppercase text-gray-400 ml-1'>Confirm</label>
              <input type="password" name="password2" value={password2} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all ' placeholder='********' onChange={onChange} required />
            </div>
          </div>
          <button type="submit" className='w-full bg-teal-600 text-white p-3.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 mt-4 active:scale-[0.98]'>Create My Account</button>
        </form>

        <p className='mt-8 text-center text-sm text-gray-500 '>Already have an account? <Link to="/login" className='text-teal-600  font-bold hover:underline'>Sign In</Link></p>

      </div>

    </div>
  )
}

export default Register