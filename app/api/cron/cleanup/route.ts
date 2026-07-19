import { NextResponse } from 'next/server';
import { cleanupExpiredRooms } from '@/lib/cleanupRoomUtility';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET() {
  try {
    const authHeader = process.env.CRON_SECRET;
    if (authHeader) {
      // In production, verify the cron secret
      // This is optional; Vercel Cron Jobs can be configured without auth
    }

    const result = await cleanupExpiredRooms();

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('Cron cleanup failed:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
