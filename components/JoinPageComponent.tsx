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
import { motion, AnimatePresence, Variants } from 'motion/react'
import Link from 'next/link'

interface ExistingSession {
    userName: string
    roomCode: string
    joinedAt: string
    expiresAt?: string
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0
    }
}

const JoinPageComp = () => {
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [existingSession, setExistingSession] = useState<ExistingSession | null>(null)
    const [focusedField, setFocusedField] = useState<string | null>(null)
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
                    <motion.div
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
                    />
                    <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: [-6, 6, -6] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-primary/3 blur-3xl"
                    />
                </div>

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-6 left-6 z-20"
                >
                    <Link href="/">
                        <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                                <IconArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 w-full max-w-md mx-auto px-6"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
                        >
                            {isQRCodeJoin ? (
                                <IconQrcode className="w-7 h-7 text-primary" />
                            ) : (
                                <IconDoorEnter className="w-7 h-7 text-primary" />
                            )}
                        </motion.div>
                        <h1 className="text-3xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            Join Room
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isQRCodeJoin
                                ? 'Enter your name to join via QR code'
                                : 'Enter the room code to join the conversation'}
                        </p>
                    </motion.div>

                    {/* Existing Session Alert */}
                    <AnimatePresence>
                        {existingSession && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                variants={itemVariants}
                                className="mb-6"
                            >
                                <Alert className="border-primary/20 bg-card">
                                    <IconAlertCircle className="h-5 w-5 text-primary" />
                                    <AlertDescription className="ml-3">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    You're already in a room
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
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={handleRejoinExisting}
                                                        className="w-full text-xs"
                                                    >
                                                        Return to Room
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={handleJoinNew}
                                                        className="text-xs"
                                                    >
                                                        Join New
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <motion.form
                        variants={itemVariants}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Room Code Field - Manual Entry */}
                        {!isQRCodeJoin && (
                            <motion.div
                                className="space-y-3"
                                animate={{ scale: focusedField === 'code' ? 1.01 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <IconHash className="w-4 h-4 text-muted-foreground" />
                                    Room Code
                                </Label>
                                <div className="flex justify-center">
                                    <InputOTP
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        onFocus={() => setFocusedField('code')}
                                        onBlur={() => setFocusedField(null)}
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
                            </motion.div>
                        )}

                        {/* QR Code Display */}
                        {isQRCodeJoin && roomCode && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className='space-y-3'
                            >
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <IconQrcode className="w-4 h-4 text-muted-foreground" />
                                    Room from QR
                                </Label>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 bg-card border border-border/50 rounded-xl"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <IconHash className="w-5 h-5 text-primary" />
                                        <span className="text-xl font-mono font-semibold tracking-wider">
                                            {roomCode.slice(0, 3).toUpperCase()}-{roomCode.slice(3).toUpperCase()}
                                        </span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Name Field */}
                        <motion.div
                            className="space-y-2"
                            animate={{ scale: focusedField === 'name' ? 1.01 : 1 }}
                            transition={{ duration: 0.2 }}
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
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                maxLength={50}
                                className='h-12 transition-all duration-200'
                            />
                            <p className='text-xs text-muted-foreground'>
                                {name.length}/50 characters
                            </p>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            variants={itemVariants}
                            className="pt-2"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
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
                            </motion.div>
                        </motion.div>
                    </motion.form>

                    {/* Footer Note */}
                    <motion.p
                        variants={itemVariants}
                        className="text-center text-xs text-muted-foreground/60 mt-8"
                    >
                        Your name will be visible to other room participants
                    </motion.p>
                </motion.div>
            </div>
        </Suspense>
    )
}

export default JoinPageComp