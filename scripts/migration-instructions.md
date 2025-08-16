# Clerk User Migration Instructions

## Overview
This script migrates users from Clerk test environment to production environment.

## Files Created
- `scripts/migrate-users.js` - Main migration script
- `scripts/test-migration-config.js` - Configuration test script
- `scripts/run-migration.sh` - Wrapper script for easy execution
- `scripts/migration-instructions.md` - This instruction file

## Before Running Migration

### 1. Verify Configuration
```bash
node scripts/test-migration-config.js
```

### 2. Environment Variables Required
- `CLERK_TEST_SECRET_KEY` - Test environment secret key
- `CLERK_SECRET_KEY` - Production environment secret key

### 3. Input File
- `clerk_test_users.csv` - Contains test user data (already present)

## Running the Migration

### Option 1: Using the wrapper script
```bash
./scripts/run-migration.sh
```

### Option 2: Direct execution
```bash
node scripts/migrate-users.js
```

## What the Migration Does

1. **Reads CSV Data**: Parses `clerk_test_users.csv` file
2. **Checks Existing Users**: Verifies if users already exist in production (by email)
3. **Creates New Users**: Creates users that don't exist in production
4. **Handles Duplicates**: Skips users that already exist
5. **Error Handling**: Continues processing even if individual users fail
6. **Generates Report**: Creates `migration-results.json` with detailed results

## Post-Migration

### Results File
After migration, check `migration-results.json` for:
- Total users processed
- Successfully migrated users
- Skipped users (duplicates)
- Failed migrations with error details

### User Data Mapping
From CSV to Production:
- `first_name` → first_name
- `last_name` → last_name
- `primary_email_address` → email_address
- `primary_phone_number` → phone_number
- `username` → username (if present)

## Important Notes

1. **No Passwords**: Users will need to set up new passwords in production
2. **Email Verification**: Email addresses are not automatically verified
3. **Rate Limiting**: Script includes small delays to avoid API rate limits
4. **Idempotent**: Safe to run multiple times - skips existing users
5. **Logging**: Detailed console output shows progress

## Troubleshooting

### Common Issues
1. **API Connection Failed**: Check internet connection and API keys
2. **Duplicate Emails**: Users with same email will be skipped
3. **Missing Data**: Users without email addresses will be skipped
4. **Rate Limiting**: Script will continue but may take longer

### Manual Verification
After migration, verify in Clerk Dashboard:
1. Go to production Clerk dashboard
2. Check Users section
3. Verify user count matches expected numbers

## Rollback
There's no automatic rollback. If needed:
1. Manually delete users from production dashboard
2. Or use Clerk's bulk user management APIs