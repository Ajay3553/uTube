import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/Header'
import { Outlet } from 'react-router-dom'
import Footer from './components/Footer'

function App() {

  return (
    <div>
      <Header />
      <main className='pt-[86px]'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
