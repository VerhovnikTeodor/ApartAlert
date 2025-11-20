import { db } from "@/db";
import { savedSearches, apartments, notifications, users } from "@/db/schema";
import { eq, and, gte, lte, isNull, or } from "drizzle-orm";
import { sendNewApartmentNotification } from "./email";

interface MatchResult {
  apartment: any;
  search: any;
  user: any;
}

export async function checkForNewMatches(): Promise<void> {
  console.log("🔍 Checking for new apartment matches...");

  try {
    // Get all active saved searches
    const activeSearches = await db
      .select({
        search: savedSearches,
        user: users,
      })
      .from(savedSearches)
      .innerJoin(users, eq(savedSearches.userId, users.id))
      .where(eq(savedSearches.isActive, true));

    console.log(`📋 Found ${activeSearches.length} active saved searches`);

    // Get all apartments (in production, you'd filter by recent ones)
    const allApartments = await db
      .select()
      .from(apartments)
      .where(eq(apartments.available, true));

    console.log(`🏠 Found ${allApartments.length} available apartments`);

    let matchesFound = 0;
    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const { search, user } of activeSearches) {
      for (const apartment of allApartments) {
        // Check if apartment matches the saved search criteria
        if (await matchesCriteria(apartment, search)) {
          // Check if notification already exists (deduplication)
          const existingNotification = await db
            .select()
            .from(notifications)
            .where(
              and(
                eq(notifications.savedSearchId, search.id),
                eq(notifications.apartmentId, apartment.id),
                or(
                  eq(notifications.status, "sent"),
                  eq(notifications.status, "pending")
                )
              )
            );

          if (existingNotification.length > 0) {
            console.log(
              `⏭️  Skipping notification - already sent/pending for apartment ${apartment.id} and search ${search.id}`
            );
            continue;
          }

          matchesFound++;
          console.log(
            `✨ Match found! Apartment "${apartment.title}" matches search "${search.name}"`
          );

          // Create notification record
          const [notification] = await db
            .insert(notifications)
            .values({
              userId: user.id,
              savedSearchId: search.id,
              apartmentId: apartment.id,
              status: "pending",
            })
            .returning();

          // Send email immediately only if user has "immediate" frequency
          if (user.notificationFrequency === "immediate") {
            const result = await sendNewApartmentNotification({
              userEmail: user.email,
              userName: user.email.split("@")[0],
              searchName: search.name,
              apartment: {
                id: apartment.id,
                title: apartment.title,
                price: apartment.price,
                location: apartment.location,
                bedrooms: apartment.bedrooms,
                area: apartment.area,
                rating: apartment.rating,
              },
            });

            if (result.success) {
              // Update notification status to sent
              await db
                .update(notifications)
                .set({
                  status: "sent",
                  sentAt: new Date(),
                })
                .where(eq(notifications.id, notification.id));

              notificationsSent++;
              console.log(`✅ Notification sent successfully to ${user.email}`);
            } else {
              // Update notification status to failed
              await db
                .update(notifications)
                .set({
                  status: "failed",
                  errorMessage: result.error || "Unknown error",
                  retryCount: notification.retryCount + 1,
                })
                .where(eq(notifications.id, notification.id));

              notificationsFailed++;
              console.error(
                `❌ Failed to send notification to ${user.email}: ${result.error}`
              );
            }
          } else {
            // For daily/weekly, keep status as "pending" for digest sending
            console.log(
              `📋 Notification stored for ${user.notificationFrequency} digest: ${user.email}`
            );
            matchesFound++;
          }
        }
      }
    }

    console.log(`
📊 Notification Check Summary:
   - Matches found: ${matchesFound}
   - Notifications sent: ${notificationsSent}
   - Notifications failed: ${notificationsFailed}
    `);
  } catch (error) {
    console.error("❌ Error checking for matches:", error);
    throw error;
  }
}

async function matchesCriteria(apartment: any, search: any): Promise<boolean> {
  // Location match (case-insensitive partial match)
  if (search.location) {
    const apartmentLocation = apartment.location.toLowerCase();
    const searchLocation = search.location.toLowerCase();
    if (!apartmentLocation.includes(searchLocation)) {
      return false;
    }
  }

  // Price range match
  if (search.minPrice) {
    const minPrice = parseFloat(search.minPrice);
    const apartmentPrice = parseFloat(apartment.price);
    if (apartmentPrice < minPrice) {
      return false;
    }
  }

  if (search.maxPrice) {
    const maxPrice = parseFloat(search.maxPrice);
    const apartmentPrice = parseFloat(apartment.price);
    if (apartmentPrice > maxPrice) {
      return false;
    }
  }

  // Rating match (apartment rating >= search minimum stars)
  if (search.numStars) {
    if (apartment.rating < search.numStars) {
      return false;
    }
  }

  // All criteria matched
  return true;
}

export async function retryFailedNotifications(): Promise<void> {
  console.log("🔄 Retrying failed notifications...");

  try {
    // Get failed notifications that haven't been retried too many times
    const failedNotifications = await db
      .select({
        notification: notifications,
        user: users,
        search: savedSearches,
        apartment: apartments,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.userId, users.id))
      .innerJoin(
        savedSearches,
        eq(notifications.savedSearchId, savedSearches.id)
      )
      .innerJoin(apartments, eq(notifications.apartmentId, apartments.id))
      .where(
        and(
          eq(notifications.status, "failed"),
          lte(notifications.retryCount, 3) // Max 3 retries
        )
      );

    console.log(
      `📧 Found ${failedNotifications.length} failed notifications to retry`
    );

    for (const {
      notification,
      user,
      search,
      apartment,
    } of failedNotifications) {
      const result = await sendNewApartmentNotification({
        userEmail: user.email,
        userName: user.email.split("@")[0],
        searchName: search.name,
        apartment: {
          id: apartment.id,
          title: apartment.title,
          price: apartment.price,
          location: apartment.location,
          bedrooms: apartment.bedrooms,
          area: apartment.area,
          rating: apartment.rating,
        },
      });

      if (result.success) {
        await db
          .update(notifications)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(notifications.id, notification.id));

        console.log(`✅ Retry successful for notification ${notification.id}`);
      } else {
        await db
          .update(notifications)
          .set({
            retryCount: notification.retryCount + 1,
            errorMessage: result.error || "Unknown error",
          })
          .where(eq(notifications.id, notification.id));

        console.error(`❌ Retry failed for notification ${notification.id}`);
      }
    }
  } catch (error) {
    console.error("❌ Error retrying failed notifications:", error);
  }
}

export async function sendDailyDigests(): Promise<void> {
  console.log("📧 Sending daily digests...");

  try {
    // Get all users with daily frequency who have pending notifications
    const usersWithPending = await db
      .selectDistinct({ userId: notifications.userId })
      .from(notifications)
      .innerJoin(users, eq(notifications.userId, users.id))
      .where(
        and(
          eq(notifications.status, "pending"),
          eq(users.notificationFrequency, "daily")
        )
      );

    console.log(
      `📊 Found ${usersWithPending.length} users with pending daily notifications`
    );

    for (const { userId } of usersWithPending) {
      await sendDigestForUser(userId, "daily");
    }
  } catch (error) {
    console.error("❌ Error sending daily digests:", error);
  }
}

export async function sendWeeklyDigests(): Promise<void> {
  console.log("📧 Sending weekly digests...");

  try {
    // Get all users with weekly frequency who have pending notifications
    const usersWithPending = await db
      .selectDistinct({ userId: notifications.userId })
      .from(notifications)
      .innerJoin(users, eq(notifications.userId, users.id))
      .where(
        and(
          eq(notifications.status, "pending"),
          eq(users.notificationFrequency, "weekly")
        )
      );

    console.log(
      `📊 Found ${usersWithPending.length} users with pending weekly notifications`
    );

    for (const { userId } of usersWithPending) {
      await sendDigestForUser(userId, "weekly");
    }
  } catch (error) {
    console.error("❌ Error sending weekly digests:", error);
  }
}

async function sendDigestForUser(
  userId: number,
  frequency: "daily" | "weekly"
): Promise<void> {
  try {
    // Get user info
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      console.error(`❌ User ${userId} not found`);
      return;
    }

    // Get all pending notifications for this user with apartment and search details
    const pendingNotifications = await db
      .select({
        notification: notifications,
        apartment: apartments,
        search: savedSearches,
      })
      .from(notifications)
      .innerJoin(apartments, eq(notifications.apartmentId, apartments.id))
      .innerJoin(
        savedSearches,
        eq(notifications.savedSearchId, savedSearches.id)
      )
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, "pending")
        )
      );

    if (pendingNotifications.length === 0) {
      console.log(`ℹ️ No pending notifications for user ${user.email}`);
      return;
    }

    // Prepare apartment data for digest email
    const apartmentsData = pendingNotifications.map(
      ({ apartment, search }) => ({
        id: apartment.id,
        title: apartment.title,
        price: apartment.price,
        location: apartment.location,
        bedrooms: apartment.bedrooms,
        area: apartment.area,
        rating: apartment.rating,
        searchName: search.name,
      })
    );

    // Send digest email
    const { sendDigestEmail } = await import("./email");
    const result = await sendDigestEmail({
      userEmail: user.email,
      userName: user.email.split("@")[0],
      frequency,
      apartments: apartmentsData,
    });

    if (result.success) {
      // Mark all notifications as sent
      const notificationIds = pendingNotifications.map(
        ({ notification }) => notification.id
      );

      for (const notificationId of notificationIds) {
        await db
          .update(notifications)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(notifications.id, notificationId));
      }

      // Update last digest sent timestamp
      await db
        .update(users)
        .set({ lastDigestSent: new Date() })
        .where(eq(users.id, userId));

      console.log(
        `✅ ${frequency} digest sent to ${user.email} with ${apartmentsData.length} apartments`
      );
    } else {
      // Mark notifications as failed
      const notificationIds = pendingNotifications.map(
        ({ notification }) => notification.id
      );

      for (const notificationId of notificationIds) {
        await db
          .update(notifications)
          .set({
            status: "failed",
            errorMessage: result.error || "Failed to send digest",
          })
          .where(eq(notifications.id, notificationId));
      }

      console.error(
        `❌ Failed to send ${frequency} digest to ${user.email}: ${result.error}`
      );
    }
  } catch (error) {
    console.error(`❌ Error sending digest for user ${userId}:`, error);
  }
}
