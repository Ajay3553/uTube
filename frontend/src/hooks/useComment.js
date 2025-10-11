import { useState, useEffect } from 'react'
import { commentAPI } from '../api/comment.api'

export const useComments = (videoId) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (videoId) {
      fetchComments()
    }
  }, [videoId])

  const fetchComments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await commentAPI.getVideoComments(videoId)
      if (response.success) {
        setComments(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch comments')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addComment = async (content) => {
    try {
      const response = await commentAPI.addComment(videoId, content)
      if (response.success) {
        setComments([response.data, ...comments])
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const updateComment = async (commentId, content) => {
    try {
      const response = await commentAPI.updateComment(commentId, content)
      if (response.success) {
        setComments(comments.map(c => c._id === commentId ? response.data : c))
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const deleteComment = async (commentId) => {
    try {
      const response = await commentAPI.deleteComment(commentId)
      if (response.success) {
        setComments(comments.filter(c => c._id !== commentId))
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments
  }
}

export default useComments
