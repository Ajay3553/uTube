import React from 'react'

function Loader({ size = 'medium' }) {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4'
  }

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  )
}

export default Loader
