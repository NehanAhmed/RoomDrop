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
    <div className="flex items-center justify-center min-h-screen  bg-background selection:bg-primary/20">
      <Dialog open={success} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="mb-3 flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground">
                <IconCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              Room created!
            </DialogTitle>
            <DialogDescription>
              Share this code with others to join your room
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5">
            <div className="border border-border bg-card p-5">
              <Canvas
                text={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://chat.nehan.site'}/join?by=qrcode&code=${data?.code}`}
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

            <div className="w-full space-y-1.5">
              <Label className="text-xs text-muted-foreground">Room Code</Label>
              <div className="flex items-center justify-between gap-3 border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <IconHash className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="font-mono text-2xl font-semibold tracking-wider text-foreground">{data?.code}</span>
                </div>
                <CopyButton
                  textToCopy={data?.code || ''}
                  onCopySuccess={() => toast.success('Room code copied!')}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconClock className="h-4 w-4" aria-hidden="true" />
              <span>Expires: {data?.expiresAt ? formatExpiryDate(data.expiresAt) : 'N/A'}</span>
            </div>

            <div className="flex w-full gap-2">
              <Link href={`/room/${data?.code}`} className="flex-1">
                <Button className="group w-full">
                  <span className="flex items-center gap-2">
                    Enter Room
                    <span className="flex h-5 w-5 items-center justify-center bg-white/15 transition-colors group-hover:bg-white/25">
                      <IconArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleCloseDialog}>
                New Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <div className="border-r border-l border-t border-b border-border flex items-center justify-start">
          <div className="p-6 max-w-[60%] w-full">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center bg-primary/[0.08] ring-1 ring-primary/10">
                <IconPlus className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-heading text-4xl tracking-wide text-foreground">
                  Create Room
                </h1>
                <p className="font-sans text-sm text-muted-foreground">
                  Set up your anonymous chat space
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5 font-sans text-sm font-medium">
                  <IconSparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
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
                <Label htmlFor="duration" className="flex items-center gap-1.5 font-sans text-sm font-medium">
                  <IconClock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
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
                <p className="font-sans text-xs text-muted-foreground">Maximum 1,440 minutes (24 hours)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants" className="flex items-center gap-1.5 font-sans text-sm font-medium">
                  <IconUsers className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
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
                <p className="font-sans text-xs text-muted-foreground">Default: 5 people</p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="group w-full"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Creating…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2.5">
                      Create Room
                      <span className="flex h-5 w-5 items-center justify-center bg-white/15 transition-colors group-hover:bg-white/25">
                        <IconArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div>
            {/* <h1>Hello</h1> */}
          </div>
        </div>

        <p className="font-sans py-8 text-center text-xs text-muted-foreground/50">
          Rooms are automatically deleted after expiry &middot; Updated 2026
        </p>
      </main>
    </div>
  )
}
