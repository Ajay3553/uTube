import { useState } from 'react'
import { AiFillLike, AiOutlineLike } from 'react-icons/ai'
import { MdDelete, MdEdit } from 'react-icons/md'
import { likeAPI } from '../../api/like.api'
import { tweetAPI } from '../../api/tweet.api'
import { formatDate } from '../../utils/formatters.js'

function TweetCard({ tweet, onDelete, onUpdate }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(tweet.content)

  const handleLike = async () => {
    try {
      await likeAPI.toggleTweetLike(tweet._id)
      setLiked(!liked)
      setLikes(liked ? likes - 1 : likes + 1)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this tweet?')) return
    
    try {
      await tweetAPI.deleteTweet(tweet._id)
      onDelete(tweet._id)
    } catch (error) {
      console.error('Failed to delete tweet:', error)
    }
  }

  const handleUpdate = async () => {
    try {
      const result = await tweetAPI.updateTweet(tweet._id, content)
      if (result.success) {
        onUpdate(result.data)
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to update tweet:', error)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex gap-3">
        <img
          src={tweet.author?.avatar || '/default-avatar.png'}
          alt={tweet.author?.username}
          className="h-12 w-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{tweet.author?.fullName}</span>
              <span className="text-gray-500 text-sm ml-2">@{tweet.author?.username}</span>
              <span className="text-gray-500 text-sm ml-2">• {formatDate(tweet.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)}>
                <MdEdit className="text-blue-600" />
              </button>
              <button onClick={handleDelete}>
                <MdDelete className="text-red-600" />
              </button>
            </div>
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                rows="3"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2">{tweet.content}</p>
          )}

          <div className="flex items-center gap-6 mt-3">
            <button onClick={handleLike} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              {liked ? <AiFillLike /> : <AiOutlineLike />}
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TweetCard
