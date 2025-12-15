import { AppSidebar } from '@/components/app-sidebar'
import MessageSection from '@/components/Message/MessageSection'
import { SiteHeader } from '@/components/site-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getRoomInfo, roomExists, RoomInfo } from '@/lib/RoomService'
import { redirect } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

const Page = async ({ params }: { params: Promise<{ roomCode: string }> }) => {
    const { roomCode } = await params;

    const isRoom = await roomExists(roomCode)
    if (!isRoom) {
        redirect('/new')
    }

    const roomData = await getRoomInfo(roomCode)



    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar roomData={roomData} />

            <main className="w-full h-screen flex flex-col">
                <SiteHeader />

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* messages here */}
                    </div>

                    {/* Input pinned to bottom */}
                    <MessageSection />
                </div>
            </main>
        </SidebarProvider>
    )
}

export default Page