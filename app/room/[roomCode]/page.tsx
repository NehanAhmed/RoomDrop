
import { AppSidebar } from '@/components/app-sidebar'
import ChatInterface from '@/components/Message/ChatInterface'
import { SiteHeader } from '@/components/site-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getRoomInfo, roomExists } from '@/lib/RoomService'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'

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