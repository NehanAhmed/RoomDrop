import { NextApiRequest, NextApiResponse } from 'next';
import { cleanupExpiredRooms } from '@/lib/cleanUpRoomUtility';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await cleanupExpiredRooms();
  return res.status(200).json(result);
}