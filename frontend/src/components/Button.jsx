import React from 'react'

function Button({
  children,
  type = 'button',
  bgColor = 'bg-blue-600',
  textColor = 'text-white',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} ${className} hover:opacity-90 transition-opacity`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
