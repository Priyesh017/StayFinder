"use client";

import type React from "react";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

interface SearchBarProps {
  onSearch: (searchParams: any) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by location, property name..."
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={searchParams.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg flex items-center"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Property Type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchParams.propertyType}
                onChange={(e) =>
                  handleInputChange("propertyType", e.target.value)
                }
              >
                <option value="">Any type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="condo">Condo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Min Price
              </label>
              <input
                type="number"
                placeholder="$0"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchParams.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="$1000"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchParams.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Check-in</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchParams.checkIn}
                onChange={(e) => handleInputChange("checkIn", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Check-out
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchParams.checkOut}
                onChange={(e) => handleInputChange("checkOut", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Guests</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchParams.guests}
                onChange={(e) => handleInputChange("guests", e.target.value)}
              >
                <option value="">Any number</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="4">4 Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
