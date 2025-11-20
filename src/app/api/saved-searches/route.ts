import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSearches } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Validation helper functions
function validateDates(startDate?: string, endDate?: string): string | null {
  if (!startDate || !endDate) {
    return null; // Dates are optional
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid date format";
  }

  if (start >= end) {
    return "Start date must be before end date";
  }

  return null;
}

function validatePrices(minPrice?: string, maxPrice?: string): string | null {
  if (!minPrice && !maxPrice) {
    return null; // Prices are optional
  }

  const min = minPrice ? parseFloat(minPrice) : 0;
  const max = maxPrice ? parseFloat(maxPrice) : Infinity;

  if (isNaN(min) || isNaN(max)) {
    return "Invalid price format";
  }

  if (min < 0 || max < 0) {
    return "Prices must be positive";
  }

  if (minPrice && maxPrice && min > max) {
    return "Minimum price must be less than or equal to maximum price";
  }

  return null;
}

// GET - Fetch all saved searches for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searches = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, parseInt(userId)))
      .orderBy(savedSearches.createdAt);

    return NextResponse.json(searches);
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved searches" },
      { status: 500 }
    );
  }
}

// POST - Create a new saved search
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      location,
      startDate,
      endDate,
      radius,
      numPeople,
      numStars,
      minPrice,
      maxPrice,
      isActive = true,
    } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Search name is required" },
        { status: 400 }
      );
    }

    const dateError = validateDates(startDate, endDate);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const priceError = validatePrices(minPrice, maxPrice);
    if (priceError) {
      return NextResponse.json({ error: priceError }, { status: 400 });
    }

    // Create the saved search
    const [newSearch] = await db
      .insert(savedSearches)
      .values({
        userId: parseInt(userId),
        name: name.trim(),
        location: location || null,
        startDate: startDate || null,
        endDate: endDate || null,
        radius: radius || null,
        numPeople: numPeople || null,
        numStars: numStars || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        isActive,
      })
      .returning();

    return NextResponse.json(newSearch, { status: 201 });
  } catch (error) {
    console.error("Error creating saved search:", error);
    return NextResponse.json(
      { error: "Failed to create saved search" },
      { status: 500 }
    );
  }
}

// PUT - Update a saved search
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      location,
      startDate,
      endDate,
      radius,
      numPeople,
      numStars,
      minPrice,
      maxPrice,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Search ID is required" },
        { status: 400 }
      );
    }

    // Validation
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Search name cannot be empty" },
        { status: 400 }
      );
    }

    const dateError = validateDates(startDate, endDate);
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const priceError = validatePrices(minPrice, maxPrice);
    if (priceError) {
      return NextResponse.json({ error: priceError }, { status: 400 });
    }

    // Update the saved search (only if it belongs to the user)
    const [updatedSearch] = await db
      .update(savedSearches)
      .set({
        ...(name !== undefined && { name: name.trim() }),
        ...(location !== undefined && { location }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(radius !== undefined && { radius }),
        ...(numPeople !== undefined && { numPeople }),
        ...(numStars !== undefined && { numStars }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(savedSearches.id, id),
          eq(savedSearches.userId, parseInt(userId))
        )
      )
      .returning();

    if (!updatedSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSearch);
  } catch (error) {
    console.error("Error updating saved search:", error);
    return NextResponse.json(
      { error: "Failed to update saved search" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a saved search
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Search ID is required" },
        { status: 400 }
      );
    }

    // Delete the saved search (only if it belongs to the user)
    const [deletedSearch] = await db
      .delete(savedSearches)
      .where(
        and(
          eq(savedSearches.id, parseInt(id)),
          eq(savedSearches.userId, parseInt(userId))
        )
      )
      .returning();

    if (!deletedSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting saved search:", error);
    return NextResponse.json(
      { error: "Failed to delete saved search" },
      { status: 500 }
    );
  }
}
