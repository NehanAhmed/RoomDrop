'use client'

import { useState, useEffect, Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import {
  IconLoader,
  IconArrowLeft,
  IconLogin,
  IconDoorEnter,
  IconQrcode,
  IconUser,
  IconHash,
  IconClock,
  IconLoader2,
} from '@tabler/icons-react'

interface ExistingSession {
  userName: string
  roomCode: string
  joinedAt: string
  expiresAt?: string
}

function JoinForm() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingSession, setExistingSession] = useState<ExistingSession | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const by = searchParams.get('by')
  const rawCodeParam = searchParams.get('code')
  const roomCodeParam = rawCodeParam ? rawCodeParam.replace(/-/g, '') : null
  const formattedRoomCode = roomCodeParam && roomCodeParam.length === 6
    ? `${roomCodeParam.slice(0, 3)}-${roomCodeParam.slice(3)}`.toUpperCase()
    : null
  const isQRCodeJoin = by === 'qrcode'
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

  useEffect(() => {
    try {
      const raw = localStorage.getItem('chat_room_session')
      if (!raw) return
      const session: ExistingSession = JSON.parse(raw)

      if (isQRCodeJoin && roomCodeParam) {
        if (session.roomCode?.replace(/-/g, '').toUpperCase() === roomCodeParam.toUpperCase()) {
          toast.info('Redirecting to your active room…')
          router.push(`/room/${session.roomCode}`)
          return
        }
      }

      if (session.expiresAt) {
        if (Date.now() < new Date(session.expiresAt).getTime()) {
          setExistingSession(session)
          setName(session.userName)
        } else {
          localStorage.removeItem('chat_room_session')
        }
      } else {
        setExistingSession(session)
        setName(session.userName)
      }
    } catch {
      localStorage.removeItem('chat_room_session')
    }
  }, [isQRCodeJoin, roomCodeParam, router])

  useEffect(() => {
    if (isQRCodeJoin && roomCodeParam && roomCodeParam.length !== 6) {
      toast.error('Invalid QR code. Please scan again.')
    }
  }, [isQRCodeJoin, roomCodeParam])

  const validateInputs = () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return false
    }
    if (name.trim().length > 50) {
      toast.error('Name must be 50 characters or less')
      return false
    }
    const codeToValidate = isQRCodeJoin ? roomCodeParam : code
    if (!codeToValidate || codeToValidate.length !== 6) {
      toast.error(isQRCodeJoin ? 'Invalid QR code' : 'Room code must be 6 characters')
      return false
    }
    return true
  }

  const joinRoom = async (formattedCode: string) => {
    const response = await fetch(`${BASE_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: formattedCode, name: name.trim() }),
    })
    const responseData = await response.json()
    if (!response.ok) throw new Error(responseData.message || 'Failed to join room')
    return responseData
  }

  const saveSession = (formattedCode: string, expiresAt?: string) => {
    localStorage.setItem('chat_room_session', JSON.stringify({
      userName: name.trim(),
      roomCode: formattedCode,
      joinedAt: new Date().toISOString(),
      expiresAt,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInputs()) return
    setLoading(true)
    try {
      const rawCode = (isQRCodeJoin ? roomCodeParam : code)!
      const formattedCode = `${rawCode.slice(0, 3).toUpperCase()}-${rawCode.slice(3).toUpperCase()}`
      const responseData = await joinRoom(formattedCode)
      toast.success('Joined room successfully!')
      saveSession(formattedCode, responseData.expiresAt)
      router.push(`/room/${formattedCode}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join room'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRejoinExisting = async () => {
    if (!existingSession) return
    try {
      const res = await fetch(`/api/messages/${existingSession.roomCode}`)
      if (!res.ok) {
        toast.error('Room has expired or no longer exists')
        localStorage.removeItem('chat_room_session')
        setExistingSession(null)
        return
      }
      router.push(`/room/${existingSession.roomCode}`)
    } catch {
      toast.error('Could not verify room. Please try again.')
    }
  }

  const handleJoinNew = () => {
    localStorage.removeItem('chat_room_session')
    setExistingSession(null)
    toast.info('Previous session cleared. Join a new room.')
  }

  const getTimeRemaining = (expiryDate: string) => {
    try {
      const diff = new Date(expiryDate).getTime() - Date.now()
      if (diff <= 0) return 'Expired'
      const m = Math.floor(diff / 60000)
      const h = Math.floor(m / 60)
      return h > 0 ? `${h}h ${m % 60}m remaining` : `${m}m remaining`
    } catch {
      return 'Unknown'
    }
  }

  const isSubmitDisabled = () => {
    if (loading || !name.trim()) return true
    return isQRCodeJoin ? !roomCodeParam || roomCodeParam.length !== 6 : code.length !== 6
  }

  return (
    <div className="flex items-center justify-center min-h-screen  bg-background selection:bg-primary/20">
      <main className="mx-auto  flex w-full max-w-5xl flex-1 flex-col gap-10 px-6">
        <div className="flex items-center justify-start  border-r border-l border-t border-b border-border">
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
                {isQRCodeJoin ? (
                  <IconQrcode className="h-5 w-5 text-primary" aria-hidden="true" />
                ) : (
                  <IconDoorEnter className="h-5 w-5 text-primary" aria-hidden="true" />
                )}
              </div>
              <div>
                <h1 className="font-heading text-4xl tracking-wide text-foreground">
                  Join Room
                </h1>
                <p className="font-sans text-sm text-muted-foreground">
                  {isQRCodeJoin
                    ? 'Enter your name to join via QR code'
                    : 'Enter the room code to join the conversation'}
                </p>
              </div>
            </div>

            {existingSession && (
              <div className="mt-8 max-w-sm border border-border/60 bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Active Room
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <IconHash className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="font-mono font-semibold text-foreground">{existingSession.roomCode}</span>
                </div>
                {existingSession.expiresAt && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconClock className="h-3.5 w-3.5" aria-hidden="true" />
                    {getTimeRemaining(existingSession.expiresAt)}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={handleRejoinExisting} className="flex-1">
                    Return to Room
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleJoinNew}>
                    Join New
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-5">
              {!isQRCodeJoin && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-1.5 font-sans text-sm font-medium">
                    <IconHash className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    Room Code
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={code}
                      onChange={setCode}
                      disabled={loading}
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-center font-sans text-xs text-muted-foreground">
                    Enter 6-character room code
                  </p>
                </div>
              )}

              {isQRCodeJoin && roomCodeParam && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-1.5 font-sans text-sm font-medium">
                    <IconQrcode className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    Room from QR
                  </Label>
                  <div className="border border-border bg-card p-4">
                    <div className="flex items-center justify-center gap-3">
                      <IconHash className="h-5 w-5 text-primary" aria-hidden="true" />
                      <span className="font-mono text-xl font-semibold tracking-wider text-foreground">
                        {formattedRoomCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5 font-sans text-sm font-medium">
                  <IconUser className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your display name…"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  maxLength={50}
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="font-sans text-xs text-muted-foreground">{name.length}/50 characters</p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitDisabled()}
                  className="group w-full"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Joining…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2.5">
                      Join Room
                      <span className="flex h-5 w-5 items-center justify-center bg-white/15 transition-colors group-hover:bg-white/25">
                        <IconLogin className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div>
                  {/* <h1>hello</h1> */}
          </div>
        </div>

        <p className="font-sans py-8 text-center text-xs text-muted-foreground/50">
          Your name will be visible to other room participants &middot; Updated 2026
        </p>
      </main>
    </div>
  )
}

export default function JoinPageComp() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    }>
      <JoinForm />
    </Suspense>
  )
}
