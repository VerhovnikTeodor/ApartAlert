"use client";

import { useEffect, useState } from "react";
import { TokenPayload } from "@/lib/auth";
import FiltersPanel from "@/components/FiltersPanel";
import ResultsView from "@/components/ResultsView";

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

interface ApartmentsListProps {
  user: TokenPayload;
}

interface FiltersState {
  location: string;
  date: string;
  radius: string;
  numPeople: string;
  numStars: number;
  maxPrice: number;
}

export default function ApartmentsList({ user }: ApartmentsListProps) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    location: "",
    date: "",
    radius: "",
    numPeople: "2",
    numStars: 1,
    maxPrice: 5000,
  });

  const fetchApartments = async (currentFilters: FiltersState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.location)
        params.append("location", currentFilters.location);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice.toString());

      const response = await fetch(`/api/apartments?${params.toString()}`);
      const data = await response.json();
      setApartments(data);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments(filters);
  }, []);

  const handleApplyFilters = (newFilters: FiltersState) => {
    setFilters(newFilters);
    fetchApartments(newFilters);
    setShowFilters(false);
  };

  const handleToggleFavorite = async (
    apartmentId: number,
    isFavorite: boolean
  ) => {
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?apartmentId=${apartmentId}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apartmentId }),
        });
      }
      fetchApartments(filters);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (showFilters) {
    return (
      <FiltersPanel
        onApplyFilters={handleApplyFilters}
        onBack={() => setShowFilters(false)}
        initialFilters={filters}
      />
    );
  }

  return (
    <ResultsView
      user={user}
      apartments={apartments}
      onToggleFavorite={handleToggleFavorite}
      onShowFilters={() => setShowFilters(true)}
      filterLocation={filters.location}
    />
  );
}
