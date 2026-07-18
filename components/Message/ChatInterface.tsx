'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconSend, IconLoader, IconMessageCircle } from '@tabler/icons-react'
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

// ============================================
// MEMOIZED MESSAGE COMPONENT - Prevents unnecessary re-renders
// ============================================

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

      <div
        className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}
      >
        {showAvatar && (
          <div
            className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {isCurrentUser ? 'You' : msg.userName}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        )}
        <div
          className={`px-4 py-2.5 ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
              : 'bg-card border border-border rounded-2xl rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
            {msg.message}
          </p>
        </div>
      </div>
    </div>
  )
})

// ============================================
// MAIN COMPONENT
// ============================================

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
  // 1. Initial Setup: Load Session and Fetch History
  useEffect(() => {
    const getUserSession = (): UserSession | null => {
      try {
        const stored = localStorage.getItem('chat_room_session')
        if (stored) {
          return JSON.parse(stored) as UserSession
        }
        return null
      } catch (error) {
        console.error('Error reading user session:', error)
        return null
      }
    }

    const session = getUserSession()

    if (!session || session.roomCode !== roomCode) {
      toast.error('Please join the room first')
      router.push(`/join`)
      return
    }

    setCurrentUser(session.userName)
    setLoading(false)

    // Load existing messages from Redis
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, router])

  // 2. Real-time Subscription: Listen for Pusher events
  useEffect(() => {
    mountedRef.current = true

    const channelName = `chat-${roomCode}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind('incoming-message', (newMessage: Message) => {
      if (!mountedRef.current) return
      setMessages((prev) => {
        // Check if already exists (deduplication by ID)
        if (prev.some((m) => m.id === newMessage.id)) return prev

        // Find matching temp message by content (userName + message text)
        const tempIndex = prev.findIndex(
          (m) =>
            m.id.startsWith('temp-') &&
            m.userName === newMessage.userName &&
            m.message === newMessage.message
        )

        if (tempIndex !== -1) {
          // Replace temp with real message
          const newMessages = [...prev]
          newMessages[tempIndex] = newMessage
          return newMessages
        }

        // Add new message from others
        return [...prev, newMessage]
      })
    })

    return () => {
      mountedRef.current = false
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
    }
  }, [roomCode])

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getInitials = (name: string): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ============================================
  // EFFECTS
  // ============================================

  // 3. Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchMessages = async () => {
    try {
      if (hasLoadedRef.current) return
      hasLoadedRef.current = true

      const response = await fetch(`/api/messages/${roomCode}`)
      if (!response.ok) throw new Error('Failed to fetch messages')

      const data = await response.json()
      setMessages((data.messages as Message[]) || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim() || sending || !currentUser) return

    setSending(true)
    const messageText = inputMessage.trim()
    const tempId = `temp-${Date.now()}`

    try {
      // Optimistic Update
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          userName: currentUser,
          message: messageText,
          timestamp: new Date().toISOString(),
        },
      ])

      // Send to API
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          userName: currentUser,
          message: messageText,
        }),
      })

      if (!response.ok) {
        // Rollback on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        toast.error('Failed to send message')
        return
      }

      const data = await response.json()
      if (data.message) {
        // Replace temp message with server message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data.message as Message) : m))
        )
        setInputMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
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

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
          >
            <IconLoader className="w-6 h-6 text-primary" />
          </div>
          <p
            className="text-sm text-muted-foreground"
          >
            Connecting to room...
          </p>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER: MAIN UI
  // ============================================

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 cursor-pointer"
                >
                  <IconMessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No messages yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Be the first to send a message in this room!
                </p>
              </div>
            ) : (
              <div
                className="space-y-4"
              >
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

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <div
              className="flex-1"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={sending}
                className="h-12 bg-background"
                maxLength={1000}
              />
            </div>
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim() || sending}
                className="h-12 w-12"
              >
                {sending ? (
                    <IconLoader className="w-5 h-5" />
                ) : (
                  <IconSend className="w-5 h-5" />
                )}
              </Button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Press Enter to send</p>
            <p className="text-xs text-muted-foreground">
              {inputMessage.length}/1000
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}