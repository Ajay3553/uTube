import React from 'react'
import TweetCard from './TweetCard'

function TweetList({ tweets, onDelete, onUpdate }) {
  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet._id}
          tweet={tweet}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

export default TweetList
