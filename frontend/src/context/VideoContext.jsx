import React, { createContext, useState, useContext } from 'react'

const VideoContext = createContext()

export const useVideo = () => {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}

export const VideoProvider = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const playVideo = (video) => {
    setCurrentVideo(video)
    setIsPlaying(true)
  }

  const pauseVideo = () => {
    setIsPlaying(false)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const changeVolume = (newVolume) => {
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const value = {
    currentVideo,
    isPlaying,
    volume,
    isMuted,
    playVideo,
    pauseVideo,
    togglePlay,
    toggleMute,
    changeVolume,
    setCurrentVideo
  }

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}

export default VideoContext
