#!/usr/bin/env node

/**
 * Test script for creating a single user
 */

require('dotenv').config();

const CLERK_PROD_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API_BASE = 'https://api.clerk.com/v1';

async function testSingleUser() {
  console.log('🧪 Testing single user creation...\n');
  
  if (!CLERK_PROD_SECRET_KEY) {
    console.error('❌ Missing CLERK_SECRET_KEY');
    return;
  }

  console.log('✅ API Key present');

  // Test user data
  const testUser = {
    first_name: 'Test',
    last_name: 'User',
    email_address: 'test-migration-' + Date.now() + '@example.com',
  };

  console.log('📝 Test user data:', testUser);

  try {
    console.log('\n🌐 Making API request...');
    const response = await fetch(`${CLERK_API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_PROD_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    
    if (response.ok) {
      const userData = JSON.parse(responseText);
      console.log('✅ User created successfully!');
      console.log('User ID:', userData.id);
      console.log('Email:', userData.email_addresses?.[0]?.email_address);
    } else {
      console.log('❌ API Error:', responseText);
    }

  } catch (error) {
    console.error('💥 Request failed:', error.message);
  }
}

testSingleUser();