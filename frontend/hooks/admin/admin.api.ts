import axios from "@/lib/axios";
import type { Admin } from "@/types/admin";

export interface AdminLoginInput {
  email: string;
  password: string;
}

export const adminLogin = async (data: AdminLoginInput) => {
  const res = await axios.post("/admin/login", data);
  return res.data.data;
};

export const getAdminUser = async (): Promise<Admin> => {
  const res = await axios.get("/admin/me");
  return res.data.data;
};

export const getDashboardStats = async () => {
  const res = await axios.get("/admin/dashboard");
  return res.data.data;
};

export const getAllUsers = async (page = 1, limit = 10) => {
  const res = await axios.get(`/admin/users?page=${page}&limit=${limit}`);
  return res.data;
};

export const getAllListings = async (page = 1, limit = 10) => {
  const res = await axios.get(`/admin/listings?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateListingStatus = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const res = await axios.patch(`/admin/listings/${id}/status`, { status });
  return res.data.data;
};
