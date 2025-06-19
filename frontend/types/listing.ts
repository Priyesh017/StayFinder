// types/listing.ts
export interface Listing {
  id: string;
  images: string[];
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  host: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    bookings: number;
    reviews: number;
  };
}
