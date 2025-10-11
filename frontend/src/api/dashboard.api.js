import { api } from './config'

export const dashboardAPI = {
  getChannelStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  getChannelVideos: async () => {
    const response = await api.get('/dashboard/videos')
    return response.data
  }
}
