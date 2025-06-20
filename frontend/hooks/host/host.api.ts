import type { Host } from "@/stores/host-store";

export interface RegisterHostData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  isHost: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ltype {
  data: { token: string; user: Host };
}
export async function loginHost(
  email: string,
  password: string
): Promise<ltype> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function registerHost(
  data: RegisterHostData
): Promise<{ token: string; host: Host }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function fetchHost(token: string): Promise<Host> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Invalid or expired token");
  return res.json();
}

export async function updateHostProfile(
  token: string,
  update: Partial<Host>
): Promise<Host> {
  const res = await fetch(`${API_URL}/host/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}
