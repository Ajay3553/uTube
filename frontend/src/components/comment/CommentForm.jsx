import React, { useState } from 'react'
import { commentAPI } from '../../api/comment.api'
import Button from '../Button'

function CommentForm({ videoId, onCommentAdded }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const result = await commentAPI.addComment(videoId, content)
      if (result.success) {
        onCommentAdded(result.data)
        setContent('')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <img
        src="/default-avatar.png"
        alt="Your avatar"
        className="h-10 w-10 rounded-full"
      />
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none resize-none"
          rows="2"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            bgColor="bg-gray-200"
            textColor="text-gray-700"
            onClick={() => setContent('')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Comment'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default CommentForm
