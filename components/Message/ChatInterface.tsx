'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconSend, IconLoader } from '@tabler/icons-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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

export default function ChatInterface({ roomCode }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Get current user from localStorage
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
      // User hasn't joined this room, redirect to join page
      toast.error('Please join the room first')
      router.push(`/join`)
      return
    }

    setCurrentUser(session.userName)
    setLoading(false)

    // Load existing messages
    fetchMessages()
  }, [roomCode, router])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${roomCode}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  // Auto-scroll to bottom when new messages arrive
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
    const tempId = `temp-${Date.now()}`
    
    try {
      // Add message to local state immediately (optimistic update)
      const newMessage: Message = {
        id: tempId,
        user: currentUser,
        message: inputMessage.trim(),
        timestamp: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, newMessage])
      setInputMessage('')

      // Send to server
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          userName: currentUser,
          message: inputMessage.trim(),
        }),
      })

      if (!response.ok) {
        // Remove optimistic message if failed
        setMessages(prev => prev.filter(m => m.id !== tempId))
        toast.error('Failed to send message')
      } else {
        // Replace temp message with server response
        const data = await response.json()
        if (data.message) {
          setMessages(prev => 
            prev.map(m => m.id === tempId ? data.message : m)
          )
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <IconLoader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages Area - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <IconSend size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Be the first to send a message in this room!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.user === currentUser
              const showAvatar = index === 0 || messages[index - 1].user !== msg.user

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isCurrentUser ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${
                        isCurrentUser ? 'bg-primary' : getAvatarColor(msg.user)
                      }`}
                    >
                      {getInitials(msg.user)}
                    </div>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}

                  {/* Message Content */}
                  <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showAvatar && (
                      <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        <span className="font-semibold text-sm">
                          {isCurrentUser ? 'You' : msg.user}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted text-foreground rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={sending}
                className="min-h-[44px] resize-none"
                maxLength={1000}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!inputMessage.trim() || sending}
              className="h-[44px] w-[44px] shrink-0"
            >
              {sending ? (
                <IconLoader size={20} className="animate-spin" />
              ) : (
                <IconSend size={20} />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}