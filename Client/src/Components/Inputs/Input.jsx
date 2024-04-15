import React from 'react'
import Button from '../Buttons/Button.jsx'

const Input = ({
  label = '',
  name = '',
  type = '',
  isrequired =true,
  placeholder = '',
  className='',
  inputClassName = 'rounded-lg focus:ring-1 focus:ring-purple-500',
  value='',
  onChange = () => {}
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={name} className='block text-md font-medium text-gray-200'>{label}</label>
      <input type={type} id={name} className={`bg-transparent border-b text-gray-400 text-sm block w-full py-3 px-2 outline-none transition-all duration-500 ${inputClassName}`} placeholder={placeholder} required={isrequired} value={value} onChange={onChange}/>
    </div> 
  )
}

export default Input