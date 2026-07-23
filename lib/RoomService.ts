// lib/RoomService.ts
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { rooms, participants, messages } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Message, Room, RoomInfo } from './type';




// ============================================
// HELPER FUNCTIONS
// ============================================

function generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(6);
    globalThis.crypto.getRandomValues(array);
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(array[i] % chars.length);
    }
    return code.slice(0, 3) + '-' + code.slice(3);
}

// ============================================
// ROOM OPERATIONS
// ============================================

export async function createRoom(
    userName: string,
    duration: number,
    participantsCount: number = 5
): Promise<{ roomCode: string; expiresAt: Date }> {
    let roomCode = generateRoomCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Check uniqueness in both Redis and DB
    while (attempts < maxAttempts) {
        const [redisExists, dbRoom] = await Promise.all([
            redis.exists(`room:${roomCode}`),
            db.select({ code: rooms.code }).from(rooms).where(eq(rooms.code, roomCode)).limit(1),
        ]);
        
        if (!redisExists && dbRoom.length === 0) break;
        
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

    // Store in Redis for fast access
    await redis.setex(
        `room:${roomCode}`,
        expiresInSeconds,
        JSON.stringify(roomData)
    );

    await redis.sadd(`online:${roomCode}`, userName);
    await redis.expire(`online:${roomCode}`, expiresInSeconds);

    // Store in DB for persistence
    try {
        await Promise.all([
            db.insert(rooms).values({
                code: roomCode,
                creator: userName,
                duration,
                participantsCount,
                expiresAt,
                messageCount: 0,
            }),
            db.insert(participants).values({
                roomCode,
                userName,
                isOnline: true,
            }),
        ]);
    } catch (error) {
        console.error('Error creating room in DB:', error);
        // Redis is primary, so we continue even if DB fails
    }

    return { roomCode, expiresAt };
}

export async function getRoom(roomCode: string): Promise<Room | null> {
    // Try Redis first (faster)
    const roomData = await redis.get(`room:${roomCode}`);
    
    if (roomData) {
        if (typeof roomData === 'string') {
            return JSON.parse(roomData);
        }
        return roomData as Room;
    }

    // Fallback to DB if not in Redis
    try {
        const dbRoom = await db.select().from(rooms).where(eq(rooms.code, roomCode)).limit(1);
        
        if (dbRoom.length === 0) return null;

        const room = dbRoom[0];
        
        // Check if expired
        if (new Date(room.expiresAt) < new Date()) {
            return null;
        }

        // Get participants
        const dbParticipants = await db
            .select()
            .from(participants)
            .where(eq(participants.roomCode, roomCode));

        const roomObject: Room = {
            code: room.code,
            creator: room.creator,
            participants: dbParticipants.map(p => p.userName),
            createdAt: room.createdAt.toISOString(),
            expiresAt: room.expiresAt.toISOString(),
            duration: room.duration,
            participantsCount: room.participantsCount,
            messageCount: room.messageCount,
        };

        // Re-populate Redis cache
        const ttl = Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000);
        if (ttl > 0) {
            await redis.setex(`room:${roomCode}`, ttl, JSON.stringify(roomObject));
        }

        return roomObject;
    } catch (error) {
        console.error('Error getting room from DB:', error);
        return null;
    }
}

export async function getRoomInfo(roomCode: string): Promise<RoomInfo | null> {
    const room = await getRoom(roomCode);
    if (!room) return null;

    const [ttl, onlineUsers, realMsgCount] = await Promise.all([
        redis.ttl(`room:${roomCode}`),
        redis.smembers(`online:${roomCode}`),
        (async () => {
            try {
                return await db.$count(messages, eq(messages.roomCode, roomCode));
            } catch {
                return await redis.llen(`messages:${roomCode}`);
            }
        })(),
    ]);

    const distinctUsers = Array.from(new Set(onlineUsers as string[]));

    return {
        ...room,
        remainingSeconds: ttl > 0 ? ttl : 0,
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

    // Update Redis and DB in parallel
    await Promise.all([
        (async () => {
            await redis.setex(`room:${roomCode}`, ttl, JSON.stringify(room));
            await redis.sadd(`online:${roomCode}`, userName);
            await redis.expire(`online:${roomCode}`, ttl);
        })(),
        (async () => {
            try {
                const existingParticipant = await db
                    .select({ id: participants.id })
                    .from(participants)
                    .where(
                        and(
                            eq(participants.roomCode, roomCode),
                            eq(participants.userName, userName)
                        )
                    )
                    .limit(1);

                if (existingParticipant.length === 0) {
                    await db.insert(participants).values({
                        roomCode,
                        userName,
                        isOnline: true,
                    });
                } else {
                    await db
                        .update(participants)
                        .set({ 
                            isOnline: true, 
                            lastSeenAt: new Date() 
                        })
                        .where(
                            and(
                                eq(participants.roomCode, roomCode),
                                eq(participants.userName, userName)
                            )
                        );
                }
            } catch (error) {
                console.error('Error updating participant in DB:', error);
            }
        })(),
    ]);

    return { success: true, room };
}

export async function leaveRoom(
    roomCode: string,
    userName: string
): Promise<{ success: boolean }> {
    try {
        // Update Redis
        await redis.srem(`online:${roomCode}`, userName);

        // Update DB
        await db
            .update(participants)
            .set({ 
                isOnline: false, 
                lastSeenAt: new Date() 
            })
            .where(
                and(
                    eq(participants.roomCode, roomCode),
                    eq(participants.userName, userName)
                )
            );

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
    messageText: string,
    imageUrl?: string
): Promise<Message | null> {
    const roomTTL = await redis.ttl(`room:${roomCode}`);
    if (roomTTL <= 0) return null;

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const message: Message = {
        id: messageId,
        userName: userName,
        message: messageText,
        imageUrl,
        timestamp,
    };

    // Store in Redis
    const key = `messages:${roomCode}`;
    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, 99);
    await redis.expire(key, roomTTL);

    // Store in DB for persistence
    try {
        await db.insert(messages).values({
            roomCode,
            userName,
            message: messageText,
            imageUrl: imageUrl ?? null,
            timestamp: new Date(timestamp),
        });

        // Increment message count atomically
        await db
            .update(rooms)
            .set({ messageCount: sql`message_count + 1` })
            .where(eq(rooms.code, roomCode));
    } catch (error) {
        console.error('Error saving message to DB:', error);
        // Continue even if DB fails, Redis has the message
    }

    return message;
}

export async function getMessages(
    roomCode: string,
    limit: number = 50
): Promise<Message[]> {
    // Try Redis first
    const messagesRaw = await redis.lrange(
        `messages:${roomCode}`,
        0,
        limit - 1
    );

    if (messagesRaw.length > 0) {
        const redisMessages: Message[] = messagesRaw.map((val) => {
            if (typeof val === 'string') {
                return JSON.parse(val);
            }
            return val as Message;
        });
        return redisMessages.reverse();
    }

    // Fallback to DB
    try {
        const dbMessages = await db
            .select({
                id: messages.id,
                userName: messages.userName,
                message: messages.message,
                imageUrl: messages.imageUrl,
                timestamp: messages.timestamp,
            })
            .from(messages)
            .where(eq(messages.roomCode, roomCode))
            .orderBy(desc(messages.timestamp))
            .limit(limit);

        const formattedMessages: Message[] = dbMessages.map(msg => ({
            id: msg.id,
            userName: msg.userName,
            message: msg.message,
            imageUrl: msg.imageUrl ?? undefined,
            timestamp: msg.timestamp.toISOString(),
        }));

        // Re-populate Redis cache
        if (formattedMessages.length > 0) {
            const ttl = await redis.ttl(`room:${roomCode}`);
            if (ttl > 0) {
                const key = `messages:${roomCode}`;
                const messagesJson = formattedMessages.map(m => JSON.stringify(m));
                await redis.rpush(key, ...messagesJson);
                await redis.expire(key, ttl);
            }
        }

        return formattedMessages.reverse();
    } catch (error) {
        console.error('Error getting messages from DB:', error);
        return [];
    }
}

// ============================================
// UTILITY OPERATIONS
// ============================================

export async function roomExists(roomCode: string): Promise<boolean> {
    const redisExists = (await redis.exists(`room:${roomCode}`)) === 1;
    if (redisExists) return true;

    try {
        const dbRoom = await db.select().from(rooms).where(eq(rooms.code, roomCode)).limit(1);
        if (dbRoom.length > 0) {
            // Check if expired
            return new Date(dbRoom[0].expiresAt) > new Date();
        }
    } catch (error) {
        console.error('Error checking room existence in DB:', error);
    }

    return false;
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