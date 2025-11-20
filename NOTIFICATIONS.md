# Email Notification System

This document describes the email notification system for ApartAlert.

## Features

✅ **Automatic Matching**: System checks for new apartments matching user's saved searches
✅ **Email Notifications**: Users receive beautiful HTML emails when matches are found
✅ **Notification Frequency**: Users can choose between immediate, daily, or weekly notifications
✅ **Digest Emails**: Daily/weekly users receive a single email with all new matches
✅ **Deduplication**: Each apartment is sent only once per saved search (stored in `notifications` table)
✅ **Error Handling**: Failed emails are logged and can be retried (max 3 retries)
✅ **Admin Panel**: Admins can add new apartments to trigger notifications
✅ **User Settings**: Users can manage email, password, and notification preferences

## Database Schema

### `notifications` Table

```sql
- id: serial (primary key)
- user_id: integer (references users)
- saved_search_id: integer (references saved_searches)
- apartment_id: integer (references apartments)
- status: enum ('pending', 'sent', 'failed')
- error_message: text (for failed notifications)
- sent_at: timestamp
- created_at: timestamp
- retry_count: integer (default 0, max 3)
```

### `users` Table Updates

```sql
- notification_frequency: enum ('immediate', 'daily', 'weekly') - default: 'immediate'
- last_digest_sent: timestamp - tracks when last digest was sent
```

## Notification Frequencies

### Immediate (Default)

- Each new apartment match sends an individual email immediately
- Best for users who want real-time updates
- Recommended for highly competitive rental markets

### Daily

- New matches are stored as "pending"
- One digest email sent every day at 9 AM
- Contains all new matches found since last digest
- Reduces email clutter while keeping users updated

### Weekly

- New matches are stored as "pending"
- One digest email sent every Monday at 9 AM
- Contains all new matches found in the past week
- Best for casual apartment hunters

## Setup Instructions

### 1. Configure Email (SMTP)

Add to `.env`:

```bash
# For Gmail (recommended for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password, not regular password!

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-secret-key-here
```

**Gmail Setup:**

1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use that password in `SMTP_PASSWORD`

### 2. Run Database Migration

```bash
pnpm db:generate
pnpm db:migrate
```

### 3. Start the Application

```bash
pnpm dev
```

## How to Test

### Method 1: Manual Trigger (Recommended for Testing)

Simply visit or curl the GET endpoint:

```bash
# In browser or terminal
curl http://localhost:3000/api/cron/check-notifications
```

This will:

1. Check all active saved searches
2. Match them against available apartments
3. Send emails for new matches
4. Return a summary of notifications sent

### Method 2: Add New Apartment (Admin)

1. Login as admin (`admin@example.com` / `password`)
2. Click "Add Apartment" button (visible only to admins)
3. Fill in apartment details:
   - Title: "Test Apartment Maribor"
   - Price: 850
   - Location: "Maribor"
   - Bedrooms: 2
   - Bathrooms: 1
   - Area: 65
   - Rating: 4 (or leave empty for random)
4. Click "Create Apartment"
5. System automatically triggers notification check
6. Check your email inbox!

### Method 3: Cron Job (Production)

Start the cron scheduler:

```bash
node scripts/notification-cron.js
```

This runs every 5 minutes (configurable in the script).

## API Endpoints

### POST `/api/cron/check-notifications`

Triggers the notification check job. Requires `Authorization: Bearer <CRON_SECRET>` header.

**Response:**

```json
{
  "success": true,
  "message": "Notification check completed successfully",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

### GET `/api/cron/check-notifications`

Manual trigger for development only. No authentication required in dev mode.

### POST `/api/admin/apartments`

Create a new apartment (admin only). Automatically triggers notification check.

**Request:**

```json
{
  "title": "Modern 2BR Apartment",
  "description": "Beautiful apartment in city center...",
  "price": 850,
  "location": "Maribor, Slovenia",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 65,
  "rating": 4
}
```

## Matching Logic

An apartment matches a saved search if:

- **Location**: Apartment location contains search location (case-insensitive)
- **Price Range**: Apartment price is between minPrice and maxPrice
- **Rating**: Apartment rating >= search minimum stars

## Managing Notification Preferences

Users can change their notification frequency in the Settings page:

1. **Access Settings**: Click "Settings" in the top navigation bar
2. **Notification Preferences Section**:
   - Select from "Immediate", "Daily", or "Weekly"
   - See explanation of each option
3. **Save Changes**: Click "Save Settings"

Changes take effect immediately for new matches.

### Settings Page Features

- **Account Information**: Update email address
- **Password Management**: Change password (requires current password)
- **Notification Preferences**: Choose frequency (immediate/daily/weekly)

### API Endpoints

- `GET /api/settings` - Get current user settings
- `PUT /api/settings` - Update email, password, or notification frequency

## Email Templates

### Individual Notification Email (Immediate)

Sent for each new apartment match:

- 🏠 Apartment title
- 💰 Price per month
- 📍 Location
- 🛏️ Number of bedrooms
- 📐 Area in m²
- ⭐ Rating (visual stars)
- 🔗 Direct link to apartment
- � Which saved search matched

### Digest Email (Daily/Weekly)

Sent once per day/week with multiple apartments:

- 📊 Total number of new matches
- 📋 List of all matched apartments with details
- 🔍 Which saved search matched each apartment
- 🔗 Direct links to all apartments
- ⚙️ Link to manage notification preferences

## Troubleshooting

### Emails not sending?

1. **Check SMTP credentials**: Make sure you're using an App Password for Gmail
2. **Check logs**: Look for error messages in console
3. **Verify email config**: Run in terminal:
   ```bash
   curl http://localhost:3000/api/cron/check-notifications
   ```
4. **Check notifications table**:
   ```sql
   SELECT * FROM notifications WHERE status = 'failed';
   ```

### How to resend failed notifications?

Failed notifications with retry_count < 3 are automatically retried when the cron job runs.

Or manually trigger retry:

```bash
curl http://localhost:3000/api/cron/check-notifications
```

## Production Deployment

For production, use a proper cron service instead of the Node.js script:

### Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-notifications",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Linux Cron

```bash
# Run every hour
0 * * * * curl -X POST -H "Authorization: Bearer YOUR_SECRET" https://your-domain.com/api/cron/check-notifications
```

## Security Notes

- ⚠️ Never commit `.env` file with real credentials
- ⚠️ Use strong `CRON_SECRET` in production
- ⚠️ In production, the GET endpoint should be disabled (returns 403)
- ⚠️ Use environment-specific SMTP credentials
