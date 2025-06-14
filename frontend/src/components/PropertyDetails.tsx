import type React from "react";
import {
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Tv,
  Wind,
  Waves,
  Dumbbell,
  Coffee,
} from "lucide-react";

interface PropertyDetailsProps {
  property: {
    type: string;
    guests: number;
    bedrooms: number;
    bathrooms: number;
    description: string;
    amenities: string[];
    rules: string[];
  };
}

const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  Kitchen: Coffee,
  "Air conditioning": Wind,
  TV: Tv,
  Parking: Car,
  Gym: Dumbbell,
  Pool: Waves,
};

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {property.type}
          </span>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{property.guests} guests</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} bedrooms</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} bathrooms</span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed">{property.description}</p>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {property.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity] || Coffee;
            return (
              <div key={amenity} className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <span>{amenity}</span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="text-xl font-semibold mb-4">House rules</h3>
        <ul className="space-y-2">
          {property.rules.map((rule, index) => (
            <li key={index} className="text-gray-700">
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
