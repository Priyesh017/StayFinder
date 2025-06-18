"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Host {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  isVerified: boolean
  joinDate: string
  responseRate: string
  responseTime: string
  isSuperhost: boolean
  totalEarnings: number
  totalBookings: number
  properties: string[]
}

interface HostContextType {
  host: Host | null
  login: (email: string, password: string) => Promise<boolean>
  register: (hostData: RegisterHostData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<Host>) => void
  isLoading: boolean
}

interface RegisterHostData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}

const HostContext = createContext<HostContextType | undefined>(undefined)

export function HostProvider({ children }: { children: React.ReactNode }) {
  const [host, setHost] = useState<Host | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedHost = localStorage.getItem("stayfinder_host")
    if (storedHost) {
      setHost(JSON.parse(storedHost))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock host data
    const mockHost: Host = {
      id: "host_1",
      email,
      firstName: "Sarah",
      lastName: "Johnson",
      avatar: "/placeholder-user.jpg",
      phone: "+1234567890",
      isVerified: true,
      joinDate: "2019",
      responseRate: "100%",
      responseTime: "within an hour",
      isSuperhost: true,
      totalEarnings: 15000,
      totalBookings: 125,
      properties: ["1", "2"],
    }

    setHost(mockHost)
    localStorage.setItem("stayfinder_host", JSON.stringify(mockHost))
    setIsLoading(false)
    return true
  }

  const register = async (hostData: RegisterHostData): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newHost: Host = {
      id: Date.now().toString(),
      email: hostData.email,
      firstName: hostData.firstName,
      lastName: hostData.lastName,
      phone: hostData.phone,
      isVerified: false,
      joinDate: new Date().getFullYear().toString(),
      responseRate: "0%",
      responseTime: "N/A",
      isSuperhost: false,
      totalEarnings: 0,
      totalBookings: 0,
      properties: [],
    }

    setHost(newHost)
    localStorage.setItem("stayfinder_host", JSON.stringify(newHost))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setHost(null)
    localStorage.removeItem("stayfinder_host")
  }

  const updateProfile = (data: Partial<Host>) => {
    if (host) {
      const updatedHost = { ...host, ...data }
      setHost(updatedHost)
      localStorage.setItem("stayfinder_host", JSON.stringify(updatedHost))
    }
  }

  return (
    <HostContext.Provider
      value={{
        host,
        login,
        register,
        logout,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </HostContext.Provider>
  )
}

export function useHost() {
  const context = useContext(HostContext)
  if (context === undefined) {
    throw new Error("useHost must be used within a HostProvider")
  }
  return context
}
