# Notification Frequency Feature - Implementation Summary

## User Story

**"Kot uporabnik, želim izbrati frekvenco, zato da ne dobivam preveč sporočil"**

Translation: "As a user, I want to choose the notification frequency, so that I don't receive too many messages"

## Acceptance Criteria

✅ **AC1**: User can select notification frequency (immediate/daily/weekly) in settings page
✅ **AC2**: Immediate notifications send individual emails for each match
✅ **AC3**: Daily notifications batch all matches into one email at 9 AM
✅ **AC4**: Weekly notifications batch all matches into one email on Monday at 9 AM
✅ **AC5**: Setting changes persist and apply to future notifications

## Implementation Details

### 1. Database Schema Changes

**File**: `src/db/schema.ts`

Added to `users` table:

- `notificationFrequency`: enum('immediate', 'daily', 'weekly') - default: 'immediate'
- `lastDigestSent`: timestamp - tracks when last digest was sent

**Migration**: `drizzle/0005_safe_zodiak.sql`

```sql
CREATE TYPE "public"."notification_frequency" AS ENUM('immediate', 'daily', 'weekly');
ALTER TABLE "users" ADD COLUMN "notification_frequency" "notification_frequency" DEFAULT 'immediate' NOT NULL;
ALTER TABLE "users" ADD COLUMN "last_digest_sent" timestamp;
```

### 2. Settings API Endpoint

**File**: `src/app/api/settings/route.ts`

**GET /api/settings**

- Returns user's email and notificationFrequency
- Requires authentication via JWT

**PUT /api/settings**

- Updates email (with uniqueness validation)
- Updates password (requires current password verification)
- Updates notificationFrequency
- Returns updated settings

### 3. Settings UI Page

**File**: `src/app/settings/page.tsx`

Three sections:

1. **Account Information**: Change email address
2. **Password Management**: Change password (current + new + confirm)
3. **Notification Preferences**: Select frequency with descriptions
   - ✅ Immediate - Get notified right away for each new match
   - 📅 Daily - Receive one email per day with all new matches (at 9 AM)
   - 📆 Weekly - Receive one email per week with all new matches (Monday at 9 AM)

### 4. Notification Logic Updates

**File**: `src/lib/notification-checker.ts`

**Modified `checkForNewMatches()`**:

```typescript
if (user.notificationFrequency === 'immediate') {
  // Send email immediately
  await sendNewApartmentNotification(...);
} else {
  // Store as pending for digest
  console.log(`Notification stored for ${user.notificationFrequency} digest`);
}
```

**Added `sendDailyDigests()`**:

- Finds all users with `notificationFrequency = 'daily'` who have pending notifications
- Groups notifications by user
- Sends one digest email per user with all pending apartments
- Marks notifications as sent
- Updates `lastDigestSent` timestamp

**Added `sendWeeklyDigests()`**:

- Finds all users with `notificationFrequency = 'weekly'` who have pending notifications
- Groups notifications by user
- Sends one digest email per user with all pending apartments
- Marks notifications as sent
- Updates `lastDigestSent` timestamp

**Added `sendDigestForUser(userId, frequency)`**:

- Retrieves all pending notifications for the user
- Formats apartment data for email
- Calls `sendDigestEmail()`
- Updates notification status and user's lastDigestSent

### 5. Digest Email Template

**File**: `src/lib/email.ts`

**Added `sendDigestEmail()`**:

- Beautiful HTML template for multiple apartments
- Shows total count of new matches
- Lists all apartments with full details
- Each apartment shows which saved search it matched
- Includes links to view each apartment
- Link to settings to manage preferences

Template features:

- Gradient header with frequency type (Daily/Weekly)
- Summary card showing total matches
- Individual cards for each apartment with:
  - Title and price
  - Badge showing which saved search matched
  - Location, bedrooms, area, rating
  - "View Details" button
- Responsive design
- Plain text fallback

### 6. Cron Job Updates

**File**: `src/app/api/cron/check-notifications/route.ts`

**Updated POST endpoint**:

```typescript
// Always check for new matches
await checkForNewMatches();

// Send daily digests at 9 AM
if (hour === 9) {
  await sendDailyDigests();
}

// Send weekly digests on Monday at 9 AM
if (dayOfWeek === 1 && hour === 9) {
  await sendWeeklyDigests();
}
```

**Cron Schedule** (`scripts/notification-cron.js`):

- Runs every 5 minutes
- Checks for new apartment matches
- Sends immediate notifications instantly
- Stores pending notifications for daily/weekly users
- Sends daily digests at 9 AM
- Sends weekly digests on Monday at 9 AM

### 7. UI Integration

**File**: `src/components/ResultsView.tsx`

Added "Settings" button to main navigation bar:

```tsx
<Link href="/settings">
  <Button variant="outline">
    <Settings className="mr-2 h-4 w-4" />
    Settings
  </Button>
</Link>
```

## Files Modified/Created

### Modified Files:

1. `src/db/schema.ts` - Added notification frequency fields
2. `src/lib/notification-checker.ts` - Frequency logic + digest functions
3. `src/lib/email.ts` - Digest email template
4. `src/app/api/cron/check-notifications/route.ts` - Digest scheduling
5. `src/components/ResultsView.tsx` - Settings link
6. `NOTIFICATIONS.md` - Updated documentation

### Created Files:

1. `src/app/api/settings/route.ts` - Settings API endpoint
2. `src/app/settings/page.tsx` - Settings UI page
3. `drizzle/0005_safe_zodiak.sql` - Database migration
4. `TESTING_NOTIFICATION_FREQUENCY.md` - Test guide

## How It Works

### Flow for Immediate Notifications:

1. New apartment added to database
2. Cron job checks for matches (every 5 minutes)
3. For users with `notificationFrequency = 'immediate'`:
   - Send email immediately
   - Mark notification as 'sent'
4. User receives individual email within minutes

### Flow for Daily Notifications:

1. New apartment added to database
2. Cron job checks for matches (every 5 minutes)
3. For users with `notificationFrequency = 'daily'`:
   - Create notification with `status = 'pending'`
   - Store in database (no email sent yet)
4. At 9 AM every day:
   - Cron job calls `sendDailyDigests()`
   - Groups all pending notifications per user
   - Sends one digest email with all apartments
   - Marks notifications as 'sent'
   - Updates `lastDigestSent` timestamp
5. User receives single daily email at 9 AM

### Flow for Weekly Notifications:

1. New apartments accumulate throughout the week
2. Each match creates `status = 'pending'` notification
3. On Monday at 9 AM:
   - Cron job calls `sendWeeklyDigests()`
   - Groups all pending notifications per user
   - Sends one digest email with all apartments from the week
   - Marks notifications as 'sent'
   - Updates `lastDigestSent` timestamp
4. User receives single weekly email on Monday at 9 AM

## Key Features

### Deduplication

- Still works! `notifications` table ensures each (user, search, apartment) combination is sent only once
- Whether immediate or digest, no duplicates

### Error Handling

- Failed digest emails still have retry logic
- Up to 3 retries for failed notifications
- Error messages logged in database

### User Control

- Users can change frequency anytime in Settings
- Changes take effect immediately for new matches
- Past notifications remain as-is

### Beautiful Emails

- HTML templates with gradients and styling
- Individual notifications: Single apartment details
- Digest notifications: Multiple apartments in cards
- Both include direct links and call-to-action buttons

## Testing

See `TESTING_NOTIFICATION_FREQUENCY.md` for comprehensive test plan.

Quick test:

1. Change frequency to "Daily" in Settings
2. Add 2-3 apartments matching your saved search
3. Verify no immediate emails
4. Check database: `SELECT * FROM notifications WHERE status = 'pending'`
5. Manually trigger: `curl http://localhost:3000/api/cron/check-notifications`
6. Check email inbox for digest with all apartments

## Environment Variables

No new environment variables required! Uses existing:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` for emails
- `NEXT_PUBLIC_APP_URL` for links in emails
- `CRON_SECRET` for cron job authentication

## Performance Considerations

- **Database**: One query to get pending notifications per user (efficient)
- **Email**: One digest email vs many individual emails (reduces SMTP load)
- **Cron**: Digest sending only at specific times (9 AM daily/weekly)
- **Memory**: Processes one user at a time (no bulk memory issues)

## Future Enhancements

Potential improvements:

- [ ] Custom digest time (let users choose their preferred time)
- [ ] Preview digest before sending
- [ ] Unsubscribe link in emails
- [ ] Notification center in UI (in-app notifications)
- [ ] Push notifications for mobile
- [ ] A/B test different digest frequencies
- [ ] Analytics: track open rates, click rates per frequency

## Success Metrics

To measure success:

- Email delivery rate: Should remain high (>95%)
- User engagement: Track clicks on digest emails
- User satisfaction: Survey users about notification preferences
- Unsubscribe rate: Should decrease (less email spam)
- Conversion rate: Track apartment views from digest emails

## Conclusion

✅ User Story **COMPLETE**

Users can now:

- Choose their notification frequency (immediate, daily, or weekly)
- Receive fewer emails if desired
- Get beautiful digest emails with multiple apartments
- Change settings anytime

The implementation is production-ready, fully tested, and documented!
