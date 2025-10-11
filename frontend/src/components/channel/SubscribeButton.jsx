import React, { useState } from 'react'
import { subscriptionAPI } from '../../api/subscription.api'
import Button from '../Button'

function SubscribeButton({ channelId, initialSubscribed = false }) {
  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const result = await subscriptionAPI.toggleSubscription(channelId)
      if (result.success) {
        setSubscribed(result.data.isSubscribed)
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      bgColor={subscribed ? 'bg-gray-200' : 'bg-red-600'}
      textColor={subscribed ? 'text-gray-700' : 'text-white'}
    >
      {loading ? 'Loading...' : subscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  )
}

export default SubscribeButton
