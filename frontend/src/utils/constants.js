export const API_BASE_URL = import.meta.env.VITE_API_URL

export const VIDEO_CATEGORIES = [
  'All', 'Music', 'Gaming', 'News', 'Sports', 'Tech', 
  'Education', 'Comedy', 'Movies', 'Live'
]

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VIDEO_WATCH: '/watch/:videoId',
  CHANNEL: '/channel/:username',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
  SUBSCRIPTIONS: '/subscriptions',
  PLAYLISTS: '/playlists',
  LIKED_VIDEOS: '/liked-videos',
  TWEETS: '/tweets'
}
