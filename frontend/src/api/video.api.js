import { api } from './config'

export const videoAPI = {
  getAllVideos: async (page = 1, limit = 20) => {
    const response = await api.get(`/videos?page=${page}&limit=${limit}`)
    return response.data
  },

  getVideoById: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`)
    return response.data
  },

  uploadVideo: async (formData) => {
    const response = await fetch(`${api.defaults.baseURL}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: formData
    })
    return response.json()
  },

  updateVideo: async (videoId, data) => {
    const response = await api.patch(`/videos/${videoId}`, data)
    return response.data
  },

  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`)
    return response.data
  },

  togglePublishStatus: async (videoId) => {
    const response = await api.patch(`/videos/toggle/publish/${videoId}`)
    return response.data
  }
}
