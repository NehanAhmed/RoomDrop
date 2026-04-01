'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconSend, IconLoader, IconMessageCircle } from '@tabler/icons-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { pusherClient } from '@/lib/pusher'
import { motion, AnimatePresence, Variants } from 'motion/react'
interface Message {
  id: string
  user: string
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

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

export default function ChatInterface({ roomCode }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasLoadedRef = useRef(false)
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
  }, [roomCode, router])

  // 2. Real-time Subscription: Listen for Pusher events
  useEffect(() => {
    // Subscribe to the channel specific to this room
    const channelName = `chat-${roomCode}`
    const channel = pusherClient.subscribe(channelName)

    // Bind to the 'incoming-message' event triggered by our API
    channel.bind('incoming-message', (newMessage: Message) => {
      setMessages((prev) => {
        // Deduplication: If the message ID already exists (from optimistic update), ignore it
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
    })

    // Cleanup: Unsubscribe when component unmounts or room changes
    return () => {
      pusherClient.unsubscribe(channelName)
      channel.unbind_all()
    }
  }, [roomCode])

  const fetchMessages = async () => {
    try {
      if (hasLoadedRef.current) return
      hasLoadedRef.current = true
      const response = await fetch(`/api/messages/${roomCode}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim() || sending || !currentUser) return

    setSending(true)
    const messageText = inputMessage.trim()
    const tempId = `temp-${Date.now()}` // Temporary ID for Optimistic UI

    try {
      // Step A: Optimistic Update (Add message to UI instantly)

      // Step B: Send to API
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
      } else {
        const data = await response.json()
        if (data.message) {
          // Step C: Replace the temp message with the actual one from server (has real ID)
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          )
          setInputMessage('')
        }
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
      handleSendMessage(e as any)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <IconLoader className="animate-spin w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Connecting to room...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20"
              >
                <IconMessageCircle className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Be the first to send a message in this room!
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.user === currentUser
                  const showAvatar = index === 0 || messages[index - 1].user !== msg.user

                  return (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      layout
                      className={`flex items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                      {showAvatar ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {getInitials(msg.user)}
                        </motion.div>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}

                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        {showAvatar && (
                          <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-medium text-muted-foreground">
                              {isCurrentUser ? 'You' : msg.user}
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={`px-4 py-2.5 ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                              : 'bg-card border border-border rounded-2xl rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <motion.div className="flex-1" whileFocus={{ scale: 1.01 }}>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={sending}
                className="h-12 bg-background"
                maxLength={1000}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim() || sending}
                className="h-12 w-12"
              >
                {sending ? (
                  <IconLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <IconSend className="w-5 h-5" />
                )}
              </Button>
            </motion.div>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Press Enter to send
            </p>
            <p className="text-xs text-muted-foreground">
              {inputMessage.length}/1000
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}