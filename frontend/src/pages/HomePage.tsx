"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
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

const HomePage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
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

    fetchProperties();
  }, []);

  const handleSearch = async (searchParams: any) => {
    setLoading(true);
    try {
      const data = await propertiesAPI.search(searchParams);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <SearchBar onSearch={handleSearch} />
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Featured Properties</h2>
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
          ) : (
            <PropertyGrid properties={properties} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
