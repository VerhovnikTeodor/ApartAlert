import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apartmentId } = await request.json();

    if (!apartmentId) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, parseInt(userId)),
          eq(favorites.apartmentId, apartmentId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Already favorited" }, { status: 400 });
    }

    // Add to favorites
    const [favorite] = await db
      .insert(favorites)
      .values({
        userId: parseInt(userId),
        apartmentId,
      })
      .returning();

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get("apartmentId");

    if (!apartmentId) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 }
      );
    }

    // Remove from favorites
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, parseInt(userId)),
          eq(favorites.apartmentId, parseInt(apartmentId))
        )
      );

    return NextResponse.json(
      { message: "Removed from favorites" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's favorites with apartment details
    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, parseInt(userId)));

    return NextResponse.json(userFavorites, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}
