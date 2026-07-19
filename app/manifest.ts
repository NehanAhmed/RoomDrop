import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RoomDrop — Anonymous Chat Rooms',
    short_name: 'RoomDrop',
    description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  }
}
