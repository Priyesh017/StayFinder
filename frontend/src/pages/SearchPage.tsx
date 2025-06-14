"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { PropertyGrid } from "../components/PropertyGrid";
import { propertiesAPI } from "../services/api";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  host: string;
  type: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
}

const SearchPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Get search params from URL
  const searchParams = new URLSearchParams(location.search);
  const initialLocation = searchParams.get("location") || "";
  const initialCheckIn = searchParams.get("checkIn") || "";
  const initialCheckOut = searchParams.get("checkOut") || "";
  const initialGuests = searchParams.get("guests") || "";

  useEffect(() => {
    // Perform initial search if there are URL parameters
    if (initialLocation || initialCheckIn || initialCheckOut || initialGuests) {
      handleSearch({
        location: initialLocation,
        checkIn: initialCheckIn,
        checkOut: initialCheckOut,
        guests: initialGuests,
      });
    } else {
      // Load all properties if no search params
      fetchAllProperties();
    }
  }, []);

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const data = await propertiesAPI.getAll();
      setProperties(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch properties"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchParams: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertiesAPI.search(searchParams);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Properties
          </h1>
          <SearchBar onSearch={handleSearch} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {properties.length}{" "}
            {properties.length === 1 ? "property" : "properties"} found
          </h2>

          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-300 h-4 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <PropertyGrid properties={properties} />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria to find more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
