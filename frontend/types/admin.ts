export interface Admin {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "super_admin" | "admin";
}
