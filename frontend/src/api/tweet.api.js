import { api } from './config'

export const tweetAPI = {
  createTweet: async (content) => {
    const response = await api.post('/tweets', { content })
    return response.data
  },

  getUserTweets: async (userId, page = 1, limit = 10) => {
    const response = await api.get(`/tweets/user/${userId}?page=${page}&limit=${limit}`)
    return response.data
  },

  updateTweet: async (tweetId, content) => {
    const response = await api.patch(`/tweets/${tweetId}`, { content })
    return response.data
  },

  deleteTweet: async (tweetId) => {
    const response = await api.delete(`/tweets/${tweetId}`)
    return response.data
  }
}
