import { useState } from 'react'
import { subscriptionAPI } from '../api/subscription.api'

export const useSubscription = (channelId) => {
  const [subscribed, setSubscribed] = useState(false)
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const toggleSubscription = async () => {
    setLoading(true)
    try {
      const response = await subscriptionAPI.toggleSubscription(channelId)
      if (response.success) {
        setSubscribed(!subscribed)
        setSubscribersCount(subscribed ? subscribersCount - 1 : subscribersCount + 1)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    subscribed,
    subscribersCount,
    loading,
    toggleSubscription,
    setSubscribed,
    setSubscribersCount
  }
}

export default useSubscription
