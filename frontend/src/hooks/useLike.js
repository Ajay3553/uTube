import { useState } from 'react'
import { likeAPI } from '../api/like.api'

export const useLike = (type, id) => {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const toggleLike = async () => {
    setLoading(true)
    try {
      let response
      switch (type) {
        case 'video':
          response = await likeAPI.toggleVideoLike(id)
          break
        case 'comment':
          response = await likeAPI.toggleCommentLike(id)
          break
        case 'tweet':
          response = await likeAPI.toggleTweetLike(id)
          break
        default:
          throw new Error('Invalid like type')
      }

      if (response.success) {
        setLiked(!liked)
        setLikesCount(liked ? likesCount - 1 : likesCount + 1)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { liked, likesCount, loading, toggleLike, setLiked, setLikesCount }
}

export default useLike
