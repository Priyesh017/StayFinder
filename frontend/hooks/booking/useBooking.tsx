"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getUserBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
} from "./booking.api";
import type { Booking } from "@/types/booking";
import type { PaginatedResponse } from "@/types/api";

// ✅ Create Booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "user"] });
    },
  });
};

// 👤 User Bookings
export const useUserBookings = (page = 1, limit = 10) =>
  useQuery<PaginatedResponse<Booking>>({
    queryKey: ["bookings", "user", page],
    queryFn: () => getUserBookings(page, limit),
    placeholderData: (prevData) => prevData, // replaces keepPreviousData
  });

// 🏠 Host Bookings
export const useHostBookings = (page = 1, limit = 10) =>
  useQuery<PaginatedResponse<Booking>>({
    queryKey: ["bookings", "host", page],
    queryFn: () => getHostBookings(page, limit),
    placeholderData: (prevData) => prevData,
  });

// 📄 Get Single Booking
export const useBookingDetails = (id: string) =>
  useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });

// ❌ Cancel Booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "user"] });
    },
  });
};
