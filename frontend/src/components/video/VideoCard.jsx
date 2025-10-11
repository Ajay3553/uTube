import { Link } from 'react-router-dom'
import { formatDate, formatViews } from '../../utils/formatters.js'

function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="group">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
        <img
          src={video.thumbnail || '/placeholder-video.jpg'}
          alt={video.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="mt-3 flex gap-3">
        <img
          src={video.author?.avatar || '/default-avatar.png'}
          alt={video.author?.username}
          className="h-9 w-9 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {video.title}
          </h3>
          <p className="mt-1 text-xs text-gray-600">{video.author?.username}</p>
          <p className="text-xs text-gray-500">
            {formatViews(video.views)} views • {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default VideoCard
