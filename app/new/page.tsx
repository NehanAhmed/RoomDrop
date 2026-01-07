import CreateRoomComp from '@/components/CreateRoomComponent'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Create Room - RoomDrop",
  description: "Create a new chat room",
  keywords: [
    'create room',
    'new chat room',
    'temporary chat room',
    'ephemeral chat',
    'instant messaging room',
    'private chat room',
    'anonymous chat room'
  ],

  openGraph: {
    title: "RoomDrop - An Easy Way to Create and Join Chat Rooms",
    description: "Welcome to RoomDrop, your go-to platform for creating and joining chat rooms effortlessly.",
    url: "https://roomdrop.vercel.app",
    siteName: "RoomDrop",
    images: [
      {
        url: "https://roomdrop.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "RoomDrop Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoomDrop - An Easy Way to Create and Join Chat Rooms",
    description: "Welcome to RoomDrop, your go-to platform for creating and joining chat rooms effortlessly.",
    images: ["https://roomdrop.vercel.app/og-image.png"],
    creator: '@Nehanahmed988'
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,

    },

  },
  alternates: {
    canonical: 'https://roomdrop.vercel.app/new',
  }

}

const Page = () => {
  return (
    <>
      <CreateRoomComp />
    </>
  )
}

export default Page