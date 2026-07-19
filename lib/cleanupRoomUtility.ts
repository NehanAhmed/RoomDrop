import { db } from '@/lib/db';
import { rooms } from '@/lib/db/schema';
import { lt, eq } from 'drizzle-orm';

const BATCH_SIZE = 100;

/**
 * Cleanup expired rooms from the database in batches
 * Run this as a cron job or scheduled task
 */
export async function cleanupExpiredRooms(): Promise<{
  deletedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let deletedCount = 0;

  try {
    let hasMore = true;

    while (hasMore) {
      const expiredRooms = await db
        .select({ code: rooms.code })
        .from(rooms)
        .where(lt(rooms.expiresAt, new Date()))
        .limit(BATCH_SIZE);

      if (expiredRooms.length === 0) {
        hasMore = false;
        break;
      }

      for (const room of expiredRooms) {
        try {
          await db
            .delete(rooms)
            .where(eq(rooms.code, room.code));

          deletedCount++;
        } catch (error) {
          const errorMsg = `Failed to delete room ${room.code}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired rooms`);
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
