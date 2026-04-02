import HomeModal from "@/components/Home/HomeModal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoomDrop - Anonymous Chat Rooms",
  description: "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
  keywords: [
    'RoomDrop',
    'temporary chat rooms',
    'ephemeral chat',
    'no signup chat',
    'room code chat',
    'private chat rooms',
    'instant messaging rooms',
    'anonymous group chat',
    'secure temporary chat'
  ],
  openGraph: {
    title: "RoomDrop - Anonymous Chat Rooms",
    description: "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
    url: "https://room-drop.vercel.app",
    siteName: "RoomDrop",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "RoomDrop Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    images: ["/og(1).png"],
    card: "summary_large_image",
    title: "RoomDrop - Anonymous Chat Rooms",
    description: "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
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
    canonical: 'https://room-drop.vercel.app',
  }
}

export default function Page() {
  return (
    <main className="w-full min-h-screen bg-background">
      <HomeModal />
    </main>
  )
}