import { NextRequest, NextResponse } from 'next/server';
import { checkSendMessageRateLimit, checkBodySize } from '@/lib/rateLimit';

interface SendMessageRequest {
  roomCode: string;
  userName: string;
  message: string;
  imageUrl?: string;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const bodyLimit = checkBodySize(req, 'send');
    if (bodyLimit) return bodyLimit;

    const rateLimit = await checkSendMessageRateLimit(req);
    if (rateLimit) return rateLimit;

  try {
    const { getPusherServer } = await import('@/lib/pusher');
    const pusherServer = getPusherServer();
    const { addMessage } = await import('@/lib/RoomService');

    const body: SendMessageRequest = await req.json();
    const { roomCode, userName, message, imageUrl } = body;

    if (!roomCode || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!message && !imageUrl) {
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    if (message && message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message && message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const newMessage = await addMessage(roomCode, userName, message?.trim() ?? '', imageUrl);

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
