import React, { useState, useEffect } from 'react'
import { tweetAPI } from '../api/tweet.api'
import TweetForm from '../components/tweet/TweetForm'
import TweetList from '../components/tweet/TweetList'
import Loader from '../components/Loader'

function Tweets() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTweets()
  }, [])

  const fetchTweets = async () => {
    try {
      const userId = localStorage.getItem('userId')
      const result = await tweetAPI.getUserTweets(userId)
      setTweets(result.data.tweets || [])
    } catch (error) {
      console.error('Failed to fetch tweets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTweetCreated = (newTweet) => {
    setTweets([newTweet, ...tweets])
  }

  const handleTweetDeleted = (tweetId) => {
    setTweets(tweets.filter(t => t._id !== tweetId))
  }

  const handleTweetUpdated = (updatedTweet) => {
    setTweets(tweets.map(t => t._id === updatedTweet._id ? updatedTweet : t))
  }

  if (loading) return <div className="flex justify-center py-20"><Loader /></div>

  return (
    <div className="w-screen h-screen px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Tweets</h1>
      <TweetForm onTweetCreated={handleTweetCreated} />
      <TweetList
        tweets={tweets}
        onDelete={handleTweetDeleted}
        onUpdate={handleTweetUpdated}
      />
    </div>
  )
}

export default Tweets
