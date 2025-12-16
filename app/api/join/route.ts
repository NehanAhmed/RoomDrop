import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { Room } from "../create/route";
import { joinRoom } from "@/lib/RoomService";

interface JoinRoomType {
    code: string
    name: string
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, name }: JoinRoomType = body

        // Validation - Check if fields exist
        if (!code || !name) {
            return NextResponse.json(
                { message: 'Room code and name are required' }, 
                { status: 400 }
            )
        }

        // Validation - Check types
        if (typeof code !== 'string' || typeof name !== 'string') {
            return NextResponse.json(
                { message: 'Invalid field types' }, 
                { status: 400 }
            )
        }

        // Validation - Check code format (ABC-123)
        const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;
        if (!codeRegex.test(code)) {
            return NextResponse.json(
                { message: 'Invalid room code format. Expected: ABC-123' }, 
                { status: 400 }
            )
        }

        // Validation - Check name length
        const trimmedName = name.trim();
        if (trimmedName.length === 0 || trimmedName.length > 50) {
            return NextResponse.json(
                { message: 'Name must be between 1 and 50 characters' }, 
                { status: 400 }
            )
        }

        const result = await joinRoom(code, trimmedName);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error }, 
                { status: result.statusCode || 404 }
            );
        }

        return NextResponse.json({
            message: "Joined the Room Successfully",
            room: result.room,
        }, { status: 200 });

    } catch (error) {
        console.error('Error joining room:', error);
        return NextResponse.json(
            { message: `Error joining room: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

