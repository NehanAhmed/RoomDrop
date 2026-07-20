import { AppSidebar } from '@/components/app-sidebar'
import ChatInterface from '@/components/Message/ChatInterface'
import { SiteHeader } from '@/components/site-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getRoomInfo, roomExists } from '@/lib/RoomService'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://room-drop.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ roomCode: string }> }): Promise<Metadata> {
  const { roomCode } = await params
  return {
    title: `Room ${roomCode}`,
    description: 'Join the conversation in this anonymous chat room.',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `Room ${roomCode} — RoomDrop`,
      description: 'Join the conversation in this anonymous chat room.',
      url: `${BASE_URL}/room/${roomCode}`,
    },
    alternates: {
      canonical: `${BASE_URL}/room/${roomCode}`,
    },
  }
}

const Page = async ({ params }: { params: Promise<{ roomCode: string }> }) => {
    const { roomCode } = await params;

    const isRoom = await roomExists(roomCode)
    if (!isRoom) {
        redirect('/new')
    }

    const roomData = await getRoomInfo(roomCode)

    // Note: currentUser will be determined client-side from localStorage
    // Server component just provides the room data

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar roomData={roomData} />

            <main className="w-full h-screen flex flex-col">
                <SiteHeader roomCode={roomCode} />

                {/* Chat Interface - handles messages and input */}
                {/* currentUser prop removed - will be handled inside component */}
                <ChatInterface roomCode={roomCode} />
            </main>
        </SidebarProvider>
    )
}

export default Page