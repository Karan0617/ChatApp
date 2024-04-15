import React, { useState, useEffect } from 'react'
import Input from '../../Components/Inputs/Input.jsx'
import Button from '../../Components/Buttons/Button.jsx'
import { useNavigate } from 'react-router-dom'

const Forms = ({
  isSignUp = true,
}) => {
  const [data, setData] = useState({
    ...(!isSignUp && {
      fullName: ''
    }),
    email: '',
    password: ''
  })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:2000/api/${isSignUp ? 'login' : 'register'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (res.status === 400) {
      alert('Invalid Input')
    } else {
      const resData = await res.json()
      if (resData.token) {
        localStorage.setItem('user:token', resData.token)
        localStorage.setItem('user:detail', JSON.stringify(resData.user))
        navigate('/')
      }
    }
  }

  return (
    <div className='h-screen bg-gray-800 flex items-center justify-center'>
      <div className='bg-transparent text-white w-[600px] h-[550px] gap-4 shadow-lg shadow-purple-800 rounded-2xl flex flex-col justify-center items-center'>
        <div className='text-center'>
          <div className='text-4xl font-semibold'>Welcome {isSignUp && 'Back'}</div>
          <div className='capitalize text-lg font-normal'>{isSignUp ? 'Signin to explore' : 'Signup to get started'} </div>
        </div>
        <form className='w-full flex flex-col items-center justify-center gap-6 mt-4' onSubmit={(e) => handleSubmit(e)}>
          {isSignUp ? '' : <Input label="Full Name" name="name" placeholder="Enter Your Full Name" className='w-[60%]' value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} />}
          <Input label="Email Address" type='email' name="email" placeholder="Enter Your Email" className='w-[60%]' value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          <Input label="Password" type="password" name="password" placeholder="Enter Your Password" className='w-[60%]' value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
          <Button label={isSignUp ? 'Sign In' : 'Sign Up'} type='submit' btnClassName="w-[60%] formBtn" />
        </form>
        <div className='text-sm'>{isSignUp ? "Didn't have an account? " : "Already have an account? "}
          <span className="text-purple-400 underline cursor-pointer" onClick={() => navigate(`/users/${isSignUp ? 'sign_up' : 'sign_in'}`)}> {isSignUp ? 'Sign Up' : 'Sign In'}</span>
        </div>
      </div>
    </div>
  )
}

export default Forms