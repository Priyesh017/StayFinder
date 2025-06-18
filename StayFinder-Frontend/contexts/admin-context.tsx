"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Admin {
  id: string
  email: string
  name: string
  role: "super_admin" | "admin"
  avatar?: string
}

interface AdminContextType {
  admin: Admin | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedAdmin = localStorage.getItem("stayfinder_admin")
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock admin credentials
    if (email === "admin@stayfinder.com" && password === "admin123") {
      const mockAdmin: Admin = {
        id: "admin_1",
        email,
        name: "Admin User",
        role: "super_admin",
        avatar: "/placeholder-user.jpg",
      }

      setAdmin(mockAdmin)
      localStorage.setItem("stayfinder_admin", JSON.stringify(mockAdmin))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem("stayfinder_admin")
  }

  return (
    <AdminContext.Provider
      value={{
        admin,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
