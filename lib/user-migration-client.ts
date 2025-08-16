/**
 * User Migration Client Utilities
 * 
 * Client-side helper functions for handling user migration
 */

/**
 * Client-side function to trigger user migration check
 */
export async function checkAndMigrateUser(userId: string, email: string): Promise<{
  migrationPerformed: boolean;
  success: boolean;
  errors?: string[];
}> {
  try {
    console.log(`[Migration Client] Checking migration for user ${email}`);
    
    const response = await fetch('/api/user-migration/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Migration Client] Migration check failed: ${response.status} ${errorText}`);
      return {
        migrationPerformed: false,
        success: false,
        errors: [`HTTP ${response.status}: ${errorText}`],
      };
    }
    
    const result = await response.json();
    console.log(`[Migration Client] Migration check result:`, result);
    
    return result;
  } catch (error) {
    console.error(`[Migration Client] Error checking migration:`, error);
    return {
      migrationPerformed: false,
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}