// app/api/messages/[roomCode]/route.ts
import { getMessages } from '@/lib/RoomService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ roomCode: string }> }
) {
    try {
        const { roomCode } = await params;

        if (!roomCode) {
            return NextResponse.json(
                { error: 'Room code required' },
                { status: 400 }
            );
        }

        const messages = await getMessages(roomCode, 100);

        return NextResponse.json({
            success: true,
            messages,
            count: messages.length,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}