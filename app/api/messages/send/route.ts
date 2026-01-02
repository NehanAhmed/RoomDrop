// app/api/messages/send/route.ts
import { pusherServer } from '@/lib/pusher';
import { addMessage } from '@/lib/RoomService';
import { NextRequest, NextResponse } from 'next/server';

interface SendMessageRequest {
  roomCode: string;
  userName: string;
  message: string;
}

export const dynamic = 'force-dynamic'; 

export async function POST(req: NextRequest) {
  try {
    const body: SendMessageRequest = await req.json();
    const { roomCode, userName, message } = body;

    // Validation
    if (!roomCode || !userName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Add message to Redis
    const newMessage = await addMessage(roomCode, userName, message.trim());

    if (!newMessage) {
      return NextResponse.json(
        { error: 'Room not found or expired' },
        { status: 404 }
      );
    }
    await pusherServer.trigger(`chat-${roomCode}`, 'incoming-message', newMessage);

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}