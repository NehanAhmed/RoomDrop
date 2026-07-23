import { HomePage } from "@/components/Home/HomePage";
import { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Wick Chat — Anonymous Chat Rooms",
  description: "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
  keywords: [
    'Wick Chat',
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
    title: "Wick Chat — Anonymous Chat Rooms",
    description: "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
    url: BASE_URL,
    siteName: "Wick Chat",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wick Chat — Anonymous Chat Rooms",
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
    canonical: '/',
  }
}

export default function Page() {
  return <HomePage />
}
