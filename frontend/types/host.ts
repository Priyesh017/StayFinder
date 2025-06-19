export interface Host {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  joinDate: string;
  responseRate: string;
  responseTime: string;
  isSuperhost: boolean;
  totalEarnings: number;
  totalBookings: number;
  properties: string[];
}
