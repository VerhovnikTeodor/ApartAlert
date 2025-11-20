"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ApartmentHorizontalCard from "@/components/ApartmentHorizontalCard";
import { TokenPayload } from "@/lib/auth";
import { ArrowLeft, Heart, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Apartment {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  rating: number;
  imageUrl: string;
  available: boolean;
  isFavorite: boolean;
}

interface ResultsViewProps {
  user: TokenPayload;
  apartments: Apartment[];
  onToggleFavorite: (apartmentId: number, isFavorite: boolean) => void;
  onShowFilters: () => void;
  filterLocation?: string;
}

export default function ResultsView({
  user,
  apartments,
  onToggleFavorite,
  onShowFilters,
  filterLocation,
}: ResultsViewProps) {
  const [priceEnabled, setPriceEnabled] = useState(false);
  const [radiusEnabled, setRadiusEnabled] = useState(false);
  const [ratingEnabled, setRatingEnabled] = useState(false);

  const [priceRange, setPriceRange] = useState([5000]);
  const [radiusSort, setRadiusSort] = useState<"closest" | "farthest">(
    "closest"
  );
  const [minRating, setMinRating] = useState(3);

  const [displayedCount, setDisplayedCount] = useState(10);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // Apply all enabled filters
  let filteredApartments = [...apartments];

  // Filter by price if enabled
  if (priceEnabled) {
    filteredApartments = filteredApartments.filter(
      (apt) => parseFloat(apt.price) <= priceRange[0]
    );
  }

  // Sort by radius if enabled (mock implementation - would need real coordinates)
  if (radiusEnabled) {
    filteredApartments = filteredApartments.sort((a, b) => {
      const comparison = parseFloat(a.price) - parseFloat(b.price);
      return radiusSort === "closest" ? comparison : -comparison;
    });
  }

  // Filter by rating if enabled - show apartments >= minRating
  if (ratingEnabled) {
    filteredApartments = filteredApartments.filter(
      (apt) => apt.rating >= minRating
    );
  }

  // Sort by price if price filter is enabled
  if (priceEnabled) {
    filteredApartments = filteredApartments.sort((a, b) => {
      return parseFloat(a.price) - parseFloat(b.price);
    });
  }

  const displayedApartments = filteredApartments.slice(0, displayedCount);
  const hasMore = displayedCount < filteredApartments.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + 10);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ApartAlert</h1>
                <p className="text-sm text-gray-600">Welcome, {user.email}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/favorites">
                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title and Filter Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Results of filter: {filterLocation || "All locations"}
            </h2>
            <Button onClick={onShowFilters} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-6">
            {/* Sort By Sidebar */}
            <div className="w-64 shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="font-semibold text-lg mb-4">Sort by</h3>

                {/* Price Checkbox */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceEnabled}
                      onChange={(e) => setPriceEnabled(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Price</span>
                  </label>

                  <div className="ml-6 space-y-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={5000}
                      step={100}
                      className="w-full"
                      disabled={!priceEnabled}
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>0$</span>
                      <span className="font-semibold">{priceRange[0]}$</span>
                      <span>5000$</span>
                    </div>
                  </div>
                </div>

                {/* Radius Checkbox */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={radiusEnabled}
                      onChange={(e) => setRadiusEnabled(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Radius</span>
                  </label>

                  <div className="ml-6 space-y-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="radius"
                        checked={radiusSort === "closest"}
                        onChange={() => setRadiusSort("closest")}
                        disabled={!radiusEnabled}
                        className="w-3 h-3"
                      />
                      <span className={!radiusEnabled ? "text-gray-400" : ""}>
                        Closest
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="radius"
                        checked={radiusSort === "farthest"}
                        onChange={() => setRadiusSort("farthest")}
                        disabled={!radiusEnabled}
                        className="w-3 h-3"
                      />
                      <span className={!radiusEnabled ? "text-gray-400" : ""}>
                        Farthest
                      </span>
                    </label>
                  </div>
                </div>

                {/* Rating Checkbox */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ratingEnabled}
                      onChange={(e) => setRatingEnabled(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Rating</span>
                  </label>

                  <div className="ml-6 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setMinRating(star)}
                        disabled={!ratingEnabled}
                        className={`text-2xl transition-transform ${
                          ratingEnabled && star <= minRating
                            ? "text-yellow-400 hover:scale-110"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1">
              <div className="space-y-3">
                {displayedApartments.map((apartment) => (
                  <ApartmentHorizontalCard
                    key={apartment.id}
                    apartment={apartment}
                    onToggleFavorite={onToggleFavorite}
                    onClick={() => setSelectedApartment(apartment)}
                  />
                ))}
              </div>

              {displayedApartments.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-600">
                    No apartments found matching your criteria.
                  </p>
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button onClick={handleLoadMore} size="lg" className="px-8">
                    Load more +
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apartment Detail Dialog */}
      {selectedApartment && (
        <Dialog
          open={!!selectedApartment}
          onOpenChange={() => setSelectedApartment(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedApartment.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {selectedApartment.location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  src={selectedApartment.imageUrl}
                  alt={selectedApartment.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${selectedApartment.price}
                  </p>
                </div>

                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-semibold">
                      {selectedApartment.bedrooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold">
                      {selectedApartment.bathrooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="font-semibold">{selectedApartment.area} m²</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedApartment.description}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onToggleFavorite(
                      selectedApartment.id,
                      selectedApartment.isFavorite
                    );
                    setSelectedApartment(null);
                  }}
                  variant={selectedApartment.isFavorite ? "outline" : "default"}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      selectedApartment.isFavorite ? "fill-current" : ""
                    }`}
                  />
                  {selectedApartment.isFavorite
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </Button>
                <Button className="flex-1" variant="default">
                  Contact Owner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
