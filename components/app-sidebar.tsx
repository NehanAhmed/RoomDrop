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
            <span className="font-heading text-xs tracking-wider uppercase">Room</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="border border-border bg-card px-4 py-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <IconHash className="w-4 h-4 text-muted-foreground" />
                <span className="font-heading text-xs tracking-wider uppercase text-muted-foreground">Room Code</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-lg font-semibold tracking-wide text-foreground">
                  {roomData?.code}
                </span>
                <CopyButton
                  variant="ghost"
                  textToCopy={roomData?.code || ''}
                  onCopySuccess={() => toast.success('Room code copied!')}
                />
              </div>
            </div>

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
            <div className="border border-border bg-card px-4 py-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconPalette className="w-4 h-4 text-muted-foreground" />
                  <span className="font-heading text-xs tracking-wider uppercase text-muted-foreground">Theme</span>
                </div>
                <ThemeVariantSwitcher />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <IconUsers className="w-4 h-4" />
            <span className="font-heading text-xs tracking-wider uppercase ml-2">Participants ({roomData?.participants.length ?? 0})</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {roomData?.participants.map((user) => {
              const isOnline = onlineSet.has(user)
              const isCurrentUser = user.toLowerCase() === currentUser.toLowerCase()
              return (
                <div
                  key={user}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center text-xs font-semibold border ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-secondary-foreground border-border'
                    }`}>
                      {user[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-sm font-medium">
                        {user}
                        {isCurrentUser && (
                          <span className="font-sans text-xs text-muted-foreground ml-1">(You)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={`h-2 w-2 ${isOnline ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                </div>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
