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
  const roomCodeParam = searchParams.get('code')
  const isQRCodeJoin = by === 'qrcode'
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

  useEffect(() => {
    try {
      const raw = localStorage.getItem('chat_room_session')
      if (!raw) return
      const session: ExistingSession = JSON.parse(raw)

      if (isQRCodeJoin && roomCodeParam) {
        if (session.roomCode?.toUpperCase() === roomCodeParam.toUpperCase()) {
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
    <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background selection:bg-primary/20">
      {/* ── Back ── */}
      <div
        className="absolute top-6 left-6 z-20"
        style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both` }}
      >
        <Link href="/">
          <Button variant="ghost" size="sm" className="active:scale-[0.97] transition-transform duration-150 ease-out-strong">
            <IconArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </Button>
        </Link>
      </div>

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
                {isQRCodeJoin ? (
                  <IconQrcode className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <IconDoorEnter className="w-6 h-6" aria-hidden="true" />
                )}
              </div>
            </div>
          </div>
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tighter leading-[1.1] text-foreground mb-2">
            Join Room
          </h1>
          <p className="text-sm text-muted-foreground max-w-[30ch] mx-auto">
            {isQRCodeJoin
              ? 'Enter your name to join via QR code'
              : 'Enter the room code to join the conversation'}
          </p>
        </div>

        {/* ── Existing Session (Double-Bezel) ── */}
        {existingSession && (
          <div
            className="mb-8"
            style={{ animation: `fade-up-heavy 800ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: '150ms' }}
          >
            <div className="p-[3px] rounded-2xl bg-muted/60 border border-border/60">
              <div className="rounded-[calc(1.75rem-4px)] bg-card px-5 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em] mb-2">
                  Active Session
                </p>
                <div className="flex items-center gap-2 mb-1.5">
                  <IconHash className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="font-mono font-semibold text-foreground">{existingSession.roomCode}</span>
                </div>
                {existingSession.expiresAt && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                    <IconClock className="w-3.5 h-3.5" aria-hidden="true" />
                    {getTimeRemaining(existingSession.expiresAt)}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleRejoinExisting} className="flex-1 active:scale-[0.97] transition-transform duration-150 ease-out-strong">
                    Return to Room
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleJoinNew} className="active:scale-[0.97] transition-transform duration-150 ease-out-strong">
                    Join New
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          style={{ animation: `fade-up 700ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: existingSession ? '250ms' : '200ms' }}
        >
          {/* Room Code */}
          {!isQRCodeJoin && (
            <div className="space-y-3">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <IconHash className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
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
              <p className="text-xs text-muted-foreground text-center">
                Enter 6-character room code
              </p>
            </div>
          )}

          {/* QR Code Display */}
          {isQRCodeJoin && roomCodeParam && (
            <div className="space-y-3">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <IconQrcode className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                Room from QR
              </Label>
              <div className="p-[3px] rounded-2xl bg-muted/60 border border-border/60">
                <div className="rounded-[calc(1.75rem-4px)] bg-card px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <div className="flex items-center justify-center gap-3">
                    <IconHash className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span className="text-xl font-mono font-semibold tracking-wider text-foreground">
                      {roomCodeParam.slice(0, 2).toUpperCase()}-{roomCodeParam.slice(4).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
              <IconUser className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
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
            <p className="text-xs text-muted-foreground">{name.length}/50 characters</p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitDisabled()}
              className="group w-full active:scale-[0.97] transition-transform duration-150 ease-out-strong"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <IconLoader className="animate-spin w-4 h-4" aria-hidden="true" />
                  Joining…
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  Join Room
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                    <IconLogin className="w-3 h-3" aria-hidden="true" />
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
          Your name will be visible to other room participants &middot; Updated 2026
        </p>
      </div>
    </main>
  )
}

export default function JoinPageComp() {
  return (
    <Suspense fallback={
      <main className="min-h-[100dvh] flex items-center justify-center bg-background">
        <IconLoader2 className="animate-spin w-6 h-6 text-muted-foreground" aria-hidden="true" />
      </main>
    }>
      <JoinForm />
    </Suspense>
  )
}
