// lib/userSession.ts
'use client'

export interface UserSession {
  userName: string
  roomCode: string
  joinedAt: string
}

const SESSION_KEY = 'chat_room_session'

/**
 * Save user session to localStorage
 */
export function saveUserSession(userName: string, roomCode: string): void {
  if (typeof window === 'undefined') return

  const session: UserSession = {
    userName,
    roomCode,
    joinedAt: new Date().toISOString(),
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  
  // Also save to sessionStorage as backup
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/**
 * Get current user session
 */
export function getUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null

  try {
    // Try localStorage first
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      return JSON.parse(stored) as UserSession
    }

    // Fallback to sessionStorage
    const sessionStored = sessionStorage.getItem(SESSION_KEY)
    if (sessionStored) {
      return JSON.parse(sessionStored) as UserSession
    }

    return null
  } catch (error) {
    console.error('Error reading user session:', error)
    return null
  }
}

/**
 * Get current user name for a specific room
 */
export function getCurrentUserName(roomCode: string): string | null {
  const session = getUserSession()
  if (session && session.roomCode === roomCode) {
    return session.userName
  }
  return null
}

/**
 * Clear user session (when leaving room)
 */
export function clearUserSession(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Check if user has joined a room
 */
export function hasJoinedRoom(roomCode: string): boolean {
  const session = getUserSession()
  return session?.roomCode === roomCode
}