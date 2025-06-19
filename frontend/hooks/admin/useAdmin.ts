// src/admin/useAdmin.ts
"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminLogin,
  getAdminUser,
  getDashboardStats,
  getAllUsers,
  getAllListings,
  updateListingStatus,
} from "@/hooks/admin/admin.api";
import type { User } from "@/types/user";
import type { Admin } from "@/types/admin";
import type { Listing } from "@/types/listing";
import type { PaginatedResponse } from "@/types/api";

// ⛳ Admin Login
export const useAdminLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminLogin,
    onSuccess: ({ admin, token }) => {
      localStorage.setItem("stayfinder_admin", JSON.stringify(admin));
      localStorage.setItem("admin_token", token);
      queryClient.setQueryData(["admin", "me"], admin);
      router.push("/admin/dashboard");
    },
  });
};

// ✅ Protected: Get current logged-in admin user from backend
export const useAdminUser = () =>
  useQuery<Admin>({
    queryKey: ["admin", "me"],
    queryFn: getAdminUser, // secured backend call
    staleTime: 5 * 60 * 1000,
  });

// 🚪 Logout Admin
export const useAdminLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    localStorage.removeItem("stayfinder_admin");
    localStorage.removeItem("admin_token");
    queryClient.removeQueries({ queryKey: ["admin"] });
    router.push("/admin/login");
  };
};

// 📊 Protected: Fetch dashboard metrics
export const useDashboardStats = () =>
  useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboardStats,
  });

// 👥 useUsers with typing
export const useUsers = (page = 1, limit = 10) => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: ["admin", "users", page],
    queryFn: () => getAllUsers(page, limit),
    staleTime: 1000 * 60 * 2, // optional: cache for 2 minutes
    gcTime: 1000 * 60 * 5, // optional: garbage collect after 5 mins
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (prevData) => prevData, // ✅ instead of keepPreviousData
  });
};

// 🏘 useListings with typing
export const useListings = (page = 1, limit = 10) => {
  return useQuery<PaginatedResponse<Listing>, Error>({
    queryKey: ["admin", "listings", page],
    queryFn: () => getAllListings(page, limit),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (prevData) => prevData, // ✅ instead of keepPreviousData
  });
};

// ⚙️ Protected: Update listing status (Approved/Rejected)
export const useUpdateListingStatus = () =>
  useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateListingStatus({ id, status }),
  });
