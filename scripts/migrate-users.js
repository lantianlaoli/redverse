#!/usr/bin/env node

/**
 * Clerk User Migration Script
 * 
 * This script migrates users from test environment to production environment
 * using Clerk's Backend API
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

// Clerk API configuration
const CLERK_TEST_SECRET_KEY = process.env.CLERK_TEST_SECRET_KEY;
const CLERK_PROD_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_TEST_SECRET_KEY || !CLERK_PROD_SECRET_KEY) {
  console.error('❌ Missing Clerk API keys in environment variables');
  process.exit(1);
}

const CLERK_API_BASE = 'https://api.clerk.com/v1';

/**
 * Make API request to Clerk
 */
async function clerkRequest(endpoint, options = {}, secretKey) {
  const url = `${CLERK_API_BASE}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Clerk API error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Get user from test environment
 */
async function getTestUser(userId) {
  try {
    return await clerkRequest(`/users/${userId}`, { method: 'GET' }, CLERK_TEST_SECRET_KEY);
  } catch (error) {
    console.warn(`⚠️  Could not fetch test user ${userId}:`, error.message);
    return null;
  }
}

/**
 * Check if user exists in production environment by email
 */
async function findProdUserByEmail(email) {
  try {
    const users = await clerkRequest(`/users?email_address=${encodeURIComponent(email)}`, 
      { method: 'GET' }, CLERK_PROD_SECRET_KEY);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.warn(`⚠️  Could not search for user with email ${email}:`, error.message);
    return null;
  }
}

/**
 * Create user in production environment
 */
async function createProdUser(userData) {
  const payload = {
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    email_address: userData.primary_email_address ? [userData.primary_email_address] : undefined,
    phone_number: userData.primary_phone_number ? [userData.primary_phone_number] : undefined,
    username: userData.username || undefined,
    skip_password_requirement: true,
    skip_password_checks: true,
  };

  // Remove empty strings and undefined values
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });

  try {
    return await clerkRequest('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, CLERK_PROD_SECRET_KEY);
  } catch (error) {
    console.error(`Failed to create user with email ${userData.primary_email_address}:`, error.message);
    throw error;
  }
}

/**
 * Read and parse CSV file
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
 * Main migration function
 */
async function migrateUsers() {
  console.log('🚀 Starting Clerk user migration from test to production...\n');

  let users;
  try {
    users = readUsersFromCSV();
    console.log(`📋 Found ${users.length} users in CSV file`);
  } catch (error) {
    console.error('❌ Error reading CSV file:', error.message);
    process.exit(1);
  }

  const results = {
    success: [],
    skipped: [],
    failed: [],
  };

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const progress = `[${i + 1}/${users.length}]`;
    
    console.log(`\n${progress} Processing user: ${user.primary_email_address || user.id}`);

    // Skip users without email
    if (!user.primary_email_address) {
      console.log(`   ⚠️  Skipping user ${user.id} - no email address`);
      results.skipped.push({ user: user.id, reason: 'No email address' });
      continue;
    }

    try {
      // Check if user already exists in production
      const existingProdUser = await findProdUserByEmail(user.primary_email_address);
      if (existingProdUser) {
        console.log(`   ✅ User already exists in production: ${user.primary_email_address}`);
        results.skipped.push({ user: user.primary_email_address, reason: 'Already exists' });
        continue;
      }

      // Get detailed user data from test environment (optional, use CSV data if API fails)
      const testUserDetails = await getTestUser(user.id);
      const userToCreate = testUserDetails || user;

      // Create user in production environment
      console.log(`   🔄 Creating user in production...`);
      const newProdUser = await createProdUser(userToCreate);
      
      console.log(`   ✅ Successfully created user: ${newProdUser.id}`);
      results.success.push({
        testId: user.id,
        prodId: newProdUser.id,
        email: user.primary_email_address,
      });

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(`   ❌ Failed to migrate user: ${error.message}`);
      results.failed.push({
        user: user.primary_email_address || user.id,
        error: error.message,
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully migrated: ${results.success.length} users`);
  console.log(`⚠️  Skipped: ${results.skipped.length} users`);
  console.log(`❌ Failed: ${results.failed.length} users`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed migrations:');
    results.failed.forEach(item => {
      console.log(`   - ${item.user}: ${item.error}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log('\n⚠️  Skipped users:');
    results.skipped.forEach(item => {
      console.log(`   - ${item.user}: ${item.reason}`);
    });
  }

  if (results.success.length > 0) {
    console.log('\n✅ Successfully migrated users:');
    results.success.forEach(item => {
      console.log(`   - ${item.email}: ${item.testId} → ${item.prodId}`);
    });
  }

  // Save detailed results to file
  const resultsFile = path.join(__dirname, '..', 'migration-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: users.length,
      success: results.success.length,
      skipped: results.skipped.length,
      failed: results.failed.length,
    },
    results,
  }, null, 2));

  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
  console.log('\n🎉 Migration completed!');
}

// Run migration if script is executed directly
if (require.main === module) {
  migrateUsers().catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateUsers };