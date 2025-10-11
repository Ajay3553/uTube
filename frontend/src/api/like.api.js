import { api } from './config'

export const likeAPI = {
  toggleVideoLike: async (videoId) => {
    const response = await api.post(`/likes/toggle/v/${videoId}`)
    return response.data
  },

  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/likes/toggle/c/${commentId}`)
    return response.data
  },

  toggleTweetLike: async (tweetId) => {
    const response = await api.post(`/likes/toggle/t/${tweetId}`)
    return response.data
  },

  getLikedVideos: async () => {
    const response = await api.get('/likes/videos')
    return response.data
  }
}
