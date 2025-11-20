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
import { ArrowLeft } from "lucide-react";

interface FiltersState {
  location: string;
  date: string;
  radius: string;
  numPeople: string;
  numStars: number;
  maxPrice: number;
}

interface FiltersPanelProps {
  onApplyFilters: (filters: FiltersState) => void;
  onBack: () => void;
  initialFilters?: Partial<FiltersState>;
}

export default function FiltersPanel({
  onApplyFilters,
  onBack,
  initialFilters,
}: FiltersPanelProps) {
  const [location, setLocation] = useState(initialFilters?.location || "");
  const [date, setDate] = useState(initialFilters?.date || "");
  const [radius, setRadius] = useState(initialFilters?.radius || "");
  const [numPeople, setNumPeople] = useState(initialFilters?.numPeople || "2");
  const [numStars, setNumStars] = useState(initialFilters?.numStars || 1);
  const [maxPrice, setMaxPrice] = useState([initialFilters?.maxPrice || 5000]);

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
    setRadius("");
    setNumPeople("2");
    setNumStars(1);
    setMaxPrice([5000]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Filters</h1>
        </div>

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
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-lg">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-base h-12"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-6">
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
          </div>

          {/* Max Price Slider */}
          <div className="space-y-4">
            <Label className="text-lg">Max price</Label>
            <div className="px-2">
              <Slider
                value={maxPrice}
                onValueChange={setMaxPrice}
                min={0}
                max={7000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>0$</span>
                <span className="font-semibold text-base">{maxPrice[0]}$</span>
                <span>7000$</span>
              </div>
            </div>
          </div>

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
              onClick={handleApply}
              className="flex-1 h-12 text-base bg-blue-500 hover:bg-blue-600"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
