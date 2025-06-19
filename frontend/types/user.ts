// types/user.ts
export interface User {
  id: string;
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isHost: boolean;
  isVerified: boolean;
  joinDate: string;
  _count: {
    listings: number;
    bookings: number;
  };
}
