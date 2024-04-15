import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Forms from './Modules/forms/Forms.jsx'
import Dashboard from './Modules/dashboard/Dashboard.jsx'
import { Toaster } from 'react-hot-toast'

const ProtectedRoute = ({ children, auth = false }) => {
  const isLoggedIn = localStorage.getItem('user:token') !== null || false;

  if (!isLoggedIn && auth) {
    return <Navigate to={'/users/sign_in'} />
  } else if (isLoggedIn && ['/users/sign_in', '/users/sign_up'].includes(window.location.pathname)) {
    return <Navigate to={'/'} />
  }
  return children
}

const App = () => {
  return (
    <>
    {/* <Dashboard /> */}
      <Routes>
        <Route path='/' element={
          <ProtectedRoute auth={true}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='users/sign_in' element={
          <ProtectedRoute>
            <Forms isSignUp={true} />
          </ProtectedRoute>
        } />
        <Route path='users/sign_up' element={
          <ProtectedRoute>
            <Forms isSignUp={false} />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </>
  )
}
export default App