import { NextRequest, NextResponse } from "next/server";
import {
  checkForNewMatches,
  retryFailedNotifications,
  sendDailyDigests,
  sendWeeklyDigests,
} from "@/lib/notification-checker";

// This endpoint should be protected in production (e.g., with an API key)
export async function POST(request: NextRequest) {
  try {
    // Verify API key in production
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.CRON_SECRET || "dev-secret-key";

    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting notification check job...");

    // Check for new matches (will send immediate notifications and store pending ones)
    await checkForNewMatches();

    // Retry failed notifications
    await retryFailedNotifications();

    // Send daily digests at 9 AM
    const now = new Date();
    const hour = now.getHours();

    if (hour === 9) {
      console.log("⏰ Time for daily digests (9 AM)");
      await sendDailyDigests();
    }

    // Send weekly digests on Monday at 9 AM
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (dayOfWeek === 1 && hour === 9) {
      console.log("⏰ Time for weekly digests (Monday 9 AM)");
      await sendWeeklyDigests();
    }

    return NextResponse.json({
      success: true,
      message: "Notification check completed successfully",
      timestamp: new Date().toISOString(),
      digestsSent: {
        daily: dayOfWeek === 1 && hour === 9,
        weekly: hour === 9,
      },
    });
  } catch (error) {
    console.error("❌ Notification check job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint (for testing)
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Manual trigger not allowed in production" },
        { status: 403 }
      );
    }

    console.log("🧪 Manual notification check triggered...");

    await checkForNewMatches();
    await retryFailedNotifications();

    return NextResponse.json({
      success: true,
      message: "Manual notification check completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Manual notification check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
