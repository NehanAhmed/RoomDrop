'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import React, { useState, useEffect, Suspense } from 'react'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    IconLoader,
    IconAlertCircle,
    IconLoader2,
    IconArrowLeft,
    IconLogin,
    IconDoorEnter,
    IconQrcode,
    IconUser,
    IconHash,
    IconClock
} from '@tabler/icons-react'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import Link from 'next/link'

interface ExistingSession {
    userName: string
    roomCode: string
    joinedAt: string
    expiresAt?: string
}
const JoinPageComp = () => {
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [existingSession, setExistingSession] = useState<ExistingSession | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    const by = searchParams.get('by')
    const roomCode = searchParams.get('code')
    const isQRCodeJoin = by === 'qrcode'
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

    useEffect(() => {
        try {
            const sessionData = localStorage.getItem('chat_room_session')
            if (sessionData) {
                const session: ExistingSession = JSON.parse(sessionData)
                const joiningCode = isQRCodeJoin ? roomCode : null
                const normalizedJoiningCode = joiningCode?.toUpperCase()
                const normalizedSessionCode = session.roomCode?.toUpperCase()

                if (normalizedJoiningCode && normalizedJoiningCode === normalizedSessionCode) {
                    toast.info('Redirecting to your active room...')
                    router.push(`/room/${session.roomCode}`)
                    return
                }

                if (session.expiresAt) {
                    const expiryTime = new Date(session.expiresAt).getTime()
                    const now = new Date().getTime()

                    if (now < expiryTime) {
                        setExistingSession(session)
                        setName(session.userName)
                    } else {
                        localStorage.removeItem('chat_room_session')
                    }
                }
            }
        } catch (error) {
            console.error('Error checking session:', error)
            localStorage.removeItem('chat_room_session')
        }
    }, [isQRCodeJoin, roomCode, router])

    useEffect(() => {
        if (isQRCodeJoin && roomCode && roomCode.length !== 6) {
            toast.error("Invalid QR code. Please scan again.")
        }
    }, [isQRCodeJoin, roomCode])

    const validateInputs = () => {
        if (!name.trim()) {
            toast.error("Name is required")
            return false
        }

        if (name.trim().length > 50) {
            toast.error("Name must be 50 characters or less")
            return false
        }

        const codeToValidate = isQRCodeJoin ? roomCode : code

        if (!codeToValidate) {
            toast.error(isQRCodeJoin ? "Invalid QR code" : "Room code is required")
            return false
        }

        if (codeToValidate.length !== 6) {
            toast.error("Room code must be 6 characters")
            return false
        }

        return true
    }

    const joinRoom = async (formattedCode: string) => {
        const response = await fetch(`${BASE_URL}/api/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: formattedCode,
                name: name.trim()
            })
        })

        const responseData = await response.json()

        if (!response.ok) {
            throw new Error(responseData.message || "Failed to join room")
        }

        return responseData
    }

    const saveSession = (formattedCode: string, expiresAt?: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('chat_room_session', JSON.stringify({
                userName: name.trim(),
                roomCode: formattedCode,
                joinedAt: new Date().toISOString(),
                expiresAt: expiresAt
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateInputs()) return

        setLoading(true)

        try {
            const codeToUse = isQRCodeJoin ? roomCode! : code
            const formattedCode = `${codeToUse.slice(0, 3).toUpperCase()}-${codeToUse.slice(3).toUpperCase()}`

            const validateRoomExists = async (roomCode: string) => {
                const response = await fetch(`${BASE_URL}/api/room/${roomCode}/status`)
                return response.ok
            }

            const isRoom = validateRoomExists(formattedCode)

            if (!isRoom) {
                toast.error("Room Does Not Exists")
                return
            }
            const responseData = await joinRoom(formattedCode)

            toast.success("Joined room successfully!")
            saveSession(formattedCode, responseData.expiresAt)

            setTimeout(() => {
                router.push(`/room/${formattedCode}`)
            }, 1000)

        } catch (error: any) {
            console.error('Error joining room:', error)
            toast.error(error?.message || "Failed to join room")
        } finally {
            setLoading(false)
        }
    }

    const handleRejoinExisting = () => {
        if (existingSession) {
            router.push(`/room/${existingSession.roomCode}`)
        }
    }

    const handleJoinNew = () => {
        localStorage.removeItem('chat_room_session')
        setExistingSession(null)
        toast.info("Previous session cleared. Join a new room.")
    }

    const isSubmitDisabled = () => {
        if (loading || !name.trim()) return true
        return isQRCodeJoin ? !roomCode || roomCode.length !== 6 : code.length !== 6
    }

    const getTimeRemaining = (expiryDate: string) => {
        try {
            const now = new Date().getTime()
            const expiry = new Date(expiryDate).getTime()
            const diff = expiry - now

            if (diff <= 0) return 'Expired'

            const minutes = Math.floor(diff / 60000)
            const hours = Math.floor(minutes / 60)

            if (hours > 0) {
                return `${hours}h ${minutes % 60}m remaining`
            }
            return `${minutes}m remaining`
        } catch {
            return 'Unknown'
        }
    }

    return (
        <Suspense fallback={<IconLoader2 className="animate-spin" />}>
            <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
                    />
                    <div
                        className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-primary/3 blur-3xl"
                    />
                </div>

                {/* Back Button */}
                <div
                    className="absolute top-6 left-6 z-20"
                >
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <IconArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                {/* Main Content */}
                <div
                    className="relative z-10 w-full max-w-md mx-auto px-6"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
                        >
                            {isQRCodeJoin ? (
                                <IconQrcode className="w-7 h-7 text-primary" />
                            ) : (
                                <IconDoorEnter className="w-7 h-7 text-primary" />
                            )}
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            Join Room
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isQRCodeJoin
                                ? 'Enter your name to join via QR code'
                                : 'Enter the room code to join the conversation'}
                        </p>
                    </div>

                    {/* Existing Session Alert */}
                    {existingSession && (
                        <div
                            className="mb-6"
                        >
                                <Alert className="border-primary/20 bg-card">
                                    <IconAlertCircle className="h-5 w-5 text-primary" />
                                    <AlertDescription className="ml-3">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    You&apos;re already in a room
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <IconHash className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-mono font-semibold">{existingSession.roomCode}</span>
                                                </div>
                                                {existingSession.expiresAt && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                                        <IconClock className="w-3.5 h-3.5" />
                                                        {getTimeRemaining(existingSession.expiresAt)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={handleRejoinExisting}
                                                        className="w-full text-xs"
                                                    >
                                                        Return to Room
                                                    </Button>
                                                </div>
                                                <div>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={handleJoinNew}
                                                        className="text-xs"
                                                    >
                                                        Join New
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Room Code Field - Manual Entry */}
                        {!isQRCodeJoin && (
                            <div
                                className="space-y-3"
                            >
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <IconHash className="w-4 h-4 text-muted-foreground" />
                                    Room Code
                                </Label>
                                <div className="flex justify-center">
                                    <InputOTP
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        disabled={loading}
                                        maxLength={6}
                                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                                        type='text'
                                        className="gap-2"
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot className="w-12 h-14 text-lg bg-card border-border/50" index={0} />
                                            <InputOTPSlot className="w-12 h-14 text-lg bg-card border-border/50" index={1} />
                                            <InputOTPSlot className="w-12 h-14 text-lg bg-card border-border/50" index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator className="text-muted-foreground" />
                                        <InputOTPGroup>
                                            <InputOTPSlot className="w-12 h-14 text-lg bg-card border-border/50" index={3} />
                                            <InputOTPSlot className="w-12 h-14 text-lg bg-card border-border/50" index={4} />
                                            <InputOTPSlot className="w-12 h-14 text-lg bg-card border-border/50" index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <p className='text-xs text-muted-foreground text-center'>
                                    Enter 6-character room code
                                </p>
                            </div>
                        )}

                        {/* QR Code Display */}
                        {isQRCodeJoin && roomCode && (
                            <div
                                className='space-y-3'
                            >
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <IconQrcode className="w-4 h-4 text-muted-foreground" />
                                    Room from QR
                                </Label>
                                <div
                                    className="p-4 bg-card border border-border/50 rounded-xl"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <IconHash className="w-5 h-5 text-primary" />
                                        <span className="text-xl font-mono font-semibold tracking-wider">
                                            {roomCode.slice(0, 3).toUpperCase()}-{roomCode.slice(3).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Name Field */}
                        <div
                            className="space-y-2"
                        >
                            <Label htmlFor='name' className="flex items-center gap-2 text-sm font-medium">
                                <IconUser className="w-4 h-4 text-muted-foreground" />
                                Your Name
                            </Label>
                            <Input
                                id='name'
                                placeholder='Enter your display name'
                                type='text'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                maxLength={50}
                                className='h-12 transition-all duration-200'
                            />
                            <p className='text-xs text-muted-foreground'>
                                {name.length}/50 characters
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div
                            className="pt-2"
                        >
                                <Button
                                    type='submit'
                                    size="lg"
                                    className='w-full h-12 text-base font-medium gap-2'
                                    disabled={isSubmitDisabled()}
                                >
                                    {loading ? (
                                        <>
                                            <IconLoader className='animate-spin w-5 h-5' />
                                            Joining...
                                        </>
                                    ) : (
                                        <>
                                            <IconLogin className='w-5 h-5' />
                                            Join Room
                                        </>
                                    )}
                                </Button>
                        </div>
                    </form>

                    {/* Footer Note */}
                    <p
                        className="text-center text-xs text-muted-foreground/60 mt-8"
                    >
                        Your name will be visible to other room participants
                    </p>
                </div>
            </div>
        </Suspense>
    )
}

export default JoinPageComp