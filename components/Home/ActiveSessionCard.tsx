'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconChevronRight, IconClock } from '@tabler/icons-react'

interface ActiveSession {
  userName: string
  roomCode: string
  joinedAt: string
  expiresAt?: string
}

function getSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem('chat_room_session')
    if (!raw) return null
    const data: ActiveSession = JSON.parse(raw)
    if (data.expiresAt && Date.now() >= new Date(data.expiresAt).getTime()) {
      localStorage.removeItem('chat_room_session')
      return null
    }
    return data
  } catch {
    return null
  }
}

export function ActiveSessionCard() {
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [session, setSession] = useState<ActiveSession | null>(() => {
    if (typeof window === 'undefined') return null
    return getSession()
  })
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!session?.expiresAt) return
    const tick = () => {
      const diff = new Date(session.expiresAt!).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        localStorage.removeItem('chat_room_session')
        setSession(null)
        return
      }
      const m = Math.floor(diff / 60000)
      const h = Math.floor(m / 60)
      setTimeLeft(h > 0 ? `${h}h ${m % 60}m left` : `${m}m left`)
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [session])

  if (!isClient) return null
  if (!session) return null

  return (
    <div className="max-w-sm">
      <div className="border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Active Room
              </span>
            </div>
              <p className="font-heading mt-1.5 truncate text-lg font-semibold tracking-wide text-foreground">
              {session.roomCode}
            </p>
            {timeLeft && (
              <div className="mt-1 flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{timeLeft}</span>
              </div>
            )}
          </div>
          <Link href={`/room/${session.roomCode}`}>
            <Button variant="ghost" size="icon">
              <IconChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
