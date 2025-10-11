import { api } from './config'

export const commentAPI = {
  getVideoComments: async (videoId) => {
    const response = await api.get(`/comments/${videoId}`)
    return response.data
  },

  addComment: async (videoId, content) => {
    const response = await api.post(`/comments/${videoId}`, { content })
    return response.data
  },

  updateComment: async (commentId, content) => {
    const response = await api.patch(`/comments/c/${commentId}`, { content })
    return response.data
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/c/${commentId}`)
    return response.data
  }
}
