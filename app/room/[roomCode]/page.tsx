import { AppSidebar } from '@/components/app-sidebar'
import ChatInterface from '@/components/Message/ChatInterface'
import { SiteHeader } from '@/components/site-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getRoomInfo, roomExists } from '@/lib/RoomService'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { BASE_URL } from '@/lib/constants'

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
      title: `Room ${roomCode} — Wick Chat`,
      description: 'Join the conversation in this anonymous chat room.',
      url: `${BASE_URL}/room/${roomCode}`,
    },
    alternates: {
      canonical: `${BASE_URL}/room/${roomCode}`,
    },
  }
}

export const dynamic = 'force-dynamic';

function ChatFallback() {
  return (
    <div className="flex items-center justify-center flex-1 bg-background">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading room...</p>
      </div>
    </div>
  )
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

            <main className="w-full h-screen flex flex-col border-l border-border">
                <SiteHeader roomCode={roomCode} />
                <Suspense fallback={<ChatFallback />}>
                    <ChatInterface roomCode={roomCode} />
                </Suspense>
            </main>
        </SidebarProvider>
    )
}

export default Page