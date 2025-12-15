'use client'
import ModalSection from '@/components/ModalSection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { IconLoader } from '@tabler/icons-react'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

const Page = () => {
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

        try {
            setLoading(true)

            // Validation
            if (!code || !name) {
                toast.error("All Fields are Required")
                setLoading(false)
                return
            }

            if (code.length !== 6) {
                toast.error("Room code must be 6 characters")
                setLoading(false)
                return
            }

            if (name.trim().length === 0 || name.trim().length > 50) {
                toast.error("Name must be between 1 and 50 characters")
                setLoading(false)
                return
            }

            // Format code as ABC-123
            const formattedCode = `${code.slice(0, 3).toUpperCase()}-${code.slice(3).toUpperCase()}`

            const formData = {
                code: formattedCode,
                name: name.trim()
            }

            const response = await fetch(`${BASE_URL}/api/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const responseData = await response.json()

            if (!response.ok) {
                toast.error(responseData.message || "An Error Occurred while Joining the Room")
                setLoading(false)
                return
            }

            setLoading(false)
            toast.success("Joined Room Successfully!")
            
            // Redirect to room
            setTimeout(() => {
                router.push(`/room/${formattedCode}`)
            }, 1500)

        } catch (error: any) {
            console.error('Error joining room:', error)
            toast.error(error?.message || "Failed to join room")
            setLoading(false)
        }
    }

    return (
        <main className='w-full min-h-screen font-mono flex justify-center items-center'>
            <ModalSection>
                <div>
                    <h1 className='text-2xl font-bold'>Join a Room</h1>
                    <p className='text-sm text-muted-foreground py-2'>
                        Enter the room code to join the conversation
                    </p>
                </div>
                <div className='w-full'>
                    <form onSubmit={handleSubmit} className='w-full flex flex-col gap-5'>
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
                                This name will be visible to other participants
                            </p>
                        </div>

                        <div>
                            <Button
                                type='submit'
                                className='px-5 py-5 w-full'
                                disabled={loading || code.length !== 6 || !name.trim()}
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
                        </div>
                    </form>
                </div>
            </ModalSection>
        </main>
    )
}

export default Page