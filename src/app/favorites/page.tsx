import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { db } from "@/db";
import { favorites, apartments } from "@/db/schema";
import { eq } from "drizzle-orm";
import FavoritesList from "@/components/FavoritesList";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  // Fetch user's favorites with apartment details (Server-side)
  const userFavorites = await db
    .select({
      id: favorites.id,
      apartmentId: favorites.apartmentId,
      createdAt: favorites.createdAt,
      apartment: {
        id: apartments.id,
        title: apartments.title,
        description: apartments.description,
        price: apartments.price,
        location: apartments.location,
        bedrooms: apartments.bedrooms,
        bathrooms: apartments.bathrooms,
        area: apartments.area,
        imageUrl: apartments.imageUrl,
        available: apartments.available,
      },
    })
    .from(favorites)
    .innerJoin(apartments, eq(favorites.apartmentId, apartments.id))
    .where(eq(favorites.userId, payload.userId));

  return (
    <div className="min-h-screen bg-gray-50">
      <FavoritesList user={payload} initialFavorites={userFavorites} />
    </div>
  );
}
