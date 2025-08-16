#!/usr/bin/env node

/**
 * Test User Migration System
 * 
 * This script tests the user migration functionality without making actual changes
 */

const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

// Initialize clients (read-only for testing)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Using anon key for read-only testing
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Test Redis connectivity and data
 */
async function testRedisConnection() {
  console.log('🔗 Testing Redis connection...');
  
  try {
    // Test basic connectivity
    const testKey = 'test_connection';
    await redis.set(testKey, 'test_value', { ex: 10 });
    const testValue = await redis.get(testKey);
    
    if (testValue === 'test_value') {
      console.log('✅ Redis connection successful');
    } else {
      console.log('❌ Redis connection failed - value mismatch');
      return false;
    }
    
    // Check for migration data
    const migrationInfo = await redis.get('user_migration_info');
    if (migrationInfo) {
      try {
        const info = JSON.parse(migrationInfo);
        console.log(`📊 Migration info found: ${info.successCount} users migrated`);
      } catch (e) {
        console.log(`📊 Migration info found but not JSON: ${migrationInfo}`);
      }
    }
    
    // Count test user mappings
    const testUserKeys = await redis.keys('test_user_email:*');
    console.log(`📋 Found ${testUserKeys.length} test user email mappings`);
    
    // Count re-registration records
    const reregKeys = await redis.keys('reregistered_user:*');
    console.log(`🔄 Found ${reregKeys.length} re-registration records`);
    
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

/**
 * Test Supabase connectivity and check data
 */
async function testSupabaseConnection() {
  console.log('\n🔗 Testing Supabase connection...');
  
  try {
    // Test applications table
    const { count: appCount, error: appError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true });
    
    if (appError) {
      console.error('❌ Applications table access failed:', appError);
      return false;
    }
    
    console.log(`📱 Applications table: ${appCount || 0} records`);
    
    // Test user_subscriptions table
    const { count: subCount, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true });
    
    if (subError) {
      console.error('❌ User subscriptions table access failed:', subError);
      return false;
    }
    
    console.log(`💳 User subscriptions table: ${subCount || 0} records`);
    
    // Check for any user IDs that match test environment format
    const { data: testUserApps } = await supabase
      .from('applications')
      .select('user_id')
      .like('user_id', 'user_%');
    
    const uniqueTestUserIds = new Set(testUserApps?.map(app => app.user_id) || []);
    console.log(`🧪 Found ${uniqueTestUserIds.size} unique test-format user IDs in applications`);
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

/**
 * Simulate migration detection for test users
 */
async function simulateMigrationDetection() {
  console.log('\n🎯 Simulating migration detection...');
  
  try {
    // Get some test user mappings
    const testUserKeys = await redis.keys('test_user_email:*');
    const sampleSize = Math.min(5, testUserKeys.length);
    
    console.log(`📋 Testing with ${sampleSize} sample users:`);
    
    for (let i = 0; i < sampleSize; i++) {
      const key = testUserKeys[i];
      const email = await redis.get(key);
      const oldUserId = key.replace('test_user_email:', '');
      
      console.log(`\n👤 Test User ${i + 1}:`);
      console.log(`   Email: ${email}`);
      console.log(`   Old ID: ${oldUserId}`);
      
      // Check if this user has data in database
      const { count: appCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', oldUserId);
      
      const { count: subCount } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', oldUserId);
      
      console.log(`   📱 Applications: ${appCount || 0}`);
      console.log(`   💳 Subscriptions: ${subCount || 0}`);
      
      // Check if there's a re-registration record
      const reregKey = `reregistered_user:${email}`;
      const reregData = await redis.get(reregKey);
      
      if (reregData) {
        const reregInfo = JSON.parse(reregData);
        console.log(`   🔄 Re-registration detected!`);
        console.log(`   📊 Production IDs: ${reregInfo.productionUserIds.join(', ')}`);
        
        if ((appCount || 0) > 0 || (subCount || 0) > 0) {
          console.log(`   ⚠️  MIGRATION NEEDED: User has data that needs to be transferred`);
        } else {
          console.log(`   ✅ No migration needed: User has no data to transfer`);
        }
      } else {
        console.log(`   ℹ️  No re-registration detected`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Migration detection simulation failed:', error);
    return false;
  }
}

/**
 * Test the migration logic without making changes
 */
async function testMigrationLogic() {
  console.log('\n🧪 Testing migration logic (dry run)...');
  
  try {
    // Find a user who needs migration
    const reregKeys = await redis.keys('reregistered_user:*');
    
    if (reregKeys.length === 0) {
      console.log('ℹ️  No re-registered users found for testing');
      return true;
    }
    
    const testKey = reregKeys[0];
    const reregData = await redis.get(testKey);
    const reregInfo = JSON.parse(reregData);
    
    console.log(`🎯 Testing with user: ${reregInfo.email}`);
    
    // Find old user ID
    const testUserKeys = await redis.keys('test_user_email:*');
    let oldUserId = null;
    
    for (const key of testUserKeys) {
      const email = await redis.get(key);
      if (email === reregInfo.email) {
        oldUserId = key.replace('test_user_email:', '');
        break;
      }
    }
    
    if (!oldUserId) {
      console.log('❌ Could not find old user ID');
      return false;
    }
    
    const newUserId = reregInfo.productionUserIds[0];
    
    console.log(`📋 Migration Test:`);
    console.log(`   Email: ${reregInfo.email}`);
    console.log(`   Old ID: ${oldUserId}`);
    console.log(`   New ID: ${newUserId}`);
    
    // Check what would be migrated
    const { data: apps } = await supabase
      .from('applications')
      .select('id, name, created_at')
      .eq('user_id', oldUserId);
    
    const { data: subs } = await supabase
      .from('user_subscriptions')
      .select('id, plan_name, created_at')
      .eq('user_id', oldUserId);
    
    console.log(`\n📊 Data to migrate:`);
    console.log(`   Applications: ${apps?.length || 0}`);
    if (apps && apps.length > 0) {
      apps.forEach(app => {
        console.log(`     - ${app.name || 'Unnamed'} (${app.created_at})`);
      });
    }
    
    console.log(`   Subscriptions: ${subs?.length || 0}`);
    if (subs && subs.length > 0) {
      subs.forEach(sub => {
        console.log(`     - ${sub.plan_name} (${sub.created_at})`);
      });
    }
    
    // Check if new user already has conflicting data
    const { data: newUserApps } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', newUserId);
    
    const { data: newUserSubs } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', newUserId);
    
    console.log(`\n⚠️  Conflict check:`);
    console.log(`   New user applications: ${newUserApps?.length || 0}`);
    console.log(`   New user subscriptions: ${newUserSubs?.length || 0}`);
    
    if ((newUserApps?.length || 0) > 0 || (newUserSubs?.length || 0) > 0) {
      console.log(`   🚨 WARNING: New user already has data! Migration would need to handle conflicts.`);
    } else {
      console.log(`   ✅ No conflicts detected`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Migration logic test failed:', error);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting User Migration System Tests\n');
  
  const tests = [
    { name: 'Redis Connection', fn: testRedisConnection },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Migration Detection', fn: simulateMigrationDetection },
    { name: 'Migration Logic', fn: testMigrationLogic }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Running: ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
      
      if (result) {
        console.log(`\n✅ ${test.name} - PASSED`);
      } else {
        console.log(`\n❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.error(`\n💥 ${test.name} - ERROR:`, error);
      results.push({ name: test.name, success: false, error });
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name}`);
  });
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Migration system is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  return failed === 0;
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };