// lib/cleanupExpiredRooms.ts
import { db } from '@/lib/db';
import { rooms } from '@/lib/db/schema';
import { lt, eq } from 'drizzle-orm';

/**
 * Cleanup expired rooms from the database
 * Run this as a cron job or scheduled task
 */
export async function cleanupExpiredRooms(): Promise<{
  deletedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let deletedCount = 0;

  try {
    // Find expired rooms
    const expiredRooms = await db
      .select()
      .from(rooms)
      .where(
        lt(rooms.expiresAt, new Date())
      );

    console.log(`Found ${expiredRooms.length} expired rooms to clean up`);

    // Delete expired rooms (cascade will handle participants and messages)
    for (const room of expiredRooms) {
      try {
        await db
          .delete(rooms)
          .where(eq(rooms.code, room.code));
        
        deletedCount++;
        console.log(`Deleted expired room: ${room.code}`);
      } catch (error) {
        const errorMsg = `Failed to delete room ${room.code}: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return { deletedCount, errors };
  } catch (error) {
    const errorMsg = `Error during cleanup: ${error}`;
    errors.push(errorMsg);
    console.error(errorMsg);
    return { deletedCount, errors };
  }
}

/**
 * Mark inactive rooms based on last activity
 * This doesn't delete them, just marks them as inactive
 */
export async function markInactiveRooms(): Promise<number> {
  try {
    const result = await db
      .update(rooms)
      .set({ isActive: false })
      .where(
        lt(rooms.expiresAt, new Date())
      );

    return result.rowCount || 0;
  } catch (error) {
    console.error('Error marking inactive rooms:', error);
    return 0;
  }
}

// ============================================
// CRON JOB SETUP (Optional)
// ============================================

/*
// pages/api/cron/cleanup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { cleanupExpiredRooms } from '@/lib/cleanupExpiredRooms';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret to prevent unauthorized access
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await cleanupExpiredRooms();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Cleanup failed' });
  }
}
*/

// ============================================
// VERCEL CRON CONFIG (vercel.json)
// ============================================

/*
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
*/