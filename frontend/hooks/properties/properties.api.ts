// src/api/properties.api.ts
import axios from "axios";
import type { Property } from "@/types/property";

export const getProperties = async (params?: Record<string, any>) => {
  const response = await axios.get("/api/properties", { params });
  return response.data;
};

export const getPropertyById = async (id: string) => {
  const response = await axios.get(`/api/properties/${id}`);
  return response.data;
};

export const createProperty = async (
  data: Omit<Property, "id" | "createdAt" | "updatedAt">
) => {
  const response = await axios.post("/api/properties", data);
  return response.data;
};

export const updateProperty = async (id: string, data: Partial<Property>) => {
  const response = await axios.patch(`/api/properties/${id}`, data);
  return response.data;
};

export const deleteProperty = async (id: string) => {
  const response = await axios.delete(`/api/properties/${id}`);
  return response.data;
};
