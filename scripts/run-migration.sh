#!/bin/bash

# Clerk User Migration Runner Script

echo "🚀 Clerk User Migration Script"
echo "=============================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if required files exist
if [ ! -f "clerk_test_users.csv" ]; then
    echo "❌ clerk_test_users.csv file not found in project root"
    echo "   Please make sure the CSV file is in the project root directory"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "   Please make sure the environment variables are configured"
    exit 1
fi

# Confirm before running
echo "⚠️  WARNING: This will migrate users from TEST to PRODUCTION environment"
echo "   - Test environment users will be recreated in production"
echo "   - Existing production users with same email will be skipped"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "🏃 Running migration..."
echo ""

# Run the migration script
node scripts/migrate-users.js

echo ""
echo "✅ Migration script completed!"
echo "📄 Check migration-results.json for detailed results"