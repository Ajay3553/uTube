import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoutes.jsx'
import Home from './pages/Home.jsx'
import Tweet from './pages/Tweet.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import VideoWatch from './pages/VideoWatch.jsx'
import Channel from './pages/Channel.jsx'
import Settings from './pages/Setting.jsx'
import NotFound from './pages/NotFound.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/tweet',
        element: (
          <ProtectedRoute>
            <Tweet />
          </ProtectedRoute>
        )
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <Signup />
      },
      {
        path: '/watch/:videoId',
        element: <VideoWatch />
      },
      {
        path: '/channel/:username',
        element: <Channel />
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
