export const metadata: Metadata = {
    title: "RoomDrop - An Easy Way to Create and Join Chat Rooms",
    description: "Welcome to RoomDrop, your go-to platform for creating and joining chat rooms effortlessly.",
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
        canonical: 'https://roomdrop.vercel.app',
    }
}


import HomeModal from "@/components/Home/HomeModal";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export default function Page() {
    return (
        <main className="w-full min-h-screen font-mono flex justify-center items-center">
            <HomeModal />
        </main>
    )
}