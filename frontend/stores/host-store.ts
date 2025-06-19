import { create } from "zustand";

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

interface HostState {
  host: Host | null;
  token: string | null;
  setHost: (host: Host | null) => void;
  setToken: (token: string | null) => void;
}

export const useHostStore = create<HostState>((set) => ({
  host: null,
  token: null,
  setHost: (host) => set({ host }),
  setToken: (token) => set({ token }),
}));
