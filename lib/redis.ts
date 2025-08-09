import { Redis } from '@upstash/redis';

// Initialize Redis client with Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DEV_MODE_KEY = 'redverse:dev_mode';

export class RedisStore {
  static async getDevMode(): Promise<boolean> {
    try {
      const mode = await redis.get(DEV_MODE_KEY);
      return mode === true || mode === 'true';
    } catch (error) {
      console.error('Redis getDevMode error:', error);
      // Fallback to environment variable if Redis fails
      return process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    }
  }

  static async setDevMode(devMode: boolean): Promise<boolean> {
    try {
      await redis.set(DEV_MODE_KEY, devMode);
      return true;
    } catch (error) {
      console.error('Redis setDevMode error:', error);
      return false;
    }
  }
}