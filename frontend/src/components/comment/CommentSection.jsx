import React, { useState, useEffect } from 'react'
import { commentAPI } from '../../api/comment.api'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'
import Loader from '../Loader'

function CommentSection({ videoId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    try {
      const result = await commentAPI.getVideoComments(videoId)
      setComments(result.data || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments])
  }

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId))
  }

  if (loading) return <Loader />

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">{comments.length} Comments</h3>
      <CommentForm videoId={videoId} onCommentAdded={handleCommentAdded} />
      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onDelete={handleCommentDeleted}
          />
        ))}
      </div>
    </div>
  )
}

export default CommentSection
