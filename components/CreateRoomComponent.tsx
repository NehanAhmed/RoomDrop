'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQRCode } from 'next-qrcode'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  IconLoader,
  IconArrowLeft,
  IconPlus,
  IconClock,
  IconUsers,
  IconCheck,
  IconSparkles,
  IconHash,
  IconArrowRight,
} from '@tabler/icons-react'

interface RoomCreationResponse {
  message: string
  code: string
  expiresAt: string
  status: number
}

export default function CreateRoomComp() {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [participantsCount, setParticipantsCount] = useState('5')
  const [data, setData] = useState<RoomCreationResponse>()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { Canvas } = useQRCode()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''
    try {
      setLoading(true)
      if (!name || !duration || !participantsCount) {
        toast.error('All fields are required')
        setLoading(false)
        return
      }
      const durationNum = Number(duration)
      const participantsNum = Number(participantsCount)
      if (isNaN(durationNum) || durationNum <= 0) {
        toast.error('Duration must be a positive number')
        setLoading(false)
        return
      }
      if (isNaN(participantsNum) || participantsNum <= 0) {
        toast.error('Participants count must be a positive number')
        setLoading(false)
        return
      }

      const response = await fetch(`${BASE_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), duration: durationNum, participantsCount: participantsNum }),
      })
      const responseData: RoomCreationResponse = await response.json()
      if (!response.ok) {
        toast.error(responseData.message || 'An error occurred while creating the room')
        setLoading(false)
        return
      }
      setData(responseData)
      setSuccess(true)
      toast.success('Room created successfully!')
      localStorage.setItem('chat_room_session', JSON.stringify({
        userName: name.trim(),
        roomCode: responseData.code,
        joinedAt: new Date().toISOString(),
        expiresAt: responseData.expiresAt,
      }))
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create room'
      toast.error(msg)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setSuccess(false)
    setName('')
    setDuration('')
    setParticipantsCount('5')
    setData(undefined)
  }

  const formatExpiryDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleString()
    } catch {
      return isoDate
    }
  }

  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background selection:bg-primary/20">
      {/* ── Back ── */}
      <div
        className="absolute top-6 left-6 z-20"
        style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both` }}
      >
        <Link href="/" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors duration-200">
          <IconArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Link>
      </div>

      {/* ── Success Dialog ── */}
      <Dialog open={success} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="p-[3px] rounded-2xl bg-primary/10 w-fit mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-[calc(1rem-3px)] bg-primary text-primary-foreground">
                  <IconCheck className="w-5 h-5" aria-hidden="true" />
                </div>
              </div>
              Room created!
            </DialogTitle>
            <DialogDescription>
              Share this code with others to join your room
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5">
            <div className="p-[3px] rounded-2xl bg-muted/60 border border-border/60">
              <div className="rounded-[calc(1.75rem-4px)] bg-card px-6 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <Canvas
                  text={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://room-drop.vercel.app'}/join?by=qrcode&code=${data?.code}`}
                  options={{
                    errorCorrectionLevel: 'M',
                    margin: 2,
                    scale: 4,
                    width: 180,
                    color: {
                      dark: '#000000',
                      light: '#ffffff',
                    },
                  }}
                />
              </div>
            </div>

            <div className="w-full space-y-1.5">
              <Label className="text-xs text-muted-foreground">Room Code</Label>
              <div className="flex items-center justify-between gap-3 p-[3px] rounded-2xl bg-muted/60 border border-border/60">
                <div className="flex items-center gap-3 rounded-[calc(1.75rem-4px)] bg-card px-4 py-3 w-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <IconHash className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span className="text-2xl font-mono font-semibold tracking-wider text-foreground">{data?.code}</span>
                </div>
                <CopyButton
                  textToCopy={data?.code || ''}
                  onCopySuccess={() => toast.success('Room code copied!')}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconClock className="w-4 h-4" aria-hidden="true" />
              <span>Expires: {data?.expiresAt ? formatExpiryDate(data.expiresAt) : 'N/A'}</span>
            </div>

            <div className="flex gap-2 w-full">
              <Link href={`/room/${data?.code}`} className="flex-1">
                <Button className="group w-full active:scale-[0.97] transition-transform duration-150 ease-out-strong">
                  <span className="flex items-center gap-2">
                    Enter Room
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                      <IconArrowRight className="w-3 h-3" aria-hidden="true" />
                    </span>
                  </span>
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleCloseDialog} className="active:scale-[0.97] transition-transform duration-150 ease-out-strong">
                New Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-16">
        {/* Header */}
        <div
          className="text-center mb-10"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-center mb-5">
            <div className="p-[3px] rounded-2xl bg-primary/10">
              <div className="flex items-center justify-center w-12 h-12 rounded-[calc(1.5rem-3px)] bg-primary text-primary-foreground">
                <IconPlus className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
          </div>
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tighter leading-[1.1] text-foreground mb-2">
            Create Room
          </h1>
          <p className="text-sm text-muted-foreground max-w-[28ch] mx-auto">
            Set up your anonymous chat space
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '200ms' }}
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
              <IconSparkles className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              Your Name
            </Label>
            <Input
              id="name"
              disabled={loading}
              placeholder="Enter your display name…"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-1.5 text-sm font-medium">
              <IconClock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              disabled={loading}
              placeholder="e.g. 30…"
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">Maximum 1,440 minutes (24 hours)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants" className="flex items-center gap-1.5 text-sm font-medium">
              <IconUsers className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              Max Participants
            </Label>
            <Input
              id="participants"
              disabled={loading}
              placeholder="e.g. 5…"
              type="number"
              min="2"
              max="50"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">Default: 5 people</p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="group w-full active:scale-[0.97] transition-transform duration-150 ease-out-strong"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <IconLoader className="animate-spin w-4 h-4" aria-hidden="true" />
                  Creating…
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  Create Room
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                    <IconArrowRight className="w-3 h-3" aria-hidden="true" />
                  </span>
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p
          className="text-center text-xs text-muted-foreground/50 mt-12"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '300ms' }}
        >
          Rooms are automatically deleted after expiry &middot; Updated 2026
        </p>
      </div>
    </main>
  )
}
