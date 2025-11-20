"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface ApartmentHorizontalCardProps {
  apartment: {
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
  };
  onToggleFavorite: (apartmentId: number, isFavorite: boolean) => void;
  onClick: () => void;
}

export default function ApartmentHorizontalCard({
  apartment,
  onToggleFavorite,
  onClick,
}: ApartmentHorizontalCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-32 h-32 shrink-0 bg-gray-200 rounded-lg overflow-hidden">
          <img
            src={apartment.imageUrl}
            alt={apartment.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(apartment.id, apartment.isFavorite);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-full ${
              apartment.isFavorite
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600"
            } hover:scale-110 transition-transform`}
            aria-label={
              apartment.isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <Heart
              className={`h-4 w-4 ${
                apartment.isFavorite ? "fill-current" : ""
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {apartment.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {apartment.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-base font-bold whitespace-nowrap"
            >
              {apartment.price}$/night
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span className="font-medium">{apartment.rating}/5 stars</span>
            <span>{apartment.area}m²</span>
          </div>
        </div>
      </div>
    </div>
  );
}
