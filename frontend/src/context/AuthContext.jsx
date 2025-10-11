import React, { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../api/auth.api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const response = await authAPI.getCurrentUser()
        if (response.success) {
          setUser(response.data)
          setIsAuthenticated(true)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('accessToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      if (response.success) {
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken)
        }
        setUser(response.data.user)
        setIsAuthenticated(true)
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      if (response.success) {
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, message: 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('accessToken')
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
