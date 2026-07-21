import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { redis } from './redis';
import { NextRequest, NextResponse } from 'next/server';

function createLimiter(maxRequests: number, window: Duration) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window),
    analytics: true,
    prefix: 'ratelimit',
  });
}

const createRoomLimiter = createLimiter(10, '1 h' as Duration);
const joinRoomLimiter = createLimiter(30, '1 h' as Duration);
const sendMessageLimiter = createLimiter(30, '1 m' as Duration);
const uploadSignLimiter = createLimiter(60, '1 m' as Duration);

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

export async function checkCreateRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getIp(req);
  const { success } = await createRoomLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { message: 'Too many rooms created. Please try again later.' },
      { status: 429 }
    );
  }
  return null;
}

export async function checkJoinRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getIp(req);
  const { success } = await joinRoomLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { message: 'Too many join attempts. Please try again later.' },
      { status: 429 }
    );
  }
  return null;
}

export async function checkUploadSignRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getIp(req);
  const { success } = await uploadSignLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { message: 'Too many upload requests. Please slow down.' },
      { status: 429 }
    );
  }
  return null;
}

export async function checkSendMessageRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getIp(req);
  const { success } = await sendMessageLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { message: 'Too many messages. Please slow down.' },
      { status: 429 }
    );
  }
  return null;
}

const MAX_BODY_BYTES = {
  create: 10_240,
  join: 10_240,
  send: 102_400,
};

export function checkBodySize(req: NextRequest, maxSize: keyof typeof MAX_BODY_BYTES): NextResponse | null {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES[maxSize]) {
    return NextResponse.json(
      { message: 'Request body too large' },
      { status: 413 }
    );
  }
  return null;
}
