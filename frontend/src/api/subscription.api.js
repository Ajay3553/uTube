import { api } from './config'

export const subscriptionAPI = {
  toggleSubscription: async (channelId) => {
    const response = await api.post(`/subscriptions/c/${channelId}`)
    return response.data
  },

  getUserChannelSubscribers: async (channelId) => {
    const response = await api.get(`/subscriptions/c/${channelId}/subscribers`)
    return response.data
  },

  getSubscribedChannels: async (subscriberId) => {
    const response = await api.get(`/subscriptions/u/${subscriberId}`)
    return response.data
  }
}
