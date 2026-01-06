import { createRoom } from "@/lib/RoomService";
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

        const room: { roomCode: string, expiresAt: Date } = await createRoom(name.trim(), duration, participantsCount);
        const roomCode = room.roomCode;
        const expiresAt = new Date(room.expiresAt);


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

