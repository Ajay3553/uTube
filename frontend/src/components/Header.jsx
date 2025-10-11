import { useNavigate } from 'react-router-dom'
import { FiSettings } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import Container from './Container'
import logo from '../images/logo.png'

function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const navItems = [
    { name: 'Home', slug: '/', active: true },
    { name: 'Tweets', slug: '/tweet', active: true },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className='py-3 bg-blue-400 fixed top-0 left-0 right-0 w-full z-50 shadow-md'>
      <Container>
        <nav className='relative flex items-center justify-center'>
          {/* Logo - left */}
          <div className='h-[50px] w-[50px] absolute left-1 cursor-pointer' onClick={() => navigate('/')}>
            <img src={logo} alt="uTube" className='w-full h-full' />
          </div>

          {/* Center nav items */}
          <ul className='flex items-center gap-2'>
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.slug)}
                  className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>

          {/* Right side - User menu or Settings */}
          <div className='absolute right-2 flex items-center gap-3'>
            {isAuthenticated ? (
              <>
                <span className='text-sm font-medium'>{user?.username}</span>
                <button
                  onClick={handleLogout}
                  className='px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition'
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className='px-4 py-2 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition'
              >
                Login
              </button>
            )}
            
            <button
              onClick={() => navigate('/settings')}
              className='inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-blue-100 transition'
              aria-label="Settings"
              title="Settings"
            >
              <FiSettings className='h-6 w-6' />
            </button>
          </div>
        </nav>
      </Container>
    </header>
  )
}

export default Header
