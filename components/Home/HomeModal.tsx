'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import ModalSection from '../ModalSection'
import Link from 'next/link'
import { IconArrowRight, IconClock } from '@tabler/icons-react'

interface ActiveSession {
  userName: string
  roomCode: string
  joinedAt: string
  expiresAt?: string
}

const HomeModal = () => {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    // Check for active session
    try {
      const sessionData = localStorage.getItem('chat_room_session')
      if (sessionData) {
        const session: ActiveSession = JSON.parse(sessionData)

        // Check if session is still valid
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

  // Update time remaining every minute
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

  return (
    <ModalSection>
      <div className='w-10/12 h-full'>
        <h1 className='text-2xl font-bold'>RoomDrop - Chatting with Anonymity</h1>
        <p className='text-sm py-3 text-neutral-400'>Join free Anonymous Rooms and chat with anonymity and privacy with friends and family or with ...</p>
      </div>
      <div className='flex items-center justify-center gap-2'>
        <Link href='/join'><Button className='px-5 py-4'>Join Room</Button></Link>
        <Link href='/new'>
          <Button className='px-5 py-4' variant={'secondary'}>Create Room</Button>
        </Link>
      </div>

      {/* Active Session Card - Added at bottom */}
      {activeSession && (
        <div className='w-full p-4 rounded-lg bg-card border border-border mt-4'>
          <div className='flex items-center justify-between gap-3 h-full'>
            <div className=' min-w-0'>
              <p className='text-xs text-muted-foreground mb-1'>Active Room</p>
              <p className='text-lg font-bold font-mono truncate'>
                {activeSession.roomCode}
              </p>
              {timeRemaining && (
                <div className='flex items-center gap-1 mt-1'>
                  <IconClock size={14} className='text-muted-foreground' />
                  <p className='text-xs text-muted-foreground'>{timeRemaining}</p>
                </div>
              )}
            </div>
            <Link href={`/room/${activeSession.roomCode}`}>
              <Button size='sm' className='gap-1' variant={'link'}>
                Continue
                <IconArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </ModalSection>
  )
}

export default HomeModal