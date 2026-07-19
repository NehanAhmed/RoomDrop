import { createRoom } from "@/lib/RoomService";
import { NextRequest, NextResponse } from "next/server";
import { checkCreateRateLimit, checkBodySize } from "@/lib/rateLimit";

interface CreateRoomTypes {
    name: string
    duration: number
    participantsCount: number
}

export async function POST(req: NextRequest) {
    const bodyLimit = checkBodySize(req, 'create');
    if (bodyLimit) return bodyLimit;

    const rateLimit = await checkCreateRateLimit(req);
    if (rateLimit) return rateLimit;

    try {
        const body = await req.json()
        const { duration, name, participantsCount }: CreateRoomTypes = body

        if (!name || !duration || !participantsCount) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            )
        }

        if (typeof duration !== 'number' || typeof name !== 'string' || typeof participantsCount !== 'number') {
            return NextResponse.json(
                { message: "Invalid field types" },
                { status: 400 }
            )
        }

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
        const expiresAt = room.expiresAt;

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
