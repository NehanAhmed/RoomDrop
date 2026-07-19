'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  IconMessageCircle,
  IconArrowRight,
  IconUsers,
  IconClock,
  IconShield,
  IconChevronRight,
} from '@tabler/icons-react'

interface ActiveSession {
  userName: string
  roomCode: string
  joinedAt: string
  expiresAt?: string
}

const features = [
  { icon: IconShield, label: 'Anonymous' },
  { icon: IconClock, label: 'Ephemeral' },
  { icon: IconUsers, label: 'Private' },
]

export default function HomeModal() {
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [session, setSession] = useState<ActiveSession | null>(() => {
    if (typeof window === 'undefined') return null
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

  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background selection:bg-primary/20">
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-16">
        {/* ── Logo (Double-Bezel icon) ── */}
        <div
          className="flex items-center justify-center gap-3 mb-16"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both` }}
        >
          <div className="p-[3px] rounded-2xl bg-primary/10">
            <div className="flex items-center justify-center w-10 h-10 rounded-[calc(1rem-2px)] bg-primary text-primary-foreground">
              <IconMessageCircle className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            RoomDrop
          </span>
        </div>

        {/* ── Hero ── */}
        <div
          className="text-center mb-10"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '100ms' }}
        >
          <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] font-semibold tracking-tighter leading-[1.05] text-foreground mb-4 text-pretty">
            Chat without
            <br />
            <span className="text-primary">boundaries</span>
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground leading-relaxed max-w-[36ch] mx-auto">
            Create instant, signup-free chat rooms. Share a link and start talking with complete privacy.
          </p>
        </div>

        {/* ── Feature indicators ── */}
        <div
          className="flex items-center justify-center gap-5 mb-10"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '200ms' }}
        >
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <f.icon className="w-3.5 h-3.5 text-primary/60" aria-hidden="true" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* ── CTAs (Button-in-Button) ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '300ms' }}
        >
          <Link href="/new" className="w-full sm:w-auto">
            <Button className="group w-full relative overflow-hidden active:scale-[0.97] transition-transform duration-150 ease-out-strong">
              <span className="relative z-10 flex items-center gap-2.5">
                Create Room
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                  <IconArrowRight className="w-3 h-3" aria-hidden="true" />
                </span>
              </span>
            </Button>
          </Link>
          <Link href="/join" className="w-full sm:w-auto">
            <Button variant="secondary" className="group w-full active:scale-[0.97] transition-transform duration-150 ease-out-strong">
              <span className="flex items-center gap-2">
                <IconUsers className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" aria-hidden="true" />
                Join Room
              </span>
            </Button>
          </Link>
        </div>

        {/* ── Active Session Card (Double-Bezel) ── */}
        {session && (
          <div
            style={{ animation: `fade-up-heavy 800ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '400ms' }}
          >
            <div className="p-[3px] rounded-2xl bg-muted/60 border border-border/60">
              <div className="rounded-[calc(1.75rem-4px)] bg-card px-5 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                      </span>
                      <span className="text-[0.6875rem] font-medium text-muted-foreground uppercase tracking-[0.12em]">
                        Active Room
                      </span>
                    </div>
                    <p className="text-lg font-mono font-semibold tracking-tight text-foreground truncate">
                      {session.roomCode}
                    </p>
                    {timeLeft && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <IconClock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                        <span className="text-xs text-muted-foreground">{timeLeft}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/room/${session.roomCode}`}>
                    <Button variant="ghost" size="icon" className="active:scale-[0.93] transition-transform duration-150 ease-out-strong" aria-label="Continue to room">
                      <IconChevronRight className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <p
          className="text-center text-xs text-muted-foreground/50 mt-12"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: session ? '500ms' : '400ms' }}
        >
          No signup &middot; Encrypted &middot; Auto-destruct
        </p>
      </div>
    </main>
  )
}
