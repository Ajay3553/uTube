import { api } from './config'

export const authAPI = {
  register: async (formData) => {
    const response = await fetch(`${api.defaults.baseURL}/users/register`, {
      method: 'POST',
      body: formData // FormData for file upload
    })
    return response.json()
  },

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/users/logout')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/current-user')
    return response.data
  },

  updateAccount: async (data) => {
    const response = await api.patch('/users/update-account', data)
    return response.data
  },

  changePassword: async (data) => {
    const response = await api.post('/users/change-password', data)
    return response.data
  }
}
