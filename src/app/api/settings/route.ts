import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth";

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        notificationFrequency: users.notificationFrequency,
        lastDigestSent: users.lastDigestSent,
      })
      .from(users)
      .where(eq(users.id, parseInt(userId)));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, currentPassword, newPassword, notificationFrequency } = body;

    // Get current user
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)));

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate email change
    if (email && email !== currentUser.email) {
      // Check if email is already taken
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Validate password change
    let hashedNewPassword;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      // Verify current password
      const isValid = await verifyPassword(
        currentPassword,
        currentUser.password
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      hashedNewPassword = await hashPassword(newPassword);
    }

    // Validate notification frequency
    if (
      notificationFrequency &&
      !["immediate", "daily", "weekly"].includes(notificationFrequency)
    ) {
      return NextResponse.json(
        { error: "Invalid notification frequency" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (email && email !== currentUser.email) {
      updateData.email = email;
    }

    if (hashedNewPassword) {
      updateData.password = hashedNewPassword;
    }

    if (
      notificationFrequency &&
      notificationFrequency !== currentUser.notificationFrequency
    ) {
      updateData.notificationFrequency = notificationFrequency;
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(userId)))
      .returning({
        id: users.id,
        email: users.email,
        notificationFrequency: users.notificationFrequency,
      });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
