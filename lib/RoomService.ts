// lib/RoomService.ts
import { redis } from '@/lib/redis';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Room {
    code: string;
    creator: string;
    participants: string[];
    createdAt: string;
    expiresAt: string;
    duration: number; // in minutes
    participantsCount: number; // max participants
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
 * FIX: Removed the logic that initialized messages as a string '[]'
 */
export async function createRoom(
    userName: string,
    duration: number, // minutes
    participantsCount: number = 5
): Promise<{ roomCode: string; expiresAt: Date }> {
    // 1. Generate unique room code
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

    // 2. Calculate expiration
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

    // 3. Store room in Redis
    await redis.setex(
        `room:${roomCode}`,
        expiresInSeconds,
        JSON.stringify(roomData)
    );

    // NOTE: We do NOT initialize `messages:${roomCode}` here. 
    // Redis creates the List automatically on the first lpush.

    // 4. Add creator to online users
    await redis.sadd(`online:${roomCode}`, userName);
    await redis.expire(`online:${roomCode}`, expiresInSeconds);

    return { roomCode, expiresAt };
}

/**
 * Get room data (Basic)
 */
export async function getRoom(roomCode: string): Promise<Room | null> {
    const roomData = await redis.get<Room>(`room:${roomCode}`);
    if (!roomData) return null;
    return roomData; // Upstash/Redis automatically parses JSON if using the generic <Room>
}

/**
 * Get detailed room info with live data
 * FIX: Uses llen instead of get for message count
 */
export async function getRoomInfo(roomCode: string): Promise<RoomInfo | null> {
    const room = await getRoom(roomCode);
    if (!room) return null;

    const ttl = await redis.ttl(`room:${roomCode}`);
    const onlineUsers = await redis.smembers(`online:${roomCode}`);

    // Get distinct online users (clean up duplicates if any)
    const distinctUsers = Array.from(new Set(onlineUsers as string[]));

    // Get real-time message count from the list length
    const realMsgCount = await redis.llen(`messages:${roomCode}`);

    return {
        ...room,
        remainingSeconds: ttl,
        onlineUsers: distinctUsers,
        messageCount: realMsgCount,
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

    // Check capacity
    if (room.participants.length >= room.participantsCount) {
        // Allow re-joining if user is already in list
        const isAlreadyParticipant = room.participants.some(p => p.toLowerCase() === userName.toLowerCase());
        if (!isAlreadyParticipant) {
            return {
                success: false,
                error: `Room is full (${room.participantsCount}/${room.participantsCount} participants)`,
                statusCode: 403,
            };
        }
    }

    // Check if username is taken (if new user)
    const existingUserIndex = room.participants.findIndex(
        (participant) => participant.toLowerCase() === userName.toLowerCase()
    );

    // If new user, add them. If existing, we just refresh their presence.
    if (existingUserIndex === -1) {
        room.participants.push(userName);
    }

    const ttl = await redis.ttl(`room:${roomCode}`);

    if (ttl <= 0) {
        return { success: false, error: 'Room has expired', statusCode: 410 };
    }

    // Update room data
    await redis.setex(`room:${roomCode}`, ttl, JSON.stringify(room));

    // Add to online users
    await redis.sadd(`online:${roomCode}`, userName);
    await redis.expire(`online:${roomCode}`, ttl);

    return { success: true, room };
}

/**
 * Leave a room (Optional: Remove from online list)
 */
export async function leaveRoom(
    roomCode: string,
    userName: string
): Promise<{ success: boolean }> {
    try {
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
 * FIX: Ensures list creation and expiration
 */
export async function addMessage(
    roomCode: string,
    userName: string,
    messageText: string
): Promise<Message | null> {
    // Check if room exists first
    const roomTTL = await redis.ttl(`room:${roomCode}`);
    if (roomTTL <= 0) return null;

    const message: Message = {
        id: crypto.randomUUID(),
        user: userName,
        message: messageText,
        timestamp: new Date().toISOString(),
    };

    const key = `messages:${roomCode}`;

    // Push to head of list (Newest messages at index 0)
    await redis.lpush(key, JSON.stringify(message));

    // Trim to keep only last 100 messages to save memory
    await redis.ltrim(key, 0, 99);

    // IMPORTANT: Set expiry on the message list to match the room
    await redis.expire(key, roomTTL);


    return message;
}

/**
 * Get messages from room
 */
export async function getMessages(
    roomCode: string,
    limit: number = 50
): Promise<Message[]> {
    const messagesRaw = await redis.lrange(
        `messages:${roomCode}`,
        0,
        limit - 1
    );

    // Parse JSON strings → Message objects
    const messages: Message[] = messagesRaw.map((val) =>
        JSON.parse(val) as Message
    );

    // Oldest → Newest for UI rendering
    return messages.reverse();
}

// ============================================
// UTILITY OPERATIONS
// ============================================

export async function roomExists(roomCode: string): Promise<boolean> {
    return (await redis.exists(`room:${roomCode}`)) === 1;
}

export async function isUserOnline(roomCode: string, userName: string): Promise<boolean> {
    return (await redis.sismember(`online:${roomCode}`, userName)) === 1;
}