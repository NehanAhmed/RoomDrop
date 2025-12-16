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

function generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.slice(0, 3) + '-' + code.slice(3);
}

export async function createRoom(
    userName: string,
    duration: number,
    participantsCount: number = 5
): Promise<{ roomCode: string; expiresAt: Date }> {
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

    await redis.setex(
        `room:${roomCode}`,
        expiresInSeconds,
        JSON.stringify(roomData)
    );

    await redis.sadd(`online:${roomCode}`, userName);
    await redis.expire(`online:${roomCode}`, expiresInSeconds);

    return { roomCode, expiresAt };
}

export async function getRoom(roomCode: string): Promise<Room | null> {
    const roomData = await redis.get(`room:${roomCode}`);
    if (!roomData) return null;
    
    // Parse if string, otherwise assume it's already parsed
    if (typeof roomData === 'string') {
        return JSON.parse(roomData);
    }
    return roomData as Room;
}

export async function getRoomInfo(roomCode: string): Promise<RoomInfo | null> {
    const room = await getRoom(roomCode);
    if (!room) return null;

    const ttl = await redis.ttl(`room:${roomCode}`);
    const onlineUsers = await redis.smembers(`online:${roomCode}`);
    const distinctUsers = Array.from(new Set(onlineUsers as string[]));
    const realMsgCount = await redis.llen(`messages:${roomCode}`);

    return {
        ...room,
        remainingSeconds: ttl,
        onlineUsers: distinctUsers,
        messageCount: realMsgCount,
    };
}

export async function joinRoom(
    roomCode: string,
    userName: string
): Promise<{ success: boolean; room?: Room; error?: string; statusCode?: number }> {
    const room = await getRoom(roomCode);

    if (!room) {
        return {
            success: false,
            error: 'Room not found or has expired',
            statusCode: 404,
        };
    }

    // Check capacity
    if (room.participants.length >= room.participantsCount) {
        const isAlreadyParticipant = room.participants.some(
            p => p.toLowerCase() === userName.toLowerCase()
        );
        if (!isAlreadyParticipant) {
            return {
                success: false,
                error: `Room is full (${room.participantsCount}/${room.participantsCount} participants)`,
                statusCode: 403,
            };
        }
    }

    // Check if user already exists
    const existingUserIndex = room.participants.findIndex(
        (participant) => participant.toLowerCase() === userName.toLowerCase()
    );

    if (existingUserIndex === -1) {
        room.participants.push(userName);
    }

    const ttl = await redis.ttl(`room:${roomCode}`);

    if (ttl <= 0) {
        return { success: false, error: 'Room has expired', statusCode: 410 };
    }

    await redis.setex(`room:${roomCode}`, ttl, JSON.stringify(room));
    await redis.sadd(`online:${roomCode}`, userName);
    await redis.expire(`online:${roomCode}`, ttl);

    return { success: true, room };
}

// FIX: Changed template literal to proper parentheses
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

export async function addMessage(
    roomCode: string,
    userName: string,
    messageText: string
): Promise<Message | null> {
    const roomTTL = await redis.ttl(`room:${roomCode}`);
    if (roomTTL <= 0) return null;

    const message: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: userName,
        message: messageText,
        timestamp: new Date().toISOString(),
    };

    const key = `messages:${roomCode}`;

    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, 99);
    await redis.expire(key, roomTTL);

    return message;
}

export async function getMessages(
    roomCode: string,
    limit: number = 50
): Promise<Message[]> {
    const messagesRaw = await redis.lrange(
        `messages:${roomCode}`,
        0,
        limit - 1
    );

    const messages: Message[] = messagesRaw.map((val) => {
        if (typeof val === 'string') {
            return JSON.parse(val);
        }
        return val as Message;
    });

    return messages.reverse();
}

// ============================================
// UTILITY OPERATIONS
// ============================================

export async function roomExists(roomCode: string): Promise<boolean> {
    return (await redis.exists(`room:${roomCode}`)) === 1;
}

export async function isUserOnline(
    roomCode: string,
    userName: string
): Promise<boolean> {
    return (await redis.sismember(`online:${roomCode}`, userName)) === 1;
}

export async function getOnlineUsers(roomCode: string): Promise<string[]> {
    const users = await redis.smembers(`online:${roomCode}`);
    return Array.from(new Set(users as string[]));
}