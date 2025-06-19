import axios from "@/lib/axios"; // assume axios is pre-configured
import type { User } from "@/types/user";

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  isHost?: boolean;
}

export const registerUser = async (data: RegisterInput) => {
  const res = await axios.post("/auth/register", data);
  return res.data.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await axios.post("/auth/login", data);
  return res.data.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await axios.get("/auth/me");
  return res.data.data;
};

export const updateProfile = async (data: Partial<User>) => {
  const res = await axios.put("/auth/profile", data);
  return res.data.data;
};
