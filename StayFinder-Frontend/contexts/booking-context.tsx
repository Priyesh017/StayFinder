"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Booking {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage: string
  hostName: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
}

interface BookingContextType {
  bookings: Booking[]
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => void
  cancelBooking: (bookingId: string) => void
  getBookingsByUser: () => Booking[]
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const storedBookings = localStorage.getItem("stayfinder_bookings")
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings))
    }
  }, [])

  const addBooking = (bookingData: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const updatedBookings = [...bookings, newBooking]
    setBookings(updatedBookings)
    localStorage.setItem("stayfinder_bookings", JSON.stringify(updatedBookings))
  }

  const cancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: "cancelled" as const } : booking,
    )
    setBookings(updatedBookings)
    localStorage.setItem("stayfinder_bookings", JSON.stringify(updatedBookings))
  }

  const getBookingsByUser = () => {
    return bookings
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        cancelBooking,
        getBookingsByUser,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
