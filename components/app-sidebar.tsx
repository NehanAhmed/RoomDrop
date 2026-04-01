'use client'

import { IconArrowLeft, IconDoorExit, IconSettings, IconUsers, IconHash } from "@tabler/icons-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "./ui/button"
import { CopyButton } from "./CopyButton"
import { RoomInfo } from "@/lib/type"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SettingsModal } from "./SettingsModal"
import { motion } from "motion/react"

interface UserSession {
    userName: string
    roomCode: string
    joinedAt: string
}

export function AppSidebar({ roomData }: { roomData: RoomInfo | null }) {
    const onlineSet = new Set(roomData?.onlineUsers)
    const [currentUser, setCurrentUser] = useState('')
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
        setCurrentUser(session?.userName ?? '')
    }, [])

    const handleLeaveRoom = () => {
        localStorage.removeItem('chat_room_session')
        router.push('/')
    }

    return (
        <Sidebar variant="floating" collapsible="offExamples">
            <SidebarHeader className="pb-2">
                <SidebarMenu>
                    <Link href="/" className="mb-4">
                        <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <IconArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </motion.div>
                    </Link>
                </SidebarMenu>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider">
                        Room
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="space-y-3">
                        {/* Room Code Card */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-3 bg-card border border-border/50 rounded-xl"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <IconHash className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Room Code</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-lg font-mono font-semibold">{roomData?.code}</span>
                                <CopyButton
                                    variant="ghost"
                                    textToCopy={roomData?.code || ''}
                                    onCopySuccess={() => toast.success('Room code copied!')}
                                />
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="space-y-2 w-full h-full">
                            <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="destructive"
                                    className="min-w-full flex items-center justify-center  sm:w-auto px-8 py-6 text-base font-medium gap-2"
                                    onClick={handleLeaveRoom}
                                >
                                    <IconDoorExit className="w-4 h-4" />
                                    Leave Chat
                                </Button>
                            </motion.div>

                            <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="secondary"
                                    className="min-w-full justify-center  sm:w-auto px-8 py-6 text-base font-medium gap-2"
                                    onClick={() => setSettingsOpen(true)}
                                >
                                    <IconSettings className="w-4 h-4" />
                                    Settings
                                </Button>
                            </motion.div>
                        </div>

                        <SettingsModal
                            open={settingsOpen}
                            onOpenChange={setSettingsOpen}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                        <IconUsers className="w-4 h-4" />
                        Participants ({roomData?.participants.length ?? 0})
                    </SidebarGroupLabel>

                    <SidebarGroupContent className="space-y-1 mt-2">
                        {roomData?.participants.map((user) => {
                            const isOnline = onlineSet.has(user)
                            const isCurrentUser = user === currentUser

                            return (
                                <motion.div
                                    key={user}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                            isCurrentUser
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground'
                                        }`}>
                                            {user[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {user}
                                                {isCurrentUser && (
                                                    <span className="text-xs text-muted-foreground ml-1">(You)</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <motion.div
                                        animate={{
                                            scale: isOnline ? [1, 1.2, 1] : 1,
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: isOnline ? Infinity : 0,
                                            ease: "easeInOut"
                                        }}
                                        className={`h-2 w-2 rounded-full ${
                                            isOnline
                                                ? 'bg-primary'
                                                : 'bg-muted-foreground/30'
                                        }`}
                                    />
                                </motion.div>
                            )
                        })}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}