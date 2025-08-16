# User Migration Deployment Guide

## Overview

This guide covers the deployment of user migration compatibility features for Redverse. The system now includes:

1. **User Adapter**: Compatibility layer that handles user queries during migration period
2. **Redis Mappings**: Test environment user ID to email mappings stored in Redis
3. **Email Notification Fixes**: Updated email notification system to work with migrated users

## 🚀 Deployment Steps

### 1. Verify Environment Variables

Ensure these environment variables are properly set:

```bash
# Clerk Production Environment (active)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Clerk Test Environment (for reference)
CLERK_TEST_PUBLISHABLE_KEY=pk_test_...
CLERK_TEST_SECRET_KEY=sk_test_...

# Redis (for user mappings)
UPSTASH_REDIS_REST_URL="https://crack-quagga-62180.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AfLkAAIjcDE1YmI..."

# Email service
RESEND_API_KEY=re_...
ADMIN_EMAIL=lantianlaoli@gmail.com
```

### 2. Files Added/Modified

#### New Files Added:
- `lib/user-adapter.ts` - Main user compatibility adapter
- `scripts/save-user-mapping.js` - Script to save user mappings to Redis
- `scripts/test-user-adapter.js` - Test script for user adapter
- `scripts/test-email-integration.js` - Email integration test

#### Modified Files:
- `lib/actions.ts` - Updated to use user adapter instead of direct Clerk calls
- `.env` - Environment variables separated for test/prod

### 3. Deployment Process

1. **Deploy the code changes**:
   ```bash
   git add .
   git commit -m "feat: Add user migration compatibility layer"
   git push
   ```

2. **Verify Redis mappings are active**:
   ```bash
   node scripts/test-user-adapter.js
   ```

3. **Test email integration**:
   ```bash
   node scripts/test-email-integration.js
   ```

## 🔧 How It Works

### User Query Flow

```
1. Application needs user info for email notification
   ↓
2. getUserInfo(userId) called
   ↓
3. Try Clerk Production Environment first
   ├─ Success → Return user info from production
   └─ User not found → Check Redis mapping
      ├─ Found in Redis → Return email from mapping
      └─ Not found → Return null
```

### Migration Scenarios

1. **Successfully migrated users**: 
   - Found in production Clerk environment
   - Full user info available (name, email, etc.)

2. **Failed migration users**:
   - Not found in production environment
   - Email retrieved from Redis mapping
   - Limited info available (only email)

3. **New production users**:
   - Found in production Clerk environment
   - Full user info available

## 📊 Monitoring

### Redis Health Check

The system includes monitoring functions:

```javascript
import { checkRedisMappingHealth } from './lib/user-adapter';

const health = await checkRedisMappingHealth();
console.log(`Redis mappings: ${health.totalMappings} users`);
```

### User Lookup Logging

The user adapter includes detailed logging:

```
[UserAdapter] Getting user info for ID: user_xxx
[UserAdapter] Found user in production environment: user_xxx
# OR
[UserAdapter] User not found in production, checking Redis mapping: user_xxx
[UserAdapter] Found email mapping in Redis: user_xxx -> email@example.com
```

## ⏰ Expiration and Cleanup

### Redis Mapping Expiration

- **Current expiration**: 30 days from when mappings were created
- **Auto-cleanup**: Redis will automatically delete expired keys
- **Extension**: If needed, re-run the mapping script to extend expiration

### Extending Mappings

If the 30-day period needs extension:

```bash
node scripts/save-user-mapping.js
```

This will refresh all mappings with a new 30-day expiration.

## 🧪 Testing

### Manual Testing Scenarios

1. **Test migrated user notification**:
   - Create/update a note for a successfully migrated user
   - Verify email is sent to correct address

2. **Test failed migration user notification**:
   - Create/update a note for a user that failed migration
   - Verify email is sent using Redis mapping

3. **Test new production user**:
   - Sign up new user in production
   - Verify all functionality works normally

### Integration Tests

Run the provided test scripts:

```bash
# Test user adapter functionality
node scripts/test-user-adapter.js

# Test email integration
node scripts/test-email-integration.js
```

## 📈 Migration Statistics

Current migration status:

- **Total test users**: 21
- **Successfully migrated**: 4 users (19%)
- **Redis mappings created**: 21 users
- **Redis expiration**: 30 days
- **Migration date**: 2025-08-15

Successfully migrated users:
- `aknurseidazym@gmail.com`
- `marvel551478@gmail.com`
- `vivekgautamofficial@gmail.com`
- `corentin.probusiness@gmail.com`

## 🚨 Troubleshooting

### Common Issues

1. **User not found error**:
   - Check Redis connection: `node scripts/test-user-adapter.js`
   - Verify user ID exists in mappings
   - Check Redis key expiration

2. **Email not sent**:
   - Check logs for `[UserAdapter]` messages
   - Verify Redis mapping exists
   - Check email service configuration

3. **Redis connection failed**:
   - Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - Test connection independently

### Debugging Commands

```bash
# Check specific user mapping
redis-cli -u $UPSTASH_REDIS_REST_URL get "test_user_email:user_xxx"

# List all user mappings
redis-cli -u $UPSTASH_REDIS_REST_URL keys "test_user_email:*"

# Check migration info
redis-cli -u $UPSTASH_REDIS_REST_URL get "user_migration_info"
```

## 🎯 Success Criteria

The deployment is successful when:

- ✅ All tests pass
- ✅ Email notifications work for both migrated and non-migrated users
- ✅ Redis mappings are accessible
- ✅ No errors in production logs related to user queries
- ✅ Failed migration users still receive email notifications

## 📞 Support

If issues arise:

1. Check the logs for `[UserAdapter]` messages
2. Run the test scripts to diagnose issues
3. Verify environment variables are correct
4. Check Redis connectivity and data

The system is designed to be fault-tolerant - if Redis fails, users will still get notifications, just potentially with less information (fallback email addresses).