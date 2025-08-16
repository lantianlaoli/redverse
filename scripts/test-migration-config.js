#!/usr/bin/env node

/**
 * Test script to verify migration configuration
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testConfig() {
  console.log('🔧 Testing Clerk Migration Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const testKey = process.env.CLERK_TEST_SECRET_KEY;
  const prodKey = process.env.CLERK_SECRET_KEY;
  
  console.log(`   Test Secret Key: ${testKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Prod Secret Key: ${prodKey ? '✅ Present' : '❌ Missing'}`);
  
  if (!testKey || !prodKey) {
    console.log('\n❌ Missing required environment variables');
    return false;
  }

  // Check CSV file
  console.log('\n📄 CSV File:');
  const csvPath = path.join(__dirname, '..', 'clerk_test_users.csv');
  const csvExists = fs.existsSync(csvPath);
  
  console.log(`   CSV file exists: ${csvExists ? '✅ Yes' : '❌ No'}`);
  
  if (csvExists) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    console.log(`   Total lines: ${lines.length}`);
    console.log(`   User records: ${lines.length - 1} (excluding header)`);
  }

  // Test Clerk API connectivity (basic)
  console.log('\n🌐 API Connectivity:');
  try {
    // Test production API
    const response = await fetch('https://api.clerk.com/v1/users?limit=1', {
      headers: {
        'Authorization': `Bearer ${prodKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Production API: ${response.ok ? '✅ Connected' : '❌ Failed'}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   Production API: ❌ Connection failed - ${error.message}`);
  }

  console.log('\n✅ Configuration test completed!');
  return true;
}

if (require.main === module) {
  testConfig().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testConfig };