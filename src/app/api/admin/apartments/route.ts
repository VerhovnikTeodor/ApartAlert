import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apartments } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to generate random rating
function getRandomRating() {
  return Math.floor(Math.random() * 5) + 1;
}

// POST - Create a new apartment (admin only)
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    // Check if user is admin
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      rating,
      imageUrl,
      available = true,
    } = body;

    // Validation
    if (!title || !description || !price || !location) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, description, price, location",
        },
        { status: 400 }
      );
    }

    if (!bedrooms || bedrooms < 0) {
      return NextResponse.json(
        { error: "Bedrooms must be a positive number" },
        { status: 400 }
      );
    }

    if (!bathrooms || bathrooms < 0) {
      return NextResponse.json(
        { error: "Bathrooms must be a positive number" },
        { status: 400 }
      );
    }

    if (!area || area < 0) {
      return NextResponse.json(
        { error: "Area must be a positive number" },
        { status: 400 }
      );
    }

    // Create the apartment
    const [newApartment] = await db
      .insert(apartments)
      .values({
        title,
        description,
        price: price.toString(),
        location,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area: parseInt(area),
        rating: rating || getRandomRating(),
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        available,
      })
      .returning();

    console.log(
      `✅ New apartment created: ${newApartment.title} (ID: ${newApartment.id})`
    );

    return NextResponse.json(
      {
        success: true,
        apartment: newApartment,
        message: "Apartment created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating apartment:", error);
    return NextResponse.json(
      { error: "Failed to create apartment" },
      { status: 500 }
    );
  }
}

// PUT - Update an apartment (admin only)
export async function PUT(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 }
      );
    }

    const [updatedApartment] = await db
      .update(apartments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(apartments.id, id))
      .returning();

    if (!updatedApartment) {
      return NextResponse.json(
        { error: "Apartment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      apartment: updatedApartment,
    });
  } catch (error) {
    console.error("Error updating apartment:", error);
    return NextResponse.json(
      { error: "Failed to update apartment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an apartment (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 }
      );
    }

    const [deletedApartment] = await db
      .delete(apartments)
      .where(eq(apartments.id, parseInt(id)))
      .returning();

    if (!deletedApartment) {
      return NextResponse.json(
        { error: "Apartment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Apartment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting apartment:", error);
    return NextResponse.json(
      { error: "Failed to delete apartment" },
      { status: 500 }
    );
  }
}
