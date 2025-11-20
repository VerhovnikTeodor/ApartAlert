/**
 * Notification Cron Job Scheduler
 * 
 * This script runs a cron job that checks for new apartment matches
 * and sends email notifications to users with active saved searches.
 * 
 * Usage:
 * - Development: node scripts/notification-cron.js
 * - Production: Use a proper cron service like:
 *   - Vercel Cron Jobs
 *   - AWS EventBridge
 *   - Google Cloud Scheduler
 *   - Or a simple Linux cron job
 */

const cron = require('node-cron');

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-key';
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Run every 5 minutes: */5 * * * *
// Run every hour: 0 * * * *
// Run every day at 9 AM: 0 9 * * *
const SCHEDULE = '*/5 * * * *'; // Every 5 minutes for testing

console.log('🚀 Starting notification cron job scheduler...');
console.log(`📅 Schedule: ${SCHEDULE}`);
console.log(`🌐 API URL: ${API_URL}`);

cron.schedule(SCHEDULE, async () => {
  console.log(`\n⏰ [${new Date().toISOString()}] Running notification check...`);
  
  try {
    const response = await fetch(`${API_URL}/api/cron/check-notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Notification check completed successfully');
      console.log(data);
    } else {
      console.error('❌ Notification check failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error running notification check:', error.message);
  }
});

console.log('✅ Cron job scheduler started successfully');
console.log('Press Ctrl+C to stop\n');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping cron job scheduler...');
  process.exit(0);
});
