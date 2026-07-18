'use client'

import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconLoader, IconArrowLeft, IconPlus, IconClock, IconUsers, IconQrcode, IconCheck, IconSparkles, IconHash } from '@tabler/icons-react'
import { useQRCode } from 'next-qrcode'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'sonner'


interface RoomCreationResponse {
  message: string
  code: string
  expiresAt: string
  status: number
}
const CreateRoomComp = () => {
  const [name, setName] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [participantsCount, setParticipantsCount] = useState<string>('5')
  const [data, setData] = useState<RoomCreationResponse>()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

    try {
      setLoading(true)

      if (!name || !duration || !participantsCount) {
        toast.error("All Fields are Required")
        setLoading(false)
        return
      }

      const durationNum = Number(duration)
      const participantsNum = Number(participantsCount)

      if (isNaN(durationNum) || durationNum <= 0) {
        toast.error("Duration must be a positive number")
        setLoading(false)
        return
      }

      if (isNaN(participantsNum) || participantsNum <= 0) {
        toast.error("Participants count must be a positive number")
        setLoading(false)
        return
      }

      const formData = {
        name: name.trim(),
        duration: durationNum,
        participantsCount: participantsNum
      }

      const response = await fetch(`${BASE_URL}/api/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        toast.error(responseData.message || "An Error Occurred while Creating the Room")
        setLoading(false)
        return
      }

      setData(responseData)
      setLoading(false)
      setSuccess(true)
      toast.success("Room Created Successfully!")

      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_room_session', JSON.stringify({
          userName: name.trim(),
          roomCode: responseData.code,
          joinedAt: new Date().toISOString(),
          expiresAt: responseData.expiresAt
        }))
      }
    } catch (error: any) {
      console.error('Error creating room:', error)
      toast.error(error?.message || "Failed to create room")
      setSuccess(false)
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

  const { Canvas } = useQRCode()

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/3 blur-3xl"
        />
      </div>

      {/* Back Button */}
      <div
        className="absolute top-6 left-6 z-20"
      >
        <Link href="/" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
          <IconArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Success Dialog */}
      <Dialog open={success} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconCheck className="w-5 h-5 text-primary" />
                </div>
              Room Created!
            </DialogTitle>
            <DialogDescription>
              Share this code with others to join your room
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex flex-col items-center gap-5"
          >
            <div className="p-4 bg-card rounded-xl border border-border/50">
              <Canvas
                text={`https://room-drop.vercel.app/join?by=qrcode&code=${data?.code}`}
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

            <div className="w-full">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Room Code</Label>
              <div
                className="flex items-center justify-between gap-3 p-4 bg-card border border-border/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <IconHash className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-mono font-semibold tracking-wider">{data?.code}</span>
                </div>
                <CopyButton
                  textToCopy={data?.code || ''}
                  onCopySuccess={() => toast.success('Room code copied!')}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  copiedClassName="p-2 bg-primary/20 rounded-lg"
                />
              </div>
            </div>

            <div className="w-full flex items-center gap-2 text-sm text-muted-foreground">
              <IconClock className="w-4 h-4" />
              <span>Expires: {data?.expiresAt ? formatExpiryDate(data.expiresAt) : 'N/A'}</span>
            </div>

            <div className="w-full flex gap-1">
              <Link
                href={`/room/${data?.code}`}
                className='w-10/12 flex items-center justify-center gap-2'
              >

                <Button className="w-full">
                  Enter Room
                  <IconArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </Link>
                <Button variant="secondary" onClick={handleCloseDialog}>
                  New Room
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div
        className="relative z-10 w-full max-w-md mx-auto px-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
          >
            <IconPlus className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Create Room
          </h1>
          <p className="text-muted-foreground text-sm">
            Set up your anonymous chat space
          </p>
        </div>

        {/* Form */}
        <form
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          {/* Name Field */}
          <div
            className="space-y-2"
          >
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <IconSparkles className="w-4 h-4 text-muted-foreground" />
              Your Name
            </Label>
            <Input
              id="name"
              disabled={loading}
              placeholder="Enter your display name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="h-12 transition-all duration-200"
            />
          </div>

          {/* Duration Field */}
          <div
            className="space-y-2"
          >
            <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
              <IconClock className="w-4 h-4 text-muted-foreground" />
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              disabled={loading}
              placeholder="e.g., 30"
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-12 transition-all duration-200"
            />
            <p className="text-xs text-muted-foreground">Maximum: 1440 minutes (24 hours)</p>
          </div>

          {/* Participants Field */}
          <div
            className="space-y-2"
          >
            <Label htmlFor="participants" className="flex items-center gap-2 text-sm font-medium">
              <IconUsers className="w-4 h-4 text-muted-foreground" />
              Max Participants
            </Label>
            <Input
              id="participants"
              disabled={loading}
              placeholder="e.g., 5"
              type="number"
              min="2"
              max="50"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(e.target.value)}
              className="h-12 transition-all duration-200"
            />
            <p className="text-xs text-muted-foreground">Default: 5 people</p>
          </div>

          {/* Submit Button */}
          <div
            className="pt-2"
          >
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-medium gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <IconLoader className="animate-spin w-5 h-5" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IconPlus className="w-5 h-5" />
                    Create Room
                  </>
                )}
              </Button>
          </div>
        </form>

        {/* Footer Note */}
        <p
          className="text-center text-xs text-muted-foreground/60 mt-8"
        >
          Rooms are automatically deleted after expiry
        </p>
      </div>
    </div>
  )
}

export default CreateRoomComp