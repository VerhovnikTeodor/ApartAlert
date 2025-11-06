"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bed, Bath, Maximize } from "lucide-react";

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
  isFavorite: boolean;
}

interface ApartmentCardProps {
  apartment: Apartment;
  onToggleFavorite: (apartmentId: number, isFavorite: boolean) => void;
}

export default function ApartmentCard({
  apartment,
  onToggleFavorite,
}: ApartmentCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <img
            src={apartment.imageUrl}
            alt={apartment.title}
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => onToggleFavorite(apartment.id, apartment.isFavorite)}
            className={`absolute top-2 right-2 p-2 rounded-full ${
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
              className={`h-5 w-5 ${
                apartment.isFavorite ? "fill-current" : ""
              }`}
            />
          </button>
        </div>

        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{apartment.title}</CardTitle>
              <CardDescription className="mt-1">
                {apartment.location}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg font-bold">
              ${apartment.price}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {apartment.description}
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{apartment.bedrooms}</span>
              <span>Bed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{apartment.bathrooms}</span>
              <span>Bath</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{apartment.area}</span>
              <span>m²</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setOpen(true)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{apartment.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-base">
              <MapPin className="h-4 w-4" />
              {apartment.location}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-200">
              <img
                src={apartment.imageUrl}
                alt={apartment.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Price and Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Monthly Rent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${apartment.price}
                </p>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-semibold">{apartment.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold">{apartment.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="font-semibold">{apartment.area} m²</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {apartment.description}
              </p>
            </div>

            {/* Availability Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Availability</h3>
              <Badge
                variant={apartment.available ? "default" : "destructive"}
                className="text-sm"
              >
                {apartment.available ? "Available Now" : "Not Available"}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                onClick={() => {
                  onToggleFavorite(apartment.id, apartment.isFavorite);
                  setOpen(false);
                }}
                variant={apartment.isFavorite ? "outline" : "default"}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    apartment.isFavorite ? "fill-current" : ""
                  }`}
                />
                {apartment.isFavorite
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
    </>
  );
}
