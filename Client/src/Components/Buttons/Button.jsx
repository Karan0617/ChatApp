import React from 'react'

const Button = ({
    type='button',
    label='',
    btnClassName='',
    disabled=false,
    
}) => {

  return (
    <button type={type} className={`text-white focus:outline-none px-5 py-2.5 font-medium rounded-lg text-sm ${btnClassName}`} disabled={disabled}>{label}</button>
  )
}

export default Button