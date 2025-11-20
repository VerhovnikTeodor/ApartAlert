"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save } from "lucide-react";

interface FiltersState {
  location: string;
  date: string;
  radius: string;
  numPeople: string;
  numStars: number;
  maxPrice: number;
}

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

interface FiltersPanelProps {
  onApplyFilters: (filters: FiltersState) => void;
  onBack: () => void;
  initialFilters?: Partial<FiltersState>;
  editingSearch?: SavedSearch | null;
}

export default function FiltersPanel({
  onApplyFilters,
  onBack,
  initialFilters,
  editingSearch,
}: FiltersPanelProps) {
  const [location, setLocation] = useState(
    editingSearch?.location || initialFilters?.location || ""
  );
  const [date, setDate] = useState(
    editingSearch?.startDate || initialFilters?.date || ""
  );
  const [endDate, setEndDate] = useState(editingSearch?.endDate || "");
  const [radius, setRadius] = useState(
    editingSearch?.radius || initialFilters?.radius || ""
  );
  const [numPeople, setNumPeople] = useState(
    editingSearch?.numPeople?.toString() || initialFilters?.numPeople || "2"
  );
  const [numStars, setNumStars] = useState(
    editingSearch?.numStars || initialFilters?.numStars || 1
  );
  const [maxPrice, setMaxPrice] = useState([
    editingSearch?.maxPrice
      ? parseFloat(editingSearch.maxPrice)
      : initialFilters?.maxPrice || 5000,
  ]);
  const [minPrice, setMinPrice] = useState([
    editingSearch?.minPrice ? parseFloat(editingSearch.minPrice) : 0,
  ]);

  // Save search states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState(editingSearch?.name || "");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleApply = () => {
    onApplyFilters({
      location,
      date,
      radius,
      numPeople,
      numStars,
      maxPrice: maxPrice[0],
    });
  };

  const handleClear = () => {
    setLocation("");
    setDate("");
    setEndDate("");
    setRadius("");
    setNumPeople("2");
    setNumStars(1);
    setMaxPrice([5000]);
    setMinPrice([0]);
    setError("");
    setSuccessMessage("");
  };

  const validateInputs = () => {
    // Validate dates
    if (date && endDate) {
      const start = new Date(date);
      const end = new Date(endDate);
      if (start >= end) {
        setError("Start date must be before end date");
        return false;
      }
    }

    // Validate prices
    if (minPrice[0] > maxPrice[0]) {
      setError("Minimum price must be less than or equal to maximum price");
      return false;
    }

    return true;
  };

  const handleSaveSearch = async () => {
    setError("");
    setSuccessMessage("");

    if (!searchName.trim()) {
      setError("Search name is required");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    try {
      const isEditing = editingSearch !== null && editingSearch !== undefined;
      const method = isEditing ? "PUT" : "POST";
      const payload = {
        ...(isEditing && { id: editingSearch.id }),
        name: searchName,
        location: location || null,
        startDate: date || null,
        endDate: endDate || null,
        radius: radius || null,
        numPeople: numPeople ? parseInt(numPeople) : null,
        numStars: numStars,
        minPrice: minPrice[0].toString(),
        maxPrice: maxPrice[0].toString(),
      };

      const response = await fetch("/api/saved-searches", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(
          data.error || `Failed to ${isEditing ? "update" : "save"} search`
        );
        return;
      }

      setSuccessMessage(
        `Search ${
          isEditing ? "updated" : "saved"
        } successfully! Returning to saved searches...`
      );
      setShowSaveDialog(false);
      setSearchName("");
      setTimeout(() => {
        setSuccessMessage("");
        onBack(); // Return to saved searches list
      }, 1500);
    } catch (err) {
      setError(`Failed to ${editingSearch ? "update" : "save"} search`);
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
          <h1 className="text-3xl font-bold">
            {editingSearch ? "Edit Search" : "Add New Search"}
          </h1>
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

        {/* Filters Container */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-lg">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Maribor, Slovenia"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-base h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-lg">
                Start Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError("");
                }}
                className="text-base h-12"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-lg">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError("");
                }}
                className="text-base h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Radius */}
            <div className="space-y-2">
              <Label htmlFor="radius" className="text-lg">
                Radius
              </Label>
              <Input
                id="radius"
                type="text"
                placeholder="5km"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="text-base h-12"
              />
            </div>

            {/* Num. of People */}
            <div className="space-y-2">
              <Label htmlFor="numPeople" className="text-lg">
                Num. of People
              </Label>
              <Input
                id="numPeople"
                type="number"
                min="1"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="text-base h-12"
              />
            </div>
          </div>

          {/* Num. of Stars */}
          <div className="space-y-2">
            <Label htmlFor="numStars" className="text-lg">
              Num. of Stars
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="numStars"
                type="number"
                min="1"
                max="5"
                value={numStars}
                onChange={(e) => setNumStars(Number(e.target.value))}
                className="text-base h-12 w-20"
              />
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setNumStars(Math.min(5, numStars + 1))}
                >
                  ▲
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setNumStars(Math.max(1, numStars - 1))}
                >
                  ▼
                </Button>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-lg">Price Range</Label>

            {/* Min Price Slider */}
            <div className="px-2">
              <Label className="text-sm text-gray-600">Min price</Label>
              <Slider
                value={minPrice}
                onValueChange={(val) => {
                  setMinPrice(val);
                  setError("");
                }}
                min={0}
                max={7000}
                step={100}
                className="w-full mt-2"
              />
              <div className="flex justify-between mt-1 text-sm text-gray-600">
                <span>0$</span>
                <span className="font-semibold text-base">{minPrice[0]}$</span>
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="px-2">
              <Label className="text-sm text-gray-600">Max price</Label>
              <Slider
                value={maxPrice}
                onValueChange={(val) => {
                  setMaxPrice(val);
                  setError("");
                }}
                min={0}
                max={7000}
                step={100}
                className="w-full mt-2"
              />
              <div className="flex justify-between mt-1 text-sm text-gray-600">
                <span>0$</span>
                <span className="font-semibold text-base">{maxPrice[0]}$</span>
                <span>7000$</span>
              </div>
            </div>
          </div>

          {/* Search Name Field - Always visible when editing */}
          {editingSearch && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="searchName" className="text-lg">
                Search Name
              </Label>
              <Input
                id="searchName"
                type="text"
                placeholder="e.g., Weekend in Maribor"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setError("");
                }}
                className="text-base h-12"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1 h-12 text-base"
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (validateInputs()) {
                  if (editingSearch) {
                    handleSaveSearch();
                  } else {
                    setShowSaveDialog(!showSaveDialog);
                  }
                }
              }}
              className="flex-1 h-12 text-base bg-blue-500 hover:bg-blue-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingSearch ? "Update Search" : "Save Search"}
            </Button>
          </div>

          {/* Save Search Dialog - Only for new searches */}
          {!editingSearch && showSaveDialog && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Save this search</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchName">Search Name</Label>
                  <Input
                    id="searchName"
                    type="text"
                    placeholder="e.g., Weekend in Maribor"
                    value={searchName}
                    onChange={(e) => {
                      setSearchName(e.target.value);
                      setError("");
                    }}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSearchName("");
                      setError("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveSearch}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
