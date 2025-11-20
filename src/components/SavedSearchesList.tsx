"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedSearch {
  id: number;
  name: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  radius: string | null;
  numPeople: number | null;
  numStars: number | null;
  minPrice: string | null;
  maxPrice: string | null;
  isActive: boolean;
}

interface SavedSearchesListProps {
  onBack: () => void;
  onAddNew: () => void;
  onEditSearch: (search: SavedSearch) => void;
}

export default function SavedSearchesList({
  onBack,
  onAddNew,
  onEditSearch,
}: SavedSearchesListProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/saved-searches");
      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data);
      } else {
        setError("Failed to load saved searches");
      }
    } catch (err) {
      console.error("Failed to load saved searches:", err);
      setError("Failed to load saved searches");
    } finally {
      setLoading(false);
    }
  };

  const toggleSearchActive = async (id: number, currentState: boolean) => {
    try {
      const response = await fetch("/api/saved-searches", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          isActive: !currentState,
        }),
      });

      if (response.ok) {
        const updatedSearch = await response.json();
        setSavedSearches(
          savedSearches.map((s) => (s.id === id ? updatedSearch : s))
        );
        setSuccessMessage(
          `Notifications ${!currentState ? "enabled" : "disabled"} for "${
            updatedSearch.name
          }"`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to update search");
      }
    } catch (err) {
      console.error("Failed to toggle search:", err);
      setError("Failed to update search");
    }
  };

  const deleteSearch = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/saved-searches?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedSearches(savedSearches.filter((s) => s.id !== id));
        setSuccessMessage("Search deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to delete search");
      }
    } catch (err) {
      console.error("Failed to delete search:", err);
      setError("Failed to delete search");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Saved Searches</h1>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Saved Searches Container */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {loading ? (
            <p className="text-gray-500 text-center py-8">
              Loading saved searches...
            </p>
          ) : savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No saved searches yet
              </p>
              <p className="text-gray-400 text-sm">
                Create your first search to get email notifications when
                matching apartments are available!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="p-6 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Search Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-2">
                        {search.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {search.location && (
                          <span className="flex items-center gap-1">
                            📍 {search.location}
                          </span>
                        )}
                        {search.minPrice && search.maxPrice && (
                          <span className="flex items-center gap-1">
                            💰 ${search.minPrice} - ${search.maxPrice}
                          </span>
                        )}
                        {search.numStars && (
                          <span className="flex items-center gap-1">
                            ⭐ {search.numStars}+ stars
                          </span>
                        )}
                        {search.numPeople && (
                          <span className="flex items-center gap-1">
                            👥 {search.numPeople} people
                          </span>
                        )}
                        {search.radius && (
                          <span className="flex items-center gap-1">
                            📍 {search.radius} radius
                          </span>
                        )}
                      </div>
                      {search.startDate && search.endDate && (
                        <div className="text-sm text-gray-500 mt-2">
                          📅 {new Date(search.startDate).toLocaleDateString()} -{" "}
                          {new Date(search.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Actions and Toggle */}
                    <div className="flex items-center gap-3">
                      {/* Toggle Switch */}
                      <button
                        onClick={() =>
                          toggleSearchActive(search.id, search.isActive)
                        }
                        className={cn(
                          "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          search.isActive ? "bg-green-500" : "bg-gray-300"
                        )}
                        role="switch"
                        aria-checked={search.isActive}
                        aria-label="Toggle email notifications"
                        title={
                          search.isActive
                            ? "Notifications ON"
                            : "Notifications OFF"
                        }
                      >
                        <span
                          className={cn(
                            "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ease-in-out",
                            search.isActive ? "translate-x-7" : "translate-x-1"
                          )}
                        />
                      </button>

                      {/* Edit Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => onEditSearch(search)}
                        title="Edit search"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 text-gray-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteSearch(search.id, search.name)}
                        title="Delete search"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Button */}
          <div className="mt-6 pt-6 border-t">
            <Button
              onClick={onAddNew}
              className="w-full h-14 text-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="h-6 w-6" />
              Add New Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
