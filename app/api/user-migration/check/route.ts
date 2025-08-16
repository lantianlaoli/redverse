import { NextRequest, NextResponse } from 'next/server';
import { handleUserSignInMigration } from '@/lib/user-migration-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }
    
    console.log(`[Migration API] Checking migration for ${email}`);
    
    // Perform the migration check and execution
    const result = await handleUserSignInMigration(userId, email);
    
    return NextResponse.json({
      migrationPerformed: result.migrationPerformed,
      success: result.migrationResult?.success ?? true,
      errors: result.migrationResult?.errors ?? [],
      migratedTables: result.migrationResult?.migratedTables ?? [],
      userHadPreviousData: result.userHadPreviousData,
    });
    
  } catch (error) {
    console.error('[Migration API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}