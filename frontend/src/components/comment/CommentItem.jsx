import { useState } from 'react'
import { AiFillLike, AiOutlineLike } from 'react-icons/ai'
import { MdDelete } from 'react-icons/md'
import { commentAPI } from '../../api/comment.api'
import { likeAPI } from '../../api/like.api'
import { formatDate } from '../../utils/formatters.js'

function CommentItem({ comment, onDelete }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  const handleLike = async () => {
    try {
      await likeAPI.toggleCommentLike(comment._id)
      setLiked(!liked)
      setLikes(liked ? likes - 1 : likes + 1)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return
    
    try {
      await commentAPI.deleteComment(comment._id)
      onDelete(comment._id)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <div className="flex gap-3">
      <img
        src={comment.author?.avatar || '/default-avatar.png'}
        alt={comment.author?.username}
        className="h-10 w-10 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{comment.author?.username}</span>
          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm mt-1">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button onClick={handleLike} className="flex items-center gap-1 text-sm">
            {liked ? <AiFillLike /> : <AiOutlineLike />}
            <span>{likes}</span>
          </button>
          <button onClick={handleDelete} className="text-sm text-red-600 flex items-center gap-1">
            <MdDelete /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentItem
