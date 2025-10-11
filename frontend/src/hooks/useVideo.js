import { useState, useEffect } from 'react'
import { videoAPI } from '../api/video.api'

export const useVideo = (videoId) => {
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  const fetchVideo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await videoAPI.getVideoById(videoId)
      if (response.success) {
        setVideo(response.data)
      } else {
        setError(response.message || 'Failed to fetch video')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchVideo()
  }

  return { video, loading, error, refetch }
}

export const useVideos = (page = 1, limit = 20) => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [page, limit])

  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await videoAPI.getAllVideos(page, limit)
      if (response.success) {
        setVideos(response.data.videos || [])
        setHasMore(response.data.hasMore || false)
      } else {
        setError(response.message || 'Failed to fetch videos')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchVideos()
  }

  return { videos, loading, error, hasMore, refetch }
}

export default useVideo
