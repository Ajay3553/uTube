import { api } from './config'

export const userAPI = {
  getUserProfile: async (username) => {
    const response = await api.get(`/users/c/${username}`)
    return response.data
  },

  updateAvatar: async (formData) => {
    const response = await fetch(`${api.defaults.baseURL}/users/avatar`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: formData
    })
    return response.json()
  },

  updateCoverImage: async (formData) => {
    const response = await fetch(`${api.defaults.baseURL}/users/cover-image`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: formData
    })
    return response.json()
  }
}
