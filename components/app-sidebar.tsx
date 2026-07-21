'use client'

import { IconArrowLeft, IconDoorExit, IconSettings, IconUsers, IconHash, IconPalette } from '@tabler/icons-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { Button } from './ui/button'
import { CopyButton } from './CopyButton'
import { RoomInfo } from '@/lib/type'
import { toast } from 'sonner'
import { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsModal } from './SettingsModal'
import { ThemeVariantSwitcher } from './theme-switcher'

interface UserSession {
  userName: string
  roomCode: string
  joinedAt: string
}

export function AppSidebar({ roomData }: { roomData: RoomInfo | null }) {
  const onlineSet = new Set(roomData?.onlineUsers)

  const currentUser = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const stored = localStorage.getItem('chat_room_session')
        const session: UserSession | null = stored ? JSON.parse(stored) : null
        return session?.userName ?? ''
      } catch {
        return ''
      }
    },
    () => ''
  )

  const [settingsOpen, setSettingsOpen] = useState(false)
  const router = useRouter()

  const handleLeaveRoom = () => {
    localStorage.removeItem('chat_room_session')
    router.push('/')
  }

  return (
    <Sidebar variant="floating" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <Link href="/" className="mb-4">
            <Button variant="ghost" className="active:scale-[0.97] transition-transform duration-150 ease-out-strong">
              <IconArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>
            Room
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Room Code Card — Double-Bezel */}
            <div className="p-[3px] rounded-2xl bg-muted/60 border border-border/60 mb-3">
              <div className="rounded-[calc(1.75rem-4px)] bg-card px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 mb-2">
                  <IconHash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.1em]">Room Code</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-mono font-semibold tracking-wider text-foreground">
                    {roomData?.code}
                  </span>
                  <CopyButton
                    variant="ghost"
                    textToCopy={roomData?.code || ''}
                    onCopySuccess={() => toast.success('Room code copied!')}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 w-full">
              <Button
                variant="destructive"
                onClick={handleLeaveRoom}
                className="w-full active:scale-[0.97] transition-transform duration-150 ease-out-strong"
              >
                <IconDoorExit className="w-4 h-4" />
                Leave Chat
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSettingsOpen(true)}
                className="w-full active:scale-[0.97] transition-transform duration-150 ease-out-strong"
              >
                <IconSettings className="w-4 h-4" />
                Settings
              </Button>
            </div>

            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
            <div className="p-[3px] rounded-2xl bg-muted/60 border border-border/60 mt-4">
              <div className="rounded-[calc(1.75rem-4px)] bg-card px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconPalette className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-[0.1em]">Theme</span>
                  </div>
                  <ThemeVariantSwitcher />
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <IconUsers className="w-4 h-4" />
            Participants ({roomData?.participants.length ?? 0})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {roomData?.participants.map((user) => {
              const isOnline = onlineSet.has(user)
              const isCurrentUser = user.toLowerCase() === currentUser.toLowerCase()
              return (
                <div
                  key={user}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/30 transition-colors duration-200"
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
                  <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                </div>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
