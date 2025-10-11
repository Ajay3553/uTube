import React from 'react'
import Container from './Container'

function Footer() {
  return (
    <footer className='bg-blue-400 text-white py-6 mt-auto'>
      <Container>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <p className='text-black text-sm'>
            © {new Date().getFullYear()} uTube. All rights reserved.
          </p>
          <div className='flex gap-4 mt-4 md:mt-0 text-sm text-black'>
            <a href='#' className='hover:text-white transition'>About</a>
            <a href='#' className='hover:text-white transition'>Privacy</a>
            <a href='#' className='hover:text-white transition'>Terms</a>
            <a href='#' className='hover:text-white transition'>Contact</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
