'use client'
import { IconArrowLeft, IconCalendar, IconDoorExit, IconHome, IconInbox, IconSearch, IconSettings, IconUser } from "@tabler/icons-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "./ui/button"
import { CopyButton } from "./CopyButton"
import { RoomInfo } from "@/lib/type"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SettingsModal } from "./SettingsModal"



interface UserSession {
    userName: string
    roomCode: string
    joinedAt: string
}

export function AppSidebar({ roomData }: { roomData: RoomInfo | null }) {
    const onlineSet = new Set(roomData?.onlineUsers)
    const [currentUser, setcurrentUser] = useState('')
    const [settingsOpen, setSettingsOpen] = useState(false)

    const router = useRouter()
    useEffect(() => {
        const getUserSession = (): UserSession | null => {
            try {
                const stored = localStorage.getItem('chat_room_session')
                return stored ? (JSON.parse(stored) as UserSession) : null
            } catch {
                return null
            }
        }

        const session = getUserSession()
        setcurrentUser(session?.userName ?? '')
    }, [])
    
    return (
        <Sidebar variant="floating" collapsible="offExamples">
            <SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <Link href={'/'} className="my-3">
                        <Button className={'gap-2 '} variant={'outline'}><IconArrowLeft />Back to Home </Button>
                        </Link>
                    </SidebarMenu>
                    <SidebarGroup>
                        <SidebarGroupLabel>Actions</SidebarGroupLabel>
                    </SidebarGroup>
                    <SidebarGroupContent className="space-y-2">
                        <SidebarMenu>
                            <div className='w-full flex justify-between items-center gap-3 p-3 bg-muted rounded-lg'>
                                <p className='text-lg font-bold font-mono'>{roomData?.code}</p>
                                <CopyButton
                                    variant='outline'
                                    textToCopy={roomData?.code || ''}
                                    onCopySuccess={() => toast.success('Room code copied!')}
                                    className='p-2 border rounded hover:bg-gray-100'
                                    copiedClassName='p-2 border rounded bg-green-500 text-white'
                                />
                            </div>
                        </SidebarMenu>
                        <SidebarMenu>
                            <Button variant={'destructive'} className={'py-5 px-4 text-start flex items-center justify-start gap-2 '}><IconDoorExit /> Leave Chat</Button>

                        </SidebarMenu>
                        <SidebarMenu>

                            <Button onClick={() => setSettingsOpen(true)}
                                className={'py-5 px-4 text-start flex items-center justify-start gap-2 '} variant={'outline'}><IconSettings /> Settings</Button>
                            <SettingsModal
                                open={settingsOpen}
                                onOpenChange={setSettingsOpen}
                            />
                        </SidebarMenu>

                    </SidebarGroupContent>
                </SidebarContent>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Users ({roomData?.participants.length ?? 0})
                    </SidebarGroupLabel>

                    <SidebarGroupContent className="space-y-2">
                        {roomData?.participants.map((user) => {
                            const isOnline = onlineSet.has(user)

                            return (
                                <div
                                    key={user}
                                    className="flex items-center justify-between rounded-md px-2 py-1 "
                                >
                                    <div className="flex items-center gap-2">
                                        {/* Avatar */}
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                            {user[0].toUpperCase()}
                                        </div>

                                        <span className="text-sm">{user}</span>
                                    </div>

                                    {/* Online badge */}
                                    <span
                                        className={`h-2 w-2 rounded-full ${isOnline
                                            ? 'bg-green-500'
                                            : 'bg-gray-400'
                                            }`}
                                    />
                                </div>
                            )
                        })}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}