'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconLoader, IconMessageCircle, IconArrowUp, IconPhoto, IconX } from '@tabler/icons-react'
import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getPusherClient } from '@/lib/pusher'
import { uploadToImageKit } from '@/lib/upload'
import { AttachmentMenu } from './AttachmentMenu'
import { ImageViewer } from '@/components/ImageViewer'
import type { Message } from '@/lib/type'

interface ChatInterfaceProps {
  roomCode: string
}

interface UserSession {
  userName: string
  roomCode: string
  joinedAt: string
}

interface MessageItemProps {
  msg: Message
  index: number
  messages: Message[]
  currentUser: string | null
  formatTime: (timestamp: string) => string
  getInitials: (name: string) => string
  onImageClick: (url: string) => void
}

function generateClientId(): string {
  const arr = new Uint32Array(4)
  crypto.getRandomValues(arr)
  return Array.from(arr, (v) => v.toString(36)).join('').slice(0, 12)
}

const MessageItem = memo(function MessageItem({
  msg,
  index,
  messages,
  currentUser,
  formatTime,
  getInitials,
  onImageClick,
}: MessageItemProps) {
  const isCurrentUser = msg.userName === currentUser
  const showAvatar = index === 0 || messages[index - 1]?.userName !== msg.userName

  return (
    <div
      className={`flex items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
      style={{ animation: `fade-up 500ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      {showAvatar ? (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {getInitials(msg.userName)}
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-medium text-muted-foreground">
              {isCurrentUser ? 'You' : msg.userName}
            </span>
            <span className="text-xs text-muted-foreground/50">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        )}
        <div
          className={`overflow-hidden ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
              : 'bg-card border border-border/60 rounded-2xl rounded-bl-sm'
          }`}
        >
          {msg.message && (
            <div className="px-4 py-2.5">
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {msg.message}
              </p>
            </div>
          )}
          {msg.imageUrl && (
            <button
              type="button"
              onClick={() => onImageClick(msg.imageUrl!)}
              className="block w-full group relative"
            >
              <img
                src={msg.imageUrl}
                alt="Shared image"
                className="w-full max-h-80 object-cover cursor-pointer transition-opacity hover:opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <IconPhoto className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default function ChatInterface({ roomCode }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const sendingRef = useRef(false)
  const [currentUser, setCurrentUser] = useState<string | null>('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasLoadedRef = useRef(false)
  const mountedRef = useRef(true)
  const router = useRouter()

  const fetchMessages = useCallback(async () => {
    try {
      if (hasLoadedRef.current) return
      hasLoadedRef.current = true
      const res = await fetch(`/api/messages/${roomCode}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      setMessages((data.messages as Message[]) || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [roomCode])

  useEffect(() => {
    const getUserSession = (): UserSession | null => {
      try {
        const stored = localStorage.getItem('chat_room_session')
        return stored ? (JSON.parse(stored) as UserSession) : null
      } catch {
        return null
      }
    }

    const session = getUserSession()
    if (!session || session.roomCode !== roomCode) {
      toast.error('Please join the room first')
      router.push('/join')
      return
    }

    setCurrentUser(session.userName)
    setLoading(false)
    hasLoadedRef.current = false
    fetchMessages()
  }, [roomCode, router, fetchMessages])

  useEffect(() => {
    mountedRef.current = true
    const channelName = `chat-${roomCode}`
    const channel = getPusherClient().subscribe(channelName)

    channel.bind('incoming-message', (newMessage: Message) => {
      if (!mountedRef.current) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
    })

    return () => {
      mountedRef.current = false
      channel.unbind_all()
      getPusherClient().unsubscribe(channelName)
    }
  }, [roomCode])

  const formatTime = (timestamp: string): string => {
    const d = new Date(timestamp)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const getInitials = (name: string): string => {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleImageSelect = useCallback((file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const clearImageSelection = useCallback(() => {
    setSelectedImage(null)
    setImagePreview(null)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const doSendMessage = useCallback(async (messageText: string) => {
    if (!currentUser) return
    if (!messageText.trim() && !selectedImage) return

    sendingRef.current = true
    const clientId = generateClientId()
    const tempId = `temp-${Date.now()}-${clientId}`

    const optimistic: Message = {
      id: tempId,
      userName: currentUser,
      message: messageText.trim(),
      imageUrl: imagePreview ?? undefined,
      timestamp: new Date().toISOString(),
    }

    setInputMessage('')
    setMessages((prev) => [...prev, optimistic])

    let imageUrl: string | undefined

    try {
      if (selectedImage) {
        setIsUploading(true)
        imageUrl = await uploadToImageKit(selectedImage)
        setIsUploading(false)
        clearImageSelection()
      }

      const body: Record<string, string> = { roomCode, userName: currentUser, message: messageText.trim() }
      if (imageUrl) body.imageUrl = imageUrl

      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        toast.error('Failed to send message')
        return
      }

      const data = await res.json()
      if (data.message) {
        setMessages((prev) => {
          const serverMsg = data.message as Message
          if (prev.some((m) => m.id === serverMsg.id)) {
            return prev.filter((m) => m.id !== tempId)
          }
          return prev.map((m) => (m.id === tempId ? serverMsg : m))
        })
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error('Failed to send image')
    } finally {
      sendingRef.current = false
      setIsUploading(false)
    }
  }, [roomCode, currentUser, selectedImage, imagePreview, clearImageSelection])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sendingRef.current || !currentUser) return
    if (!inputMessage.trim() && !selectedImage) return
    doSendMessage(inputMessage.trim())
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-4"
          style={{ animation: 'fade-up 700ms cubic-bezier(0.32,0.72,0,1) both' }}
        >
          <div className="p-[3px] rounded-2xl bg-primary/10">
            <div className="flex items-center justify-center w-12 h-12 rounded-[calc(1.5rem-3px)] bg-primary/10">
              <IconLoader className="w-6 h-6 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full text-center py-16"
              style={{ animation: 'fade-up 700ms cubic-bezier(0.32,0.72,0,1) both' }}
            >
              <div className="p-[3px] rounded-2xl bg-primary/10 mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-[calc(2rem-3px)] bg-primary/10">
                  <IconMessageCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Be the first to send a message in this room
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  index={index}
                  messages={messages}
                  currentUser={currentUser}
                  formatTime={formatTime}
                  getInitials={getInitials}
                  onImageClick={setViewerImage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          {imagePreview && (
            <div className="relative mb-3 inline-block rounded-lg overflow-hidden border border-border/60">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-32 w-auto object-contain"
              />
              <button
                type="button"
                onClick={clearImageSelection}
                disabled={isUploading}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <AttachmentMenu
              onImageSelect={handleImageSelect}
              disabled={isUploading}
            />
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isUploading ? 'Uploading image...' : 'Type a message...'}
                maxLength={1000}
                disabled={isUploading}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={(!inputMessage.trim() && !selectedImage) || isUploading}
              className="active:scale-[0.92] transition-transform duration-150 ease-out-strong"
            >
              <span className="inline-flex items-center justify-center w-5 h-5">
                <IconArrowUp className="w-5 h-5" />
              </span>
            </Button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground/60">Press Enter to send</p>
            <p className="text-xs text-muted-foreground/60">
              {inputMessage.length}/1000
            </p>
          </div>
        </div>
      </div>

      <ImageViewer
        src={viewerImage ?? ''}
        open={!!viewerImage}
        onClose={() => setViewerImage(null)}
      />
    </div>
  )
}
