# Testing Notification Frequency Feature

This guide will help you test the notification frequency feature (User Story: "Kot uporabnik, želim izbrati frekvenco, zato da ne dobivam preveč sporočil").

## Feature Overview

Users can now choose how often they receive apartment notifications:

- **Immediate**: Send individual email for each new match (real-time)
- **Daily**: Send one digest email per day at 9 AM with all new matches
- **Weekly**: Send one digest email per week (Monday at 9 AM) with all new matches

## Prerequisites

1. Database is running (PostgreSQL via Docker)
2. Email SMTP is configured in `.env` (Gmail App Password)
3. Latest migration applied (includes `notification_frequency` enum)
4. Application is running (`pnpm dev`)

## Test Plan

### Test 1: Change Notification Frequency

**Objective**: Verify users can change their notification preferences

**Steps**:

1. Login to the application
2. Click "Settings" in the top navigation bar
3. Scroll to "Notification Preferences" section
4. You should see three options:
   - ✅ Immediate (default)
   - 📅 Daily
   - 📆 Weekly
5. Select "Daily" from the dropdown
6. Click "Save Settings"
7. Verify success message appears
8. Refresh the page and verify "Daily" is still selected

**Expected Result**:

- Setting changes successfully
- Selection persists after page refresh
- No errors in console

---

### Test 2: Immediate Notifications (Default Behavior)

**Objective**: Verify immediate notifications work as before

**Setup**:

1. Make sure your user has notification frequency set to "Immediate"
2. Create a saved search (e.g., location: "Maribor", min price: 500, max price: 1000)

**Steps**:

1. Login as admin (`admin@example.com` / `password`)
2. Click "Add Apartment" button
3. Create apartment matching your saved search:
   ```
   Title: Test Immediate Notification
   Price: 750
   Location: Maribor
   Bedrooms: 2
   Bathrooms: 1
   Area: 60
   Rating: 4
   ```
4. Click "Create Apartment"
5. Check your email inbox immediately

**Expected Result**:

- You receive an email within seconds
- Email subject: "🏠 New Apartment Match: Test Immediate Notification"
- Email contains apartment details and link
- Database: `notifications` table has entry with `status = 'sent'`

---

### Test 3: Daily Digest Notifications

**Objective**: Verify daily notifications are batched and sent at scheduled time

**Setup**:

1. Change your notification frequency to "Daily" in Settings
2. Make sure you have at least one active saved search

**Steps**:

1. Add 2-3 new apartments matching your search (as admin)
2. Verify emails are NOT sent immediately
3. Check database:
   ```sql
   SELECT * FROM notifications WHERE user_id = YOUR_USER_ID ORDER BY created_at DESC;
   ```
4. Verify notifications have `status = 'pending'`
5. Manually trigger digest:
   ```bash
   curl http://localhost:3000/api/cron/check-notifications
   ```
6. Check your email inbox

**Expected Result**:

- Apartments are stored as pending (not sent immediately)
- When digest is triggered at 9 AM (or manually), one email is sent
- Email subject: "🏠 Your Daily Apartment Digest - X New Matches"
- Email contains all pending apartments in a single digest
- Database: All notifications updated to `status = 'sent'`
- User's `last_digest_sent` timestamp is updated

---

### Test 4: Weekly Digest Notifications

**Objective**: Verify weekly notifications are batched and sent on Monday

**Setup**:

1. Change your notification frequency to "Weekly" in Settings
2. Make sure you have at least one active saved search

**Steps**:

1. Add 3-5 new apartments matching your search over several days
2. Verify emails are NOT sent immediately
3. Check database to confirm `status = 'pending'`
4. Wait until Monday at 9 AM, or manually simulate:
   - Temporarily modify cron logic to always send weekly digests
   - Or trigger via API at the right time
5. Check your email inbox

**Expected Result**:

- Apartments accumulate as pending throughout the week
- On Monday at 9 AM, one email is sent with all pending matches
- Email subject: "🏠 Your Weekly Apartment Digest - X New Matches"
- Email contains all apartments from the week
- Database: All notifications marked as sent

---

### Test 5: Mixed Users (Immediate + Daily + Weekly)

**Objective**: Verify different users with different frequencies work correctly

**Setup**:

1. Create 3 test users with different email addresses
2. Set each user to different frequency:
   - User A: Immediate
   - User B: Daily
   - User C: Weekly
3. Each user creates a saved search for "Ljubljana"

**Steps**:

1. Add new apartment in Ljubljana (as admin)
2. Trigger notification check (automatically or manually)
3. Check each user's email

**Expected Result**:

- User A receives email immediately
- User B does NOT receive email (stored as pending for daily digest)
- User C does NOT receive email (stored as pending for weekly digest)
- Database shows different statuses:
  - User A: `status = 'sent'`
  - User B: `status = 'pending'`
  - User C: `status = 'pending'`

---

### Test 6: No Duplicate Notifications

**Objective**: Verify same apartment is never sent twice to the same user

**Setup**:

1. User has notification frequency set to "Immediate"
2. User has one saved search

**Steps**:

1. Add apartment matching the search
2. Verify email is sent
3. Trigger notification check multiple times
4. Check email inbox

**Expected Result**:

- First check: Email sent
- Subsequent checks: No additional emails
- Database: Only one notification record per (user_id, saved_search_id, apartment_id) combination

---

### Test 7: Failed Notification Retry

**Objective**: Verify failed emails are retried

**Setup**:

1. Temporarily break SMTP config (wrong password)
2. Add matching apartment

**Steps**:

1. Trigger notification check
2. Check console logs for error
3. Check database: `status = 'failed'`, `retry_count = 1`
4. Fix SMTP config
5. Trigger notification check again
6. Check email inbox

**Expected Result**:

- First attempt fails, notification marked as failed
- Retry attempt succeeds, notification marked as sent
- Email arrives in inbox
- Max 3 retries before giving up

---

## Database Queries for Verification

### Check User's Notification Frequency

```sql
SELECT id, email, notification_frequency, last_digest_sent
FROM users
WHERE email = 'your-email@example.com';
```

### Check Pending Notifications

```sql
SELECT n.id, n.status, n.created_at, u.email, ss.name as search_name, a.title as apartment_title
FROM notifications n
JOIN users u ON n.user_id = u.id
JOIN saved_searches ss ON n.saved_search_id = ss.id
JOIN apartments a ON n.apartment_id = a.id
WHERE n.status = 'pending'
ORDER BY n.created_at DESC;
```

### Check Sent Notifications

```sql
SELECT n.id, n.status, n.sent_at, u.email, u.notification_frequency, a.title
FROM notifications n
JOIN users u ON n.user_id = u.id
JOIN apartments a ON n.apartment_id = a.id
WHERE n.status = 'sent'
ORDER BY n.sent_at DESC
LIMIT 10;
```

### Count Notifications by Status

```sql
SELECT status, COUNT(*)
FROM notifications
GROUP BY status;
```

---

## Cron Job Testing

### Manual Trigger (Development)

```bash
# Trigger full notification check (includes digest sending if it's the right time)
curl http://localhost:3000/api/cron/check-notifications

# Or in browser
http://localhost:3000/api/cron/check-notifications
```

### Simulate 9 AM for Daily Digests

Option 1: Change system time temporarily (requires sudo)

```bash
sudo date -s "09:00:00"
curl http://localhost:3000/api/cron/check-notifications
sudo ntpdate -s time.nist.gov  # Reset to actual time
```

Option 2: Modify the cron endpoint temporarily:

```typescript
// In route.ts, change condition from:
if (hour === 9) {
  await sendDailyDigests();
}

// To:
if (true) {
  // Always send for testing
  await sendDailyDigests();
}
```

---

## Production Cron Setup

The cron job runs every 5 minutes via `scripts/notification-cron.js`:

```bash
# Start cron job
node scripts/notification-cron.js
```

Schedule:

- **Every 5 minutes**: Check for new matches
  - Immediate users: Send emails right away
  - Daily/Weekly users: Store as pending
- **Daily at 9 AM**: Send daily digests
- **Monday at 9 AM**: Send weekly digests

---

## Success Criteria

✅ Users can change notification frequency in Settings
✅ Immediate notifications send emails instantly
✅ Daily notifications batch into one 9 AM email
✅ Weekly notifications batch into one Monday 9 AM email
✅ No duplicate emails for the same apartment
✅ Failed emails retry up to 3 times
✅ Digest emails contain multiple apartments in beautiful HTML
✅ Settings page shows current frequency selection
✅ Database stores notification_frequency per user

---

## Troubleshooting

### Digests not sending at scheduled time?

1. Check cron job is running: `ps aux | grep notification-cron`
2. Check server timezone: `date` (should match expected time)
3. Check logs for errors
4. Verify pending notifications exist: `SELECT * FROM notifications WHERE status = 'pending'`

### User not receiving digest?

1. Verify user has pending notifications
2. Check user's notification_frequency setting
3. Check last_digest_sent timestamp
4. Verify SMTP credentials are correct
5. Check spam folder

### Settings not saving?

1. Check browser console for errors
2. Verify API endpoint `/api/settings` is accessible
3. Check JWT token is valid
4. Verify database connection

---

## Next Steps

After successful testing:

1. ✅ Deploy to production
2. ✅ Set up proper cron service (Vercel Cron, AWS EventBridge, etc.)
3. ✅ Monitor email delivery rates
4. ✅ Add email unsubscribe functionality (future enhancement)
5. ✅ Add notification preview before saving search (future enhancement)
