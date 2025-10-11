import React from 'react'

function VideoPlayer({ videoUrl, thumbnail }) {
  return (
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
      <video
        controls
        className="w-full h-full"
        poster={thumbnail}
        src={videoUrl}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default VideoPlayer
