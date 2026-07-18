'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconLoader, IconMessageCircle, IconArrowUp } from '@tabler/icons-react'
import { useState, useRef, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { pusherClient } from '@/lib/pusher'

interface Message {
  id: string
  userName: string
  message: string
  timestamp: string
}

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
}

const MessageItem = memo(function MessageItem({
  msg,
  index,
  messages,
  currentUser,
  formatTime,
  getInitials,
}: MessageItemProps) {
  const isCurrentUser = msg.userName === currentUser
  const showAvatar = index === 0 || messages[index - 1]?.userName !== msg.userName

  return (
    <div
      className={`flex items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
      style={{ animation: `fade-up 500ms cubic-bezier(0.32,0.72,0,1) both`, animationDelay: `${Math.min(index * 30, 300)}ms` }}
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
          className={`px-4 py-2.5 ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
              : 'bg-card border border-border/60 rounded-2xl rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {msg.message}
          </p>
        </div>
      </div>
    </div>
  )
})

export default function ChatInterface({ roomCode }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasLoadedRef = useRef(false)
  const mountedRef = useRef(true)
  const router = useRouter()

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
    fetchMessages()
  }, [roomCode, router])

  useEffect(() => {
    mountedRef.current = true
    const channelName = `chat-${roomCode}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind('incoming-message', (newMessage: Message) => {
      if (!mountedRef.current) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev
        const tempIndex = prev.findIndex(
          (m) => m.id.startsWith('temp-') && m.userName === newMessage.userName && m.message === newMessage.message
        )
        if (tempIndex !== -1) {
          const next = [...prev]
          next[tempIndex] = newMessage
          return next
        }
        return [...prev, newMessage]
      })
    })

    return () => {
      mountedRef.current = false
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const fetchMessages = async () => {
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
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || sending || !currentUser) return

    setSending(true)
    const messageText = inputMessage.trim()
    const tempId = `temp-${Date.now()}`

    try {
      setMessages((prev) => [
        ...prev,
        { id: tempId, userName: currentUser, message: messageText, timestamp: new Date().toISOString() },
      ])

      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, userName: currentUser, message: messageText }),
      })

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        toast.error('Failed to send message')
        return
      }

      const data = await res.json()
      if (data.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? (data.message as Message) : m)))
        setInputMessage('')
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as unknown as React.FormEvent)
    }
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
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={sending}
                maxLength={1000}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!inputMessage.trim() || sending}
              className="active:scale-[0.92] transition-transform duration-150 ease-out-strong"
            >
              {sending ? (
                <IconLoader className="w-5 h-5 animate-spin" />
              ) : (
                <span className="inline-flex items-center justify-center w-5 h-5">
                  <IconArrowUp className="w-5 h-5" />
                </span>
              )}
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
    </div>
  )
}
