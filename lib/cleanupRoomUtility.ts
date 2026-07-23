import { db } from '@/lib/db';
import { rooms } from '@/lib/db/schema';
import { lt } from 'drizzle-orm';

const BATCH_SIZE = 100;

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

      try {
        const result = await db
          .delete(rooms)
          .where(lt(rooms.expiresAt, new Date()))
          .returning({ code: rooms.code });

        deletedCount += result.length;
      } catch (error) {
        const errorMsg = `Failed to delete batch of ${expiredRooms.length} rooms: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
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
