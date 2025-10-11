import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { userAPI } from '../api/user.api'
import SubscribeButton from '../components/channel/SubscribeButton'
import VideoGrid from '../components/video/VideoGrid'
import Loader from '../components/Loader'

function Channel() {
  const { username } = useParams()
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('videos')

  useEffect(() => {
    fetchChannel()
  }, [username])

  const fetchChannel = async () => {
    try {
      const result = await userAPI.getUserProfile(username)
      setChannel(result.data)
    } catch (error) {
      console.error('Failed to fetch channel:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader /></div>
  if (!channel) return <div className="text-center py-20">Channel not found</div>

  return (
    <div className="max-w-7xl mx-auto">
      {/* Channel Header */}
      <div className="relative">
        <img
          src={channel.coverImage || '/default-cover.jpg'}
          alt="Channel cover"
          className="w-full h-48 object-cover"
        />
        <div className="px-6 py-4 flex items-center gap-6">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="h-24 w-24 rounded-full border-4 border-white -mt-12"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{channel.fullName}</h1>
            <p className="text-gray-600">@{channel.username}</p>
            <p className="text-sm text-gray-500 mt-1">
              {channel.subscribersCount} subscribers • {channel.videosCount} videos
            </p>
          </div>
          <SubscribeButton channelId={channel._id} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-6">
        <div className="flex gap-6">
          {['videos', 'playlists', 'tweets', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'videos' && (
          <VideoGrid videos={channel.videos || []} />
        )}
        {activeTab === 'about' && (
          <div>
            <p>{channel.description || 'No description available.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Channel
