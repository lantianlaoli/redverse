#!/usr/bin/env node

/**
 * User ID Update Script for Re-registered Users
 * 
 * This script updates user IDs in database tables when old users re-register
 * with new Clerk user IDs but same email addresses.
 */

const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role for admin operations
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Find users who have re-registered by checking Redis mappings
 */
async function findReRegisteredUsers() {
  console.log('🔍 Looking for re-registered users...');
  
  try {
    // Get all re-registration records from Redis
    const keys = await redis.keys('reregistered_user:*');
    const reregisteredUsers = [];
    
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const userInfo = JSON.parse(data);
        reregisteredUsers.push(userInfo);
      }
    }
    
    console.log(`📋 Found ${reregisteredUsers.length} re-registered users`);
    return reregisteredUsers;
  } catch (error) {
    console.error('❌ Error finding re-registered users:', error);
    return [];
  }
}

/**
 * Get old user ID by email from Redis mapping
 */
async function getOldUserIdByEmail(email) {
  try {
    // Search through all test user email mappings
    const keys = await redis.keys('test_user_email:*');
    
    for (const key of keys) {
      const storedEmail = await redis.get(key);
      if (storedEmail === email) {
        // Extract user ID from key (format: test_user_email:USER_ID)
        const oldUserId = key.replace('test_user_email:', '');
        return oldUserId;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error getting old user ID for email ${email}:`, error);
    return null;
  }
}

/**
 * Update user ID in a specific table
 */
async function updateUserIdInTable(tableName, oldUserId, newUserId) {
  try {
    console.log(`   🔄 Updating ${tableName} table...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .update({ user_id: newUserId })
      .eq('user_id', oldUserId)
      .select('id');
    
    if (error) {
      console.error(`   ❌ Failed to update ${tableName}:`, error);
      return { success: false, error: error.message };
    }
    
    const updatedCount = data ? data.length : 0;
    console.log(`   ✅ Updated ${updatedCount} records in ${tableName}`);
    
    return { success: true, updatedCount };
  } catch (error) {
    console.error(`   ❌ Error updating ${tableName}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user IDs across all relevant tables
 */
async function updateUserIds(email, oldUserId, newUserId) {
  console.log(`\n📝 Updating user IDs for ${email}:`);
  console.log(`   Old ID: ${oldUserId}`);
  console.log(`   New ID: ${newUserId}`);
  
  const results = {
    email,
    oldUserId,
    newUserId,
    updates: {},
    success: true,
    totalUpdated: 0
  };
  
  // List of tables that contain user_id
  const tables = ['applications', 'user_subscriptions'];
  
  for (const table of tables) {
    const result = await updateUserIdInTable(table, oldUserId, newUserId);
    results.updates[table] = result;
    
    if (result.success) {
      results.totalUpdated += result.updatedCount || 0;
    } else {
      results.success = false;
    }
  }
  
  return results;
}

/**
 * Create backup before making changes
 */
async function createBackup() {
  console.log('💾 Creating backup of current data...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {};
    
    // Backup applications table
    const { data: applications } = await supabase
      .from('applications')
      .select('*');
    backupData.applications = applications;
    
    // Backup user_subscriptions table
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*');
    backupData.user_subscriptions = subscriptions;
    
    // Save backup to file
    const fs = require('fs');
    const path = require('path');
    const backupFile = path.join(__dirname, '..', `database-backup-${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup saved to: ${backupFile}`);
    
    return { success: true, backupFile };
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to process all re-registered users
 */
async function processReRegisteredUsers() {
  console.log('🚀 Starting user ID update process...\n');
  
  // Create backup first
  const backupResult = await createBackup();
  if (!backupResult.success) {
    console.error('❌ Backup failed, aborting update process');
    return;
  }
  
  // Find re-registered users
  const reregisteredUsers = await findReRegisteredUsers();
  
  if (reregisteredUsers.length === 0) {
    console.log('ℹ️  No re-registered users found');
    return;
  }
  
  const results = [];
  
  for (let i = 0; i < reregisteredUsers.length; i++) {
    const user = reregisteredUsers[i];
    const progress = `[${i + 1}/${reregisteredUsers.length}]`;
    
    console.log(`\n${progress} Processing ${user.email}...`);
    
    // Get old user ID
    const oldUserId = await getOldUserIdByEmail(user.email);
    
    if (!oldUserId) {
      console.log(`   ⚠️  Could not find old user ID for ${user.email}`);
      results.push({
        email: user.email,
        success: false,
        error: 'Old user ID not found'
      });
      continue;
    }
    
    // Use the first production user ID (should be only one)
    const newUserId = user.productionUserIds[0];
    
    if (!newUserId) {
      console.log(`   ⚠️  No production user ID found for ${user.email}`);
      results.push({
        email: user.email,
        success: false,
        error: 'Production user ID not found'
      });
      continue;
    }
    
    // Update user IDs
    const updateResult = await updateUserIds(user.email, oldUserId, newUserId);
    results.push(updateResult);
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalUpdated = successful.reduce((sum, r) => sum + (r.totalUpdated || 0), 0);
  
  console.log(`✅ Successfully processed: ${successful.length} users`);
  console.log(`❌ Failed: ${failed.length} users`);
  console.log(`🔄 Total records updated: ${totalUpdated}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed updates:');
    failed.forEach(result => {
      console.log(`   - ${result.email}: ${result.error}`);
    });
  }
  
  if (successful.length > 0) {
    console.log('\n✅ Successful updates:');
    successful.forEach(result => {
      console.log(`   - ${result.email}: ${result.totalUpdated} records updated`);
    });
  }
  
  // Save detailed results
  const fs = require('fs');
  const path = require('path');
  const resultsFile = path.join(__dirname, '..', 'user-id-update-results.json');
  
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    backupFile: backupResult.backupFile,
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      totalRecordsUpdated: totalUpdated
    },
    results
  }, null, 2));
  
  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
  console.log('\n🎉 User ID update process completed!');
}

/**
 * Manual update function for specific user
 */
async function manualUpdate(email, newUserId) {
  console.log(`🛠️  Manual update for ${email} to user ID ${newUserId}...`);
  
  // Create backup first
  const backupResult = await createBackup();
  if (!backupResult.success) {
    console.error('❌ Backup failed, aborting manual update');
    return;
  }
  
  // Get old user ID
  const oldUserId = await getOldUserIdByEmail(email);
  
  if (!oldUserId) {
    console.error(`❌ Could not find old user ID for ${email}`);
    return;
  }
  
  // Update user IDs
  const result = await updateUserIds(email, oldUserId, newUserId);
  
  console.log('\n📊 Manual Update Result:');
  console.log(`Email: ${result.email}`);
  console.log(`Old ID: ${result.oldUserId}`);
  console.log(`New ID: ${result.newUserId}`);
  console.log(`Success: ${result.success}`);
  console.log(`Total Updated: ${result.totalUpdated}`);
  
  if (!result.success) {
    console.log('Errors:');
    Object.entries(result.updates).forEach(([table, update]) => {
      if (!update.success) {
        console.log(`  ${table}: ${update.error}`);
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Run automatic process
    processReRegisteredUsers().catch(error => {
      console.error('\n💥 Update process failed:', error);
      process.exit(1);
    });
  } else if (args.length === 2 && args[0] === '--manual') {
    // Manual update: node update-user-ids.js --manual email@example.com new_user_id
    const [, email, newUserId] = args;
    manualUpdate(email, newUserId).catch(error => {
      console.error('\n💥 Manual update failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  node update-user-ids.js                                    # Auto-process all re-registered users');
    console.log('  node update-user-ids.js --manual email@example.com new_id  # Manual update for specific user');
    process.exit(1);
  }
}

module.exports = {
  processReRegisteredUsers,
  manualUpdate,
  findReRegisteredUsers,
  updateUserIds
};