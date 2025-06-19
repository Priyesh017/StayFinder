export interface Booking {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  listing: {
    id: string;
    title: string;
    location: string;
    images: string[];
    host: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}
