/**
 * User Adapter for Migration Period
 * 
 * This module provides compatibility functions to handle user queries during
 * the migration from test to production Clerk environment.
 * 
 * It tries to get user info from production environment first, and falls back
 * to Redis mapping for test environment users.
 */

'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface UserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

/**
 * Get user information with migration compatibility
 * 
 * This function handles multiple scenarios:
 * 1. Successfully migrated user: Found in production Clerk environment
 * 2. Old user who re-registered: Found in production with same email as Redis mapping
 * 3. Failed migration user: Not in production, but email available in Redis
 * 4. Completely new user: Only in production, no Redis mapping
 * 5. Non-existent user: Not found anywhere
 */
export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  try {
    console.log(`[UserAdapter] Getting user info for ID: ${userId}`);

    // First, try to get user from production Clerk environment
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      console.log(`[UserAdapter] Found user in production environment: ${userId}`);
      
      // Check if this user was previously in test environment (old user who re-registered)
      const testUserEmail = await redis.get(`test_user_email:${userId}`);
      if (testUserEmail && testUserEmail === user.emailAddresses?.[0]?.emailAddress) {
        console.log(`[UserAdapter] User re-registered with same email: ${testUserEmail}`);
        // Mark this as a re-registered user (could be useful for analytics)
      }
      
      return {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        fullName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || undefined,
      };
    } catch {
      console.log(`[UserAdapter] User not found in production, checking Redis mapping: ${userId}`);
      
      // If user not found in production, try Redis mapping for test environment users
      const testUserEmail = await redis.get(`test_user_email:${userId}`);
      
      if (testUserEmail) {
        console.log(`[UserAdapter] Found email mapping in Redis: ${userId} -> ${testUserEmail}`);
        
        return {
          id: userId,
          email: testUserEmail as string,
          firstName: undefined,
          lastName: undefined,
          fullName: undefined,
        };
      }
      
      console.log(`[UserAdapter] No user found in production or Redis for ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`[UserAdapter] Error getting user info for ${userId}:`, error);
    return null;
  }
}

/**
 * Get user email with migration compatibility
 * 
 * Simplified version that only returns the email address
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const userInfo = await getUserInfo(userId);
    return userInfo?.email || null;
  } catch (error) {
    console.error(`[UserAdapter] Error getting user email for ${userId}:`, error);
    return null;
  }
}

/**
 * Get user's full name with migration compatibility
 */
export async function getUserName(userId: string): Promise<string | null> {
  try {
    const userInfo = await getUserInfo(userId);
    return userInfo?.fullName || userInfo?.email || null;
  } catch (error) {
    console.error(`[UserAdapter] Error getting user name for ${userId}:`, error);
    return null;
  }
}

/**
 * Check if Redis mapping is available (for monitoring)
 */
export async function checkRedisMappingHealth(): Promise<{
  success: boolean;
  totalMappings?: number;
  error?: string;
}> {
  try {
    // Try to get migration info
    const migrationInfoStr = await redis.get('user_migration_info');
    
    if (migrationInfoStr) {
      const migrationInfo = JSON.parse(migrationInfoStr as string);
      return {
        success: true,
        totalMappings: migrationInfo.successCount || 0,
      };
    }
    
    return {
      success: true,
      totalMappings: 0,
    };
  } catch (error) {
    console.error('[UserAdapter] Redis health check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a user has re-registered with the same email
 * This helps identify when old users have created new accounts
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkForReRegisteredUser(email: string): Promise<void> {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
      limit: 10,
    });
    
    if (users.data.length > 0) {
      // Store information about potential re-registration for analytics
      const reregistrationKey = `reregistered_user:${email}`;
      await redis.set(reregistrationKey, JSON.stringify({
        email,
        productionUserIds: users.data.map(u => u.id),
        detectedAt: new Date().toISOString(),
      }));
      await redis.expire(reregistrationKey, 7 * 24 * 60 * 60); // 7 days expiration
    }
  } catch (error) {
    // Silently handle Clerk API errors - this is not critical functionality
    console.error(`[UserAdapter] Could not check for re-registered user with email ${email}:`, error);
  }
}

/**
 * Get user by email (useful for finding re-registered users)
 */
export async function getUserByEmail(email: string): Promise<UserInfo | null> {
  try {
    console.log(`[UserAdapter] Looking up user by email: ${email}`);
    
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });
    
    if (users.data.length > 0) {
      const user = users.data[0];
      console.log(`[UserAdapter] Found production user by email: ${email} -> ${user.id}`);
      
      return {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        fullName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || undefined,
      };
    }
    
    console.log(`[UserAdapter] No production user found with email: ${email}`);
    return null;
  } catch (error) {
    console.error(`[UserAdapter] Error looking up user by email ${email}:`, error);
    return null;
  }
}

/**
 * Check if user needs to re-register
 * Returns true if user exists in Redis but not in production
 */
export async function userNeedsReRegistration(userId: string): Promise<boolean> {
  try {
    // Check if user exists in production
    const client = await clerkClient();
    try {
      await client.users.getUser(userId);
      return false; // User exists in production, no need to re-register
    } catch {
      // User not found in production, check if they have Redis mapping
      const testUserEmail = await redis.get(`test_user_email:${userId}`);
      return !!testUserEmail; // Need to re-register if they have Redis mapping
    }
  } catch (error) {
    console.error(`[UserAdapter] Error checking re-registration status for ${userId}:`, error);
    return false;
  }
}

/**
 * Batch get user information for multiple user IDs
 * Useful for dashboard or admin views
 */
export async function batchGetUserInfo(userIds: string[]): Promise<(UserInfo | null)[]> {
  console.log(`[UserAdapter] Batch getting user info for ${userIds.length} users`);
  
  const promises = userIds.map(userId => getUserInfo(userId));
  const results = await Promise.all(promises);
  
  const successCount = results.filter(result => result !== null).length;
  console.log(`[UserAdapter] Batch operation completed: ${successCount}/${userIds.length} users found`);
  
  return results;
}