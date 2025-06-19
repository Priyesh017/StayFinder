export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  host: {
    id: string;
    name: string;
    avatar: string;
    joinDate: string;
    isSuperhost: boolean;
    responseRate: string;
    responseTime: string;
  };
  type: string; // e.g., "Entire apartment", "Villa", etc.
  guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[]; // e.g., ["WiFi", "Kitchen", "Pool"]
  highlights: string[]; // e.g., ["Ocean view", "Private pool"]
  category: string; // e.g., "City", "Luxury", "Cabins", "Beachfront"
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
}

export type CreatePropertyPayload = Omit<
  Property,
  "id" | "createdAt" | "updatedAt" | "host"
> & {
  hostId: string;
};

export type UpdatePropertyPayload = Partial<
  Omit<Property, "id" | "createdAt" | "updatedAt" | "host">
>;
