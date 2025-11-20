#!/bin/bash

echo "🧪 Testing Email Notification System"
echo "===================================="
echo ""

# Check if .env has email configuration
echo "1️⃣ Checking environment variables..."
if grep -q "SMTP_USER=your-email@gmail.com" .env; then
    echo "⚠️  WARNING: Please update SMTP credentials in .env file"
    echo "   Current: SMTP_USER=your-email@gmail.com"
    echo "   Update with your actual Gmail and App Password"
    echo ""
else
    echo "✅ SMTP configuration looks good"
fi

echo "2️⃣ Checking database migration..."
if [ -f "drizzle/0004_sparkling_gambit.sql" ]; then
    echo "✅ Notifications migration file exists"
else
    echo "❌ Migration file not found. Run: pnpm db:generate"
    exit 1
fi

echo ""
echo "3️⃣ Testing notification endpoint..."
echo "   Triggering manual check..."

# Test the endpoint
response=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/cron/check-notifications 2>/dev/null)
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo "✅ Notification endpoint is working!"
    echo "   Response: $body"
else
    echo "⚠️  Could not reach notification endpoint"
    echo "   Make sure the dev server is running (pnpm dev)"
fi

echo ""
echo "📋 Testing Instructions:"
echo "========================"
echo ""
echo "Option 1: Test via Admin Panel"
echo "  1. Start server: pnpm dev"
echo "  2. Login as admin (admin@example.com / password)"
echo "  3. Click 'Add Apartment' button"
echo "  4. Fill form and submit"
echo "  5. Check email inbox"
echo ""
echo "Option 2: Test via API"
echo "  curl http://localhost:3000/api/cron/check-notifications"
echo ""
echo "Option 3: Test via Cron Job"
echo "  node scripts/notification-cron.js"
echo ""
echo "✅ Setup complete! See NOTIFICATIONS.md for detailed docs."
