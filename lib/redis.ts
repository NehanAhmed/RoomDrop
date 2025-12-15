// lib/redis.ts
import { Redis } from '@upstash/redis';

// Create Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Export type for TypeScript
export type RedisClient = typeof redis;