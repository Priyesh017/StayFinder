import type { Request } from "express";
import type { User, Admin } from "@prisma/client";

type SafeUser = Omit<User, "password" | "createdAt" | "updatedAt">;

export interface AuthRequest extends Request {
  user?: SafeUser;
  admin?: Admin;
}

export interface SearchFilters {
  location?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  amenities?: string[];
  checkIn?: Date;
  checkOut?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
