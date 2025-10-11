import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'

function Settings() {
  const navigate = useNavigate()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const formData = new FormData(e.target)
    const data = {
      oldPassword: formData.get('oldPassword'),
      newPassword: formData.get('newPassword')
    }

    try {
      const result = await authAPI.changePassword(data)
      if (result.success) {
        setMessage('Password changed successfully')
        e.target.reset()
      } else {
        setError(result.message || 'Failed to change password')
      }
    } catch (error) {
      setError('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* User Info Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700">
          Logged in as: <span className="font-semibold">{user?.username}</span> ({user?.email})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="space-y-2">
            {['account', 'privacy', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === tab ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-1 md:col-span-3">
          {activeTab === 'account' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              
              {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  name="oldPassword"
                  placeholder="Enter current password"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
              <p className="text-gray-600">Privacy settings coming soon...</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
              <p className="text-gray-600">Notification settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
