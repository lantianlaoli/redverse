#!/usr/bin/env node

/**
 * Save test environment user ID to email mapping in Redis
 * This helps maintain compatibility during the migration period
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

// Redis configuration
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Read users from CSV file
 */
function readUsersFromCSV() {
  const csvPath = path.join(__dirname, '..', 'clerk_test_users.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.filter(record => record.id && record.id.trim() !== '');
}

/**
 * Save user mappings to Redis
 */
async function saveUserMappings() {
  console.log('🚀 Saving user ID to email mappings to Redis...\n');

  // Check Redis connection
  try {
    await redis.ping();
    console.log('✅ Redis connection successful');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return;
  }

  let users;
  try {
    users = readUsersFromCSV();
    console.log(`📋 Found ${users.length} users in CSV file\n`);
  } catch (error) {
    console.error('❌ Error reading CSV file:', error.message);
    return;
  }

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  // Save user mappings
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const progress = `[${i + 1}/${users.length}]`;

    console.log(`${progress} Processing user: ${user.id}`);

    // Skip users without email
    if (!user.primary_email_address) {
      console.log(`   ⚠️  Skipping - no email address`);
      results.skipped.push({ userId: user.id, reason: 'No email address' });
      continue;
    }

    try {
      // Save mapping: test_user_id -> email
      const redisKey = `test_user_email:${user.id}`;
      await redis.set(redisKey, user.primary_email_address);
      
      // Also save reverse mapping: email -> test_user_id (for lookup)
      const reverseKey = `email_to_test_user:${user.primary_email_address}`;
      await redis.set(reverseKey, user.id);

      // Set expiration (30 days)
      await redis.expire(redisKey, 30 * 24 * 60 * 60);
      await redis.expire(reverseKey, 30 * 24 * 60 * 60);

      console.log(`   ✅ Saved mapping: ${user.id} → ${user.primary_email_address}`);
      results.success.push({
        userId: user.id,
        email: user.primary_email_address,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
      });

      // Small delay to avoid overwhelming Redis
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.failed.push({
        userId: user.id,
        email: user.primary_email_address,
        error: error.message,
      });
    }
  }

  // Save metadata about migration
  const migrationInfo = {
    timestamp: new Date().toISOString(),
    totalUsers: users.length,
    successCount: results.success.length,
    failedCount: results.failed.length,
    skippedCount: results.skipped.length,
    expirationDays: 30,
  };

  try {
    await redis.set('user_migration_info', JSON.stringify(migrationInfo));
    await redis.expire('user_migration_info', 30 * 24 * 60 * 60);
  } catch (error) {
    console.warn('⚠️  Could not save migration info:', error.message);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 REDIS MAPPING SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully saved: ${results.success.length} mappings`);
  console.log(`⚠️  Skipped: ${results.skipped.length} users`);
  console.log(`❌ Failed: ${results.failed.length} users`);
  console.log(`⏰ Expiration: 30 days`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed mappings:');
    results.failed.forEach(item => {
      console.log(`   - ${item.userId} (${item.email}): ${item.error}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log('\n⚠️  Skipped users:');
    results.skipped.forEach(item => {
      console.log(`   - ${item.userId}: ${item.reason}`);
    });
  }

  console.log('\n🎉 User mapping completed!');
  console.log('\n📝 Usage examples:');
  console.log('   Get email by test user ID: redis.get("test_user_email:user_xxx")');
  console.log('   Get test user ID by email: redis.get("email_to_test_user:email@example.com")');

  // Save results to file
  const resultsFile = path.join(__dirname, '..', 'user-mapping-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    migrationInfo,
  }, null, 2));

  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
}

// Run if script is executed directly
if (require.main === module) {
  saveUserMappings().catch(error => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { saveUserMappings };