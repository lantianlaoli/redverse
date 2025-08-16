import { Redis } from '@upstash/redis';

// Initialize Redis client with Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisStore {
  // Redis utilities can be added here as needed
}