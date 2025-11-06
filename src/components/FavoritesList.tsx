"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ApartmentCard from "@/components/ApartmentCard";
import { TokenPayload } from "@/lib/auth";
import { ArrowLeft, Heart } from "lucide-react";

interface Apartment {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string;
  available: boolean;
}

interface FavoriteItem {
  id: number;
  apartmentId: number;
  createdAt: Date;
  apartment: Apartment;
}

interface FavoritesListProps {
  user: TokenPayload;
  initialFavorites: FavoriteItem[];
}

export default function FavoritesList({
  user,
  initialFavorites,
}: FavoritesListProps) {
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleToggleFavorite = async (apartmentId: number) => {
    try {
      // Remove from favorites
      await fetch(`/api/favorites?apartmentId=${apartmentId}`, {
        method: "DELETE",
      });

      // Update local state
      setFavorites(favorites.filter((fav) => fav.apartmentId !== apartmentId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Favorites
                </h1>
                <p className="text-sm text-gray-600">Welcome, {user.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {favorites.length} Favorite{favorites.length !== 1 ? "s" : ""}
          </h2>
          <p className="text-gray-600 mt-1">
            Your saved apartments for easy access
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding apartments to your favorites to see them here
            </p>
            <Link href="/">
              <Button>Browse Apartments</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <ApartmentCard
                key={favorite.apartment.id}
                apartment={{
                  ...favorite.apartment,
                  isFavorite: true,
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
