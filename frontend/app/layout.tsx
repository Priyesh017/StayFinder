import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AdminProvider } from "@/contexts/admin-context"
import { HostProvider } from "@/contexts/host-context"
import { BookingProvider } from "@/contexts/booking-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { PropertiesProvider } from "@/contexts/properties-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StayFinder - Find Your Perfect Stay",
  description: "Discover unique places to stay around the world",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AdminProvider>
            <HostProvider>
              <PropertiesProvider>
                <BookingProvider>
                  <FavoritesProvider>
                    {children}
                    <Toaster />
                  </FavoritesProvider>
                </BookingProvider>
              </PropertiesProvider>
            </HostProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
