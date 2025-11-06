import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apartments, favorites } from "@/db/schema";
import { and, or, gte, lte, ilike, eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const userId = request.headers.get("x-user-id");

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(apartments.title, `%${search}%`),
          ilike(apartments.description, `%${search}%`)
        )
      );
    }

    if (location) {
      conditions.push(ilike(apartments.location, `%${location}%`));
    }

    if (minPrice) {
      conditions.push(gte(apartments.price, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(apartments.price, maxPrice));
    }

    if (bedrooms) {
      conditions.push(eq(apartments.bedrooms, parseInt(bedrooms)));
    }

    // Only show available apartments
    conditions.push(eq(apartments.available, true));

    // Fetch apartments
    const apartmentsList = await db
      .select()
      .from(apartments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(apartments.createdAt);

    // If user is authenticated, get their favorites
    let favoriteIds: number[] = [];
    if (userId) {
      const userFavorites = await db
        .select()
        .from(favorites)
        .where(eq(favorites.userId, parseInt(userId)));
      favoriteIds = userFavorites.map((fav) => fav.apartmentId);
    }

    // Add isFavorite flag to each apartment
    const apartmentsWithFavorites = apartmentsList.map((apt) => ({
      ...apt,
      isFavorite: favoriteIds.includes(apt.id),
    }));

    return NextResponse.json(apartmentsWithFavorites, { status: 200 });
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return NextResponse.json(
      { error: "Failed to fetch apartments" },
      { status: 500 }
    );
  }
}
