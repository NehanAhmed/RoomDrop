// lib/services/roomService.ts
import { redis } from '@/lib/redis';

export interface Room {
    code: string;
    creator: string;
    participants: string[];
    createdAt: string;
    expiresAt: string;
    duration: number;
    participantsCount: number;
    messageCount: number;
}

export interface Message {
    id: string;
    user: string;
    message: string;
    timestamp: string;
}

export interface RoomInfo extends Room {
    remainingSeconds: number;
    onlineUsers: string[];
}

// ============================================
// ROOM OPERATIONS
// ============================================

/**
 * Generate a random room code in format ABC-123
 */
function generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.slice(0, 3) + '-' + code.slice(3);
}

/**
 * Create a new room
 */
export async function createRoom(
    userName: string,
    duration: number, // minutes
    participantsCount: number = 5
): Promise<{ roomCode: string; expiresAt: Date }> {
    // Generate unique room code
    let roomCode = generateRoomCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const exists = await redis.exists(`room:${roomCode}`);
        if (!exists) break;
        roomCode = generateRoomCode();
        attempts++;
    }

    if (attempts === maxAttempts) {
        throw new Error('Failed to generate unique room code');
    }

    const expiresInSeconds = duration * 60;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const roomData: Room = {
        code: roomCode,
        creator: userName,
        participants: [userName],
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        duration,
        participantsCount,
        messageCount: 0,
    };

    // Store room in Redis with auto-expiration
    await redis.setex(
        `room:${roomCode}`,
        expiresInSeconds,
        JSON.stringify(roomData)
    );

    // Initialize empty messages list
    await redis.setex(`messages:${roomCode}`, expiresInSeconds, '[]');

    // Add creator to online users
    await redis.sadd(`online:${roomCode}`, userName);
    await redis.expire(`online:${roomCode}`, expiresInSeconds);

    return { roomCode, expiresAt };
}

/**
 * Get room data
 */
export async function getRoom(roomCode: string): Promise<Room | null> {
    const roomData = await redis.get<Room>(`room:${roomCode}`);
    if (!roomData) return null;
    return roomData;
}

/**
 * Get detailed room info with live data
 */
export async function getRoomInfo(roomCode: string): Promise<RoomInfo | null> {
    const room = await getRoom(roomCode);
    if (!room) return null;

    const ttl = await redis.ttl(`room:${roomCode}`);
    const onlineUsers = await redis.smembers(`online:${roomCode}`);
    const messages = await redis.get(`messages:${roomCode}`);

    return {
        ...room,
        remainingSeconds: ttl,
        onlineUsers: onlineUsers as string[],
        messageCount: messages.length,
    };
}

/**
 * Join a room
 */
export async function joinRoom(
    roomCode: string,
    userName: string
): Promise<{ success: boolean; room?: Room; error?: string; statusCode?: number }> {
    const roomData = await redis.get<Room>(`room:${roomCode}`);

    if (!roomData) {
        return {
            success: false,
            error: 'Room not found or has expired',
            statusCode: 404,
        };
    }

    const room: Room = roomData;

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(room.expiresAt);
    if (now > expiresAt) {
        return {
            success: false,
            error: 'This room has expired',
            statusCode: 410,
        };
    }

    // Check if room is full
    if (room.participants.length >= room.participantsCount) {
        return {
            success: false,
            error: `Room is full (${room.participantsCount}/${room.participantsCount} participants)`,
            statusCode: 403,
        };
    }

    // Check if username is already taken (case-insensitive)
    const userExists = room.participants.some(
        (participant) => participant.toLowerCase() === userName.toLowerCase()
    );

    if (userExists) {
        return {
            success: false,
            error: 'This name is already taken in this room. Please choose a different name.',
            statusCode: 409,
        };
    }

    // Add user to participants
    room.participants.push(userName);

    // Get remaining TTL
    const ttl = await redis.ttl(`room:${roomCode}`);

    if (ttl <= 0) {
        return {
            success: false,
            error: 'Room has expired',
            statusCode: 410,
        };
    }

    // Update room in Redis
    await redis.setex(`room:${roomCode}`, ttl, JSON.stringify(room));

    // Add to online users
    await redis.sadd(`online:${roomCode}`, userName);
    await redis.expire(`online:${roomCode}`, ttl);

    return { success: true, room };
}

/**
 * Leave a room
 */
export async function leaveRoom(
    roomCode: string,
    userName: string
): Promise<{ success: boolean }> {
    try {
        // Remove from online users
        await redis.srem(`online:${roomCode}`, userName);
        return { success: true };
    } catch (error) {
        console.error('Error leaving room:', error);
        return { success: false };
    }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Add a message to room
 */
export async function addMessage(
    roomCode: string,
    userName: string,
    messageText: string
): Promise<Message | null> {
    const roomExists = await redis.exists(`room:${roomCode}`);
    if (!roomExists) return null;

    const message: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: userName,
        message: messageText,
        timestamp: new Date().toISOString(),
    };

    // Add message to list (prepend)
    await redis.lpush(`messages:${roomCode}`, JSON.stringify(message));

    // Keep only last 100 messages
    await redis.ltrim(`messages:${roomCode}`, 0, 99);

    // Update expiration to match room
    const roomTTL = await redis.ttl(`room:${roomCode}`);
    await redis.expire(`messages:${roomCode}`, roomTTL);

    // Increment message count in room
    const roomData = await redis.get<string>(`room:${roomCode}`);
    if (roomData) {
        const room: Room = JSON.parse(roomData);
        room.messageCount++;
        await redis.setex(`room:${roomCode}`, roomTTL, JSON.stringify(room));
    }

    return message;
}

/**
 * Get messages from room
 */
export async function getMessages(
    roomCode: string,
    limit: number = 50
): Promise<Message[]> {
    const messagesRaw = await redis.lrange(`messages:${roomCode}`, 0, limit - 1);

    const messages = messagesRaw
        .map((msg) => JSON.parse(msg as string))
        .reverse(); // Oldest first

    return messages;
}

// ============================================
// ONLINE STATUS OPERATIONS
// ============================================

/**
 * Update user online status
 */
export async function updateOnlineStatus(
    roomCode: string,
    userName: string,
    isOnline: boolean
): Promise<void> {
    const ttl = await redis.ttl(`room:${roomCode}`);
    if (ttl <= 0) return;

    if (isOnline) {
        await redis.sadd(`online:${roomCode}`, userName);
        await redis.expire(`online:${roomCode}`, ttl);
    } else {
        await redis.srem(`online:${roomCode}`, userName);
    }
}

/**
 * Get online users in room
 */
export async function getOnlineUsers(roomCode: string): Promise<string[]> {
    const users = await redis.smembers(`online:${roomCode}`);
    return users as string[];
}

/**
 * Check if user is online
 */
export async function isUserOnline(
    roomCode: string,
    userName: string
): Promise<boolean> {
    const result = await redis.sismember(`online:${roomCode}`, userName);
    return result === 1;
}

// ============================================
// TYPING INDICATOR OPERATIONS
// ============================================

/**
 * Set user typing status
 */
export async function setTypingStatus(
    roomCode: string,
    userName: string,
    isTyping: boolean
): Promise<void> {
    if (isTyping) {
        // Set with 3 second expiration
        await redis.setex(`typing:${roomCode}:${userName}`, 3, 'true');
    } else {
        await redis.del(`typing:${roomCode}:${userName}`);
    }
}

/**
 * Get users currently typing
 */
export async function getTypingUsers(roomCode: string): Promise<string[]> {
    const keys = await redis.keys(`typing:${roomCode}:*`);

    const typingUsers = keys.map((key) => {
        const parts = (key as string).split(':');
        return parts[parts.length - 1];
    });

    return typingUsers;
}

// ============================================
// UTILITY OPERATIONS
// ============================================

/**
 * Check if room exists
 */
export async function roomExists(roomCode: string): Promise<boolean> {
    const exists = await redis.exists(`room:${roomCode}`);
    return exists === 1;
}

/**
 * Get room time remaining in seconds
 */
export async function getRoomTimeRemaining(roomCode: string): Promise<number> {
    return await redis.ttl(`room:${roomCode}`);
}

/**
 * Extend room time (add more minutes)
 */
export async function extendRoomTime(
    roomCode: string,
    additionalMinutes: number
): Promise<{ success: boolean; newExpiresAt?: Date }> {
    const room = await getRoom(roomCode);
    if (!room) {
        return { success: false };
    }

    const currentTTL = await redis.ttl(`room:${roomCode}`);
    const newTTL = currentTTL + additionalMinutes * 60;
    const newExpiresAt = new Date(Date.now() + newTTL * 1000);

    room.expiresAt = newExpiresAt.toISOString();

    // Update room with new expiration
    await redis.setex(`room:${roomCode}`, newTTL, JSON.stringify(room));
    await redis.expire(`messages:${roomCode}`, newTTL);
    await redis.expire(`online:${roomCode}`, newTTL);

    return { success: true, newExpiresAt };
}