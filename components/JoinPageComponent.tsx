'use client'
import ModalSection from '@/components/ModalSection'
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
import { IconLoader, IconAlertCircle, IconLoader2 } from '@tabler/icons-react'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

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

    // Check for existing session
    useEffect(() => {
        try {
            const sessionData = localStorage.getItem('chat_room_session')
            if (sessionData) {
                const session: ExistingSession = JSON.parse(sessionData)

                // Check if trying to join the same room
                const joiningCode = isQRCodeJoin ? roomCode : null
                const normalizedJoiningCode = joiningCode?.replace('-', '').toUpperCase()
                const normalizedSessionCode = session.roomCode?.replace('-', '').toUpperCase()

                if (normalizedJoiningCode && normalizedJoiningCode === normalizedSessionCode) {
                    // Same room - redirect immediately
                    toast.info('Redirecting to your active room...')
                    router.push(`/room/${session.roomCode}`)
                    return
                }

                // Different room or manual join - show warning
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

    // Validate QR code on mount
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

            <main className='w-full min-h-screen font-mono flex justify-center items-center'>
                <ModalSection>
                    <div>
                        <h1 className='text-2xl font-bold'>Join a Room</h1>
                        <p className='text-sm text-muted-foreground py-2'>
                            {isQRCodeJoin
                                ? 'Enter your name to join via QR code'
                                : 'Enter the details to join the conversation'}
                        </p>
                    </div>

                    {/* Existing Session Alert */}
                    {existingSession && (
                        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                            <IconAlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="ml-2">
                                <div className="space-y-2">
                                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                        You're already in a room
                                    </p>
                                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                        <p>Current room: <span className="font-mono font-bold">{existingSession.roomCode}</span></p>
                                        {existingSession.expiresAt && (
                                            <p className="text-xs">{getTimeRemaining(existingSession.expiresAt)}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={handleRejoinExisting}
                                            className="text-xs"
                                        >
                                            Go to Current Room
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleJoinNew}
                                            className="text-xs"
                                        >
                                            Join This Room Instead
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='w-full'>
                        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-5'>
                            {!isQRCodeJoin && (
                                <div className='space-y-2'>
                                    <Label htmlFor='room-code'>Room Code*</Label>
                                    <div className='flex justify-center'>
                                        <InputOTP
                                            id='room-code'
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={loading}
                                            maxLength={6}
                                            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot className='w-12 h-12 text-lg' index={0} />
                                                <InputOTPSlot className='w-12 h-12 text-lg' index={1} />
                                                <InputOTPSlot className='w-12 h-12 text-lg' index={2} />
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup>
                                                <InputOTPSlot className='w-12 h-12 text-lg' index={3} />
                                                <InputOTPSlot className='w-12 h-12 text-lg' index={4} />
                                                <InputOTPSlot className='w-12 h-12 text-lg' index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <p className='text-xs text-muted-foreground text-center'>
                                        Format: ABC-123 (6 characters)
                                    </p>
                                </div>
                            )}

                            {isQRCodeJoin && roomCode && (
                                <div className='space-y-2 p-4 bg-muted rounded-lg'>
                                    <Label>Room Code from QR</Label>
                                    <p className='text-lg font-bold text-center'>
                                        {roomCode.slice(0, 3).toUpperCase()}-{roomCode.slice(3).toUpperCase()}
                                    </p>
                                </div>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor='name'>Your Name*</Label>
                                <Input
                                    id='name'
                                    placeholder='e.g: Nehan Ahmed'
                                    type='text'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    maxLength={50}
                                    className='py-5 border border-primary'
                                />
                                <p className='text-xs text-muted-foreground'>
                                    {name.length}/50 characters • Visible to other participants
                                </p>
                            </div>

                            <Button
                                type='submit'
                                className='px-5 py-5 w-full'
                                disabled={isSubmitDisabled()}
                            >
                                {loading ? (
                                    <>
                                        <IconLoader className='animate-spin mr-2' size={20} />
                                        Joining...
                                    </>
                                ) : (
                                    'Join Room'
                                )}
                            </Button>
                        </form>
                    </div>
                </ModalSection>
            </main>
        </Suspense>

    )
}

export default JoinPageComp