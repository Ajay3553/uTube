import React from 'react'
import { Link } from 'react-router-dom'

const categories = [
  'All', 'Music', 'Gaming', 'News', 'Sports', 'Tech', 'Education', 'Comedy', 'Movies', 'Live'
]

// Demo data
const videos = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Sample Video Title ${i + 1}`,
  channel: `Channel ${((i % 5) + 1)}`,
  views: (i + 1) * 12500,
  ago: `${(i % 9) + 1} day${(i % 9) + 1 > 1 ? 's' : ''} ago`,
  thumbnail: null,
}))

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Explore trending videos
          </h1>
          <div className="flex-1 sm:ml-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full rounded-full border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button className="rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-6">
        <div className="overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
                  type="button"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Video Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
        {videos.map((v) => (
          <Link key={v.id} to={`/watch/${v.id}`} className="group">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
              <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:opacity-90 transition" />
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                {v.title}
              </h3>
              <p className="mt-1 text-xs text-gray-600">{v.channel}</p>
              <p className="text-xs text-gray-500">
                {Intl.NumberFormat('en', { notation: 'compact' }).format(v.views)} views • {v.ago}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}

export default Home
