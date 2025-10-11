import React, { useState } from 'react'
import { tweetAPI } from '../../api/tweet.api'
import Button from '../Button'

function TweetForm({ onTweetCreated }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const result = await tweetAPI.createTweet(content)
      if (result.success) {
        onTweetCreated(result.data)
        setContent('')
      }
    } catch (error) {
      console.error('Failed to create tweet:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="w-full border-0 outline-none resize-none"
        rows="3"
        maxLength={280}
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500">{content.length}/280</span>
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Tweet'}
        </Button>
      </div>
    </form>
  )
}

export default TweetForm
