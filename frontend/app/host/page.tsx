"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Eye, Calendar, DollarSign, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useHost } from "@/contexts/host-context"
import { useProperties } from "@/contexts/properties-context"
import { useBooking } from "@/contexts/booking-context"

export default function HostDashboard() {
  const { host } = useHost()
  const { properties } = useProperties()
  const { bookings } = useBooking()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!host) {
      router.push("/host/login")
    }
  }, [host, router])

  if (!host) {
    return null
  }

  // Filter properties and bookings for this host
  const hostProperties = properties.filter((p) => host.properties.includes(p.id))
  const hostBookings = bookings.filter((b) => hostProperties.some((p) => p.id === b.propertyId))

  const totalEarnings = hostBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
  const totalBookings = hostBookings.length
  const averageRating = hostProperties.reduce((sum, property) => sum + property.rating, 0) / hostProperties.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20">
        {/* Dashboard Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {host.firstName}!</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/host/new-listing">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Listing
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("stayfinder_host")
                    router.push("/host/login")
                  }}
                >
                  Logout
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalBookings}</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">Across all properties</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {hostProperties.filter((l) => l.status === "active").length}
                    </div>
                    <p className="text-xs text-muted-foreground">Out of {hostProperties.length} total</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Your latest reservation requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hostBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/placeholder-user.jpg" />
                              <AvatarFallback>{booking.hostName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{booking.hostName}</p>
                              <p className="text-sm text-gray-600">{booking.propertyTitle}</p>
                              <p className="text-xs text-gray-500">
                                {booking.checkIn} - {booking.checkOut}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                            <span className="font-semibold">${booking.totalPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="listings" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {hostProperties.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="relative">
                        <Image
                          src={listing.images[0] || "/placeholder.svg"}
                          alt={listing.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <Badge
                          variant={listing.status === "active" ? "default" : "secondary"}
                          className="absolute top-2 right-2"
                        >
                          {listing.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{listing.location}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-lg">${listing.price}/night</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{listing.rating}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>Bookings: {hostBookings.filter((b) => b.propertyId === listing.id).length}</div>
                          <div>Reviews: {listing.reviews}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>Manage your property reservations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hostBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder-user.jpg" />
                              <AvatarFallback>{booking.hostName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{booking.hostName}</p>
                              <p className="text-sm text-gray-600">{booking.propertyTitle}</p>
                              <p className="text-xs text-gray-500">
                                Check-in: {booking.checkIn} • Check-out: {booking.checkOut}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">${booking.totalPrice}</p>
                              <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                                {booking.status}
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Your earnings over the past 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Revenue chart would go here
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Trends</CardTitle>
                    <CardDescription>Reservation patterns and occupancy rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Booking trends chart would go here
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
