'use client'
import { CopyButton } from '@/components/CopyButton'
import ModalSection from '@/components/ModalSection'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconLoader } from '@tabler/icons-react'
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

const Page = () => {
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

      // Validation
      if (!name || !duration || !participantsCount) {
        toast.error("All Fields are Required")
        setLoading(false)
        return
      }

      // Convert to numbers
      const durationNum = Number(duration)
      const participantsNum = Number(participantsCount)

      // Validate numbers
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

      // Save user session
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_room_session', JSON.stringify({
          userName: name.trim(),
          roomCode: responseData.code,
          joinedAt: new Date().toISOString(),
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
    // Reset form
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
    <main className="w-full min-h-screen font-mono flex justify-center items-center">
      {/* Success Dialog */}
      <Dialog open={success} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Created Successfully!</DialogTitle>
            <DialogDescription>
              You can now share the code to chat with friends or family
            </DialogDescription>
          </DialogHeader>
          <div className='p-1 flex flex-col items-center justify-center gap-5'>
            <div>
              <Canvas
                text={`https://room-drop.vercel.app/join?by=qrcode&code=${data?.code}`}
                options={{
                  errorCorrectionLevel: 'M',
                  margin: 3,
                  scale: 4,
                  width: 200,
                  color: {
                    dark: '#010599FF',
                    light: '#FFBF60FF',
                  },
                }}
              />
            </div>
            <div className='w-full flex justify-between items-center gap-3 p-3 bg-muted rounded-lg'>
              <p className='text-lg font-bold font-mono'>{data?.code}</p>
              <CopyButton
                textToCopy={data?.code || ''}
                onCopySuccess={() => toast.success('Room code copied!')}
                className='p-2 border rounded hover:bg-gray-100'
                copiedClassName='p-2 border rounded bg-green-500 text-white'
              />
            </div>
            <div className='w-full text-sm text-muted-foreground'>
              <Label>Expires At: {data?.expiresAt ? formatExpiryDate(data.expiresAt) : 'N/A'}</Label>
            </div>
            <div className='w-full flex gap-2'>
              <Link href={`/room/${data?.code}`} className='flex-1'>
                <Button variant='default' className='w-full'>Go to Room</Button>
              </Link>
              <Button variant='outline' onClick={handleCloseDialog}>
                Create Another
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Room Form */}
      <ModalSection>
        <div>
          <h1 className='text-2xl font-bold'>Create a Room</h1>
          <p className='text-sm text-neutral-400 py-2'>Fill the Details to get a Room Code</p>
        </div>
        <div className='w-full'>
          <form className='flex flex-col gap-5 w-full' onSubmit={handleSubmit}>
            <div className='space-y-2'>
              <Label htmlFor='name'>Your Name*</Label>
              <Input
                id='name'
                disabled={loading}
                className='py-5 border border-primary'
                placeholder='e.g: Nehan'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='duration'>Room Duration* (in Minutes)</Label>
              <Input
                id='duration'
                disabled={loading}
                className='py-5 border border-primary'
                placeholder='e.g: 30'
                type='number'
                min='1'
                max='1440'
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>Max: 1440 minutes (24 hours)</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='participants'>Max Participants Count</Label>
              <Input
                id='participants'
                disabled={loading}
                className='py-5 border border-primary'
                placeholder='e.g: 5'
                type='number'
                min='2'
                max='50'
                value={participantsCount}
                onChange={(e) => setParticipantsCount(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>Default: 5 participants</p>
            </div>

            <div className='w-full'>
              <Button
                type='submit'
                className='px-5 py-5 w-full'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <IconLoader className='animate-spin mr-2' size={20} />
                    Creating...
                  </>
                ) : (
                  'Create Room'
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