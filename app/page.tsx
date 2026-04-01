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
    title: "RoomDrop - Anonymous Chat Rooms",
    description: "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
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
    canonical: 'https://roomdrop.vercel.app',
  }
}

export default function Page() {
  return (
    <main className="w-full min-h-screen bg-background">
      <HomeModal />
    </main>
  )
}