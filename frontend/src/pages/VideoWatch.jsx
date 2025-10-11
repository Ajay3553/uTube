import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { videoAPI } from '../api/video.api'
import { likeAPI } from '../api/like.api'
import VideoPlayer from '../components/video/VideoPlayer'
import CommentSection from '../components/comment/CommentSection'
import SubscribeButton from '../components/channel/SubscribeButton'
import Loader from '../components/Loader'
import { formatViews, formatDate } from '../utils/formatters'
import { AiOutlineLike, AiFillLike, AiOutlineDislike } from 'react-icons/ai'

function VideoWatch() {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    fetchVideo()
  }, [videoId])

  const fetchVideo = async () => {
    try {
      const result = await videoAPI.getVideoById(videoId)
      setVideo(result.data)
    } catch (error) {
      console.error('Failed to fetch video:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      await likeAPI.toggleVideoLike(videoId)
      setLiked(!liked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader /></div>
  if (!video) return <div className="text-center py-20">Video not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main video section */}
        <div className="lg:col-span-2">
          <VideoPlayer videoUrl={video.videoFile} thumbnail={video.thumbnail} />
          
          <h1 className="text-xl font-bold mt-4">{video.title}</h1>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <img
                src={video.author?.avatar}
                alt={video.author?.username}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{video.author?.fullName}</p>
                <p className="text-sm text-gray-500">subscribers</p>
              </div>
              <SubscribeButton channelId={video.author?._id} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                {liked ? <AiFillLike /> : <AiOutlineLike />}
                <span>Like</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <AiOutlineDislike />
                <span>Dislike</span>
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-semibold">
              {formatViews(video.views)} views • {formatDate(video.createdAt)}
            </p>
            <p className="mt-2 text-sm whitespace-pre-wrap">{video.description}</p>
          </div>

          <CommentSection videoId={videoId} />
        </div>

        {/* Suggested videos sidebar */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-4">Suggested Videos</h3>
          {/* Add suggested videos here */}
        </div>
      </div>
    </div>
  )
}

export default VideoWatch
