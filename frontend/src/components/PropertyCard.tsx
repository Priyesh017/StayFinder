import type React from "react";
import { Link } from "react-router-dom";
import { Star, Heart, Users, Bed, Bath } from "lucide-react";

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

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link to={`/property/${property.id}`}>
          <img
            src={property.images[0] || "/placeholder.svg?height=300&width=400"}
            alt={property.title}
            className="w-full h-48 object-cover hover:scale-105 transition-transform"
          />
        </Link>
        <button className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full">
          <Heart className="w-4 h-4" />
        </button>
        <span className="absolute top-2 left-2 bg-white text-black px-2 py-1 rounded text-sm font-medium">
          {property.type}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-sm text-gray-500">({property.reviews})</span>
          </div>
          <span className="text-sm text-gray-500">Host: {property.host}</span>
        </div>

        <Link to={`/property/${property.id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-rose-600 transition-colors">
            {property.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-3">{property.location}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{property.guests} guests</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} bath</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold">${property.price}</span>
            <span className="text-gray-500"> / night</span>
          </div>
          <Link
            to={`/property/${property.id}`}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
