"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { propertiesAPI } from "../services/api";
import { PropertyGallery } from "../components/PropertyGallery";
import { PropertyDetails } from "../components/PropertyDetails";
import { BookingCard } from "../components/BookingCard";
import { HostInfo } from "../components/HostInfo";
import { ReviewsSection } from "../components/ReviewsSection";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  host: {
    name: string;
    avatar?: string;
    joinedDate: string;
    verified: boolean;
    responseRate: number;
    responseTime: string;
  };
  type: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  rules: string[];
  checkInTime?: string;
  checkOutTime?: string;
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await propertiesAPI.getById(id);
        setProperty(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch property"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Property not found
          </h2>
          <p className="text-gray-600">
            {error || "The property you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
        <p className="text-gray-600">{property.location}</p>
      </div>

      <PropertyGallery images={property.images} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <PropertyDetails property={property} />
          <HostInfo host={property.host} />
          <ReviewsSection
            propertyId={property.id}
            rating={property.rating}
            reviewCount={property.reviews}
          />
        </div>

        <div className="lg:col-span-1">
          <BookingCard property={property} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
