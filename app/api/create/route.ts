import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

interface CreateRoomTypes {
    name: string
    duration: number
    participantsCount: number
}

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { duration, name, participantsCount }: CreateRoomTypes = body

        // Validation - Check if fields exist
        if (!name || !duration || !participantsCount) {
            return NextResponse.json(
                { message: "All fields are required" }, 
                { status: 400 }
            )
        }

        // Validation - Check types
        if (typeof duration !== 'number' || typeof name !== 'string' || typeof participantsCount !== 'number') {
            return NextResponse.json(
                { message: "Invalid field types" }, 
                { status: 400 }
            )
        }

        // Validation - Check values
        if (duration <= 0 || duration > 1440) {
            return NextResponse.json(
                { message: "Duration must be between 1 and 1440 minutes" }, 
                { status: 400 }
            )
        }

        if (participantsCount < 2 || participantsCount > 50) {
            return NextResponse.json(
                { message: "Participants count must be between 2 and 50" }, 
                { status: 400 }
            )
        }

        if (name.trim().length === 0 || name.length > 50) {
            return NextResponse.json(
                { message: "Name must be between 1 and 50 characters" }, 
                { status: 400 }
            )
        }

        // Generate room code (ensure uniqueness)
        let roomCode = generateRoomCode();
        let attempts = 0;
        const maxAttempts = 10;

        // Check if room code already exists
        while (attempts < maxAttempts) {
            const exists = await redis.exists(`room:${roomCode}`);
            if (!exists) break;
            roomCode = generateRoomCode();
            attempts++;
        }

        if (attempts === maxAttempts) {
            return NextResponse.json(
                { message: "Failed to generate unique room code. Please try again." }, 
                { status: 500 }
            )
        }

        const expiresInSeconds = duration * 60;
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        const roomData: Room = {
            code: roomCode,
            creator: name.trim(),
            participants: [name.trim()],
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            duration,
            participantsCount,
            messageCount: 0,
        };

        // Store room data in Redis
        await redis.setex(
            `room:${roomCode}`,
            expiresInSeconds,
            JSON.stringify(roomData)
        );

        // Initialize empty messages list
        // await redis.setex(`messages:${roomCode}`, expiresInSeconds, '[]');

        // Add creator to online users
        await redis.sadd(`online:${roomCode}`, name.trim());
        await redis.expire(`online:${roomCode}`, expiresInSeconds);

        return NextResponse.json({ 
            message: 'Room Created Successfully', 
            code: roomCode, 
            expiresAt: expiresAt.toISOString() 
        }, { status: 200 })

    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json({ 
            message: `Error Creating Room: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 500 })
    }
}

function generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.slice(0, 3) + '-' + code.slice(3); // Format: ABC-123
}