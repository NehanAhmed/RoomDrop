'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconAlertTriangle, IconClock, IconHome } from '@tabler/icons-react'

interface RoomCountdownProps {
  remainingSeconds: number
  onCleanup?: () => void
}

export function RoomCountdown({ remainingSeconds: initialSeconds }: RoomCountdownProps) {
  const router = useRouter()
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds)
  const [showExpiredDialog, setShowExpiredDialog] = useState(initialSeconds <= 0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setShowExpiredDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [hrs, mins, secs].map((u) => u.toString().padStart(2, '0')).join(':')
  }

  const getTimerState = () => {
    if (remainingSeconds <= 20) return {
      variant: 'critical' as const,
      icon: IconAlertTriangle,
      className: 'bg-destructive/10 border-destructive/20 text-destructive',
    }
    if (remainingSeconds <= 120) return {
      variant: 'warning' as const,
      icon: IconClock,
      className: 'bg-accent/10 border-accent/20 text-accent-foreground',
    }
    return {
      variant: 'normal' as const,
      icon: IconClock,
      className: 'bg-muted/60 border-border/60 text-muted-foreground',
    }
  }

  const handleExpiredClose = async () => {
    setShowExpiredDialog(false)
    localStorage.removeItem('chat_room_session')
    router.push('/')
  }

  const timerState = getTimerState()
  const Icon = timerState.icon

  return (
    <>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ease-in-out ${timerState.className}`}
        role="timer"
        aria-live="polite"
        aria-label={`Room expires in ${formatTime(remainingSeconds)}`}
      >
        <Icon
          className={`h-4 w-4 transition-all duration-300 ${timerState.variant === 'critical' ? 'animate-pulse' : ''}`}
        />
        <span className="text-sm font-mono font-semibold tabular-nums tracking-tight">
          {formatTime(remainingSeconds)}
        </span>
      </div>

      <Dialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-[3px] rounded-xl bg-destructive/15">
                <div className="flex items-center justify-center w-10 h-10 rounded-[calc(1rem-3px)] bg-destructive/10">
                  <IconAlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </div>
              <div>
                <DialogTitle>Room Time Expired</DialogTitle>
                <DialogDescription>
                  This room has reached its time limit and is now closed.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleExpiredClose} className="active:scale-[0.97] transition-transform duration-150 ease-out-strong">
              <IconHome className="w-4 h-4" />
              Return to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
