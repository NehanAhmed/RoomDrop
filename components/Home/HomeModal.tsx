'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'

import {
  IconArrowRight,
  IconClock,
  IconUsers,
  IconShield,
  IconSparkles,
  IconMessageCircle,
  IconLink
} from '@tabler/icons-react'

interface ActiveSession {
  userName: string
  roomCode: string
  joinedAt: string
  expiresAt?: string
}

const features = [
  { icon: IconShield, label: 'Anonymous', description: 'No personal data required' },
  { icon: IconClock, label: 'Temporary', description: 'Rooms auto-expire' },
  { icon: IconLink, label: 'Instant', description: 'Share link & start chatting' },
]

const HomeModal = () => {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // Effect 1: Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Effect 2: Load session from localStorage
  useEffect(() => {
    try {
      const sessionData = localStorage.getItem('chat_room_session')
      if (sessionData) {
        const session: ActiveSession = JSON.parse(sessionData)
        if (session.expiresAt) {
          const expiryTime = new Date(session.expiresAt).getTime()
          const now = new Date().getTime()
          if (now < expiryTime) {
            setActiveSession(session)
          } else {
            localStorage.removeItem('chat_room_session')
          }
        } else {
          setActiveSession(session)
        }
      }
    } catch (error) {
      console.error('Error loading session:', error)
      localStorage.removeItem('chat_room_session')
    }
  }, [])

  useEffect(() => {
    if (!activeSession?.expiresAt) return
    const updateTime = () => {
      const now = new Date().getTime()
      const expiry = new Date(activeSession.expiresAt!).getTime()
      const diff = expiry - now
      if (diff <= 0) {
        setTimeRemaining('Expired')
        localStorage.removeItem('chat_room_session')
        setActiveSession(null)
        return
      }
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes % 60}m left`)
      } else {
        setTimeRemaining(`${minutes}m left`)
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [activeSession])

  if (!mounted) return null

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/3 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div
        className="relative z-10 w-full max-w-2xl mx-auto px-6"
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20"
          >
            <IconMessageCircle className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            RoomDrop
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-foreground">Chat without</span>
            <br />
            <span className="text-primary">boundaries</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <feature.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <div className="w-full sm:w-auto">
            <Link href="/new" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-base font-medium gap-2 group"
              >
                <IconSparkles className="w-5 h-5" />
                Create Room
                <IconArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="w-full sm:w-auto">
            <Link href="/join" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-base font-medium gap-2"
              >
                <IconUsers className="w-5 h-5" />
                Join Room
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Session Card */}
          {activeSession && (
            <div
              className="w-full"
            >
              <div
                className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                </div>

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Active Room
                      </span>
                    </div>
                    <p className="text-2xl font-mono font-semibold tracking-tight truncate">
                      {activeSession.roomCode}
                    </p>
                    {timeRemaining && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <IconClock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{timeRemaining}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Link href={`/room/${activeSession.roomCode}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Continue
                        <IconArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Bottom Note */}
        <p
          className="text-center text-xs text-muted-foreground/60 mt-8"
        >
          No signup required · End-to-end encrypted · Auto-destructing rooms
        </p>
      </div>
    </div>
  )
}

export default HomeModal