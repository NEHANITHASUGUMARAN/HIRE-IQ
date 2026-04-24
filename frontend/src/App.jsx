import React from 'react'
import { Routes, Route } from 'react-router-dom'
import useSocket from './hooks/useSocket';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import InterviewRunner from './pages/InterviewRunner';
import SessionReview from './pages/SessionReview';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import JobBoard from './pages/JobBoard';
import ApplyJob from './pages/ApplyJob';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Leaderboard from './pages/Leaderboard';

const App = () => {
  useSocket();
  return (
    <div className='min-h-screen bg-transparent transition-colors duration-500'>
      <Header />
      <main className='container mx-auto p-4'>
          <ErrorBoundary>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              
              <Route path='/jobs' element={<JobBoard />} />
              <Route path='/apply/:jobId' element={<ApplyJob />} />
              <Route path='/leaderboard' element={<Leaderboard />} />
              
              <Route path='/dashboard' element={<PrivateRoute />}>
                <Route index element={<Dashboard />} />
                <Route path='profile' element={<Profile />} />
                <Route path='recruiter' element={<RecruiterDashboard />} />
                <Route path='resume' element={<ResumeAnalyzer />} />
              </Route>
              
              <Route path='/' element={<PrivateRoute />}>
                <Route path='/interview/:sessionId' element={<InterviewRunner />} />
                <Route path="/review/:sessionId" element={<SessionReview />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>

      </main>
      <ToastContainer position='top-right' autoClose={3000}/>

    </div>
  )
}

export default App