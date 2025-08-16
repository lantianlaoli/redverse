/**
 * User Migration Utilities
 * 
 * Helper functions for handling user ID migration and re-registration scenarios
 */

'use server';

import { supabase } from '@/lib/supabase';
// Note: Direct imports from user-adapter removed to avoid client/server conflicts

/**
 * Check if user has data in database that needs ID migration
 */
export async function checkUserDataForMigration(email: string): Promise<{
  hasData: boolean;
  applications: number;
  subscriptions: number;
  oldUserId?: string;
}> {
  try {
    // We need to find old user ID from Redis mapping
    // Since we can't call user-adapter functions directly, we'll use Redis directly
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    
    // Search for old user ID by email
    const testUserKeys = await redis.keys('test_user_email:*');
    let oldUserId: string | null = null;
    
    for (const key of testUserKeys) {
      const storedEmail = await redis.get(key);
      if (storedEmail === email) {
        oldUserId = key.replace('test_user_email:', '');
        break;
      }
    }
    
    if (!oldUserId) {
      return {
        hasData: false,
        applications: 0,
        subscriptions: 0
      };
    }
    
    // Check applications count
    const { count: appCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', oldUserId);
    
    // Check subscriptions count
    const { count: subCount } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', oldUserId);
    
    const hasData = (appCount || 0) > 0 || (subCount || 0) > 0;
    
    return {
      hasData,
      applications: appCount || 0,
      subscriptions: subCount || 0,
      oldUserId: hasData ? oldUserId : undefined
    };
  } catch (error) {
    console.error('Error checking user data for migration:', error);
    return {
      hasData: false,
      applications: 0,
      subscriptions: 0
    };
  }
}

/**
 * Migrate user data from old ID to new ID
 */
export async function migrateUserData(oldUserId: string, newUserId: string): Promise<{
  success: boolean;
  migratedTables: string[];
  errors: string[];
}> {
  const migratedTables: string[] = [];
  const errors: string[] = [];
  
  try {
    // Migrate applications
    const { error: appError } = await supabase
      .from('applications')
      .update({ user_id: newUserId })
      .eq('user_id', oldUserId);
    
    if (appError) {
      errors.push(`Applications migration failed: ${appError.message}`);
    } else {
      migratedTables.push('applications');
    }
    
    // Migrate user subscriptions
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({ user_id: newUserId })
      .eq('user_id', oldUserId);
    
    if (subError) {
      errors.push(`Subscriptions migration failed: ${subError.message}`);
    } else {
      migratedTables.push('user_subscriptions');
    }
    
    return {
      success: errors.length === 0,
      migratedTables,
      errors
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      migratedTables,
      errors: [errorMessage]
    };
  }
}

/**
 * Handle user sign-in with potential migration
 * This should be called when a user signs in to check for data migration needs
 */
export async function handleUserSignInMigration(userId: string, email: string): Promise<{
  migrationPerformed: boolean;
  migrationResult?: {
    success: boolean;
    migratedTables: string[];
    errors: string[];
  };
  userHadPreviousData?: boolean;
}> {
  try {
    console.log(`[Migration] Checking migration needs for user ${email}`);
    
    // Check if user has previous data that needs migration
    const migrationCheck = await checkUserDataForMigration(email);
    
    if (!migrationCheck.hasData || !migrationCheck.oldUserId) {
      console.log(`[Migration] No migration needed for ${email}`);
      return {
        migrationPerformed: false,
        userHadPreviousData: false
      };
    }
    
    // If old user ID is same as current, no migration needed
    if (migrationCheck.oldUserId === userId) {
      console.log(`[Migration] User ${email} already using correct ID`);
      return {
        migrationPerformed: false,
        userHadPreviousData: true
      };
    }
    
    console.log(`[Migration] Performing migration for ${email}: ${migrationCheck.oldUserId} -> ${userId}`);
    
    // Perform migration
    const migrationResult = await migrateUserData(migrationCheck.oldUserId, userId);
    
    console.log(`[Migration] Migration completed for ${email}:`, migrationResult);
    
    return {
      migrationPerformed: true,
      migrationResult,
      userHadPreviousData: true
    };
  } catch (error) {
    console.error(`[Migration] Error handling user sign-in migration for ${email}:`, error);
    return {
      migrationPerformed: false,
      userHadPreviousData: false
    };
  }
}

/**
 * Get user migration status
 */
export async function getUserMigrationStatus(userId: string, email: string): Promise<{
  needsMigration: boolean;
  oldUserId?: string;
  dataCount: {
    applications: number;
    subscriptions: number;
  };
}> {
  try {
    const migrationCheck = await checkUserDataForMigration(email);
    
    const needsMigration = Boolean(migrationCheck.hasData && 
                                  migrationCheck.oldUserId && 
                                  migrationCheck.oldUserId !== userId);
    
    return {
      needsMigration,
      oldUserId: migrationCheck.oldUserId,
      dataCount: {
        applications: migrationCheck.applications,
        subscriptions: migrationCheck.subscriptions
      }
    };
  } catch (error) {
    console.error('Error getting user migration status:', error);
    return {
      needsMigration: false,
      dataCount: {
        applications: 0,
        subscriptions: 0
      }
    };
  }
}