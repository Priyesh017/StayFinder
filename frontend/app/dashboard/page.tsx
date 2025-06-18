"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Heart, MapPin, Star, CreditCard, User, Bell, MessageCircle, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useBooking } from "@/contexts/booking-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useProperties } from "@/contexts/properties-context"

export default function UserDashboard() {
  const { user, updateProfile } = useAuth()
  const { bookings } = useBooking()
  const { favorites } = useFavorites()
  const { properties } = useProperties()
  const { toast } = useToast()
  const router = useRouter()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedUser, setEditedUser] = useState(user)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      setEditedUser(user)
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && new Date(booking.checkIn) > new Date(),
  )

  const pastBookings = bookings.filter(
    (booking) => booking.status === "completed" || new Date(booking.checkOut) < new Date(),
  )

  const favoriteProperties = properties.filter((property) => favorites.includes(property.id))

  const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)

  const handleSaveProfile = () => {
    if (editedUser) {
      updateProfile(editedUser)
      setIsEditingProfile(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditedUser(user)
    setIsEditingProfile(false)
  }

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
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
                  <p className="text-gray-600 mt-1">Manage your bookings and explore new destinations</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user.isVerified ? (
                      <Badge variant="default" className="text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Unverified
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Member since {user.joinDate}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Notifications</span>
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Messages</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 lg:w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookings.length}</div>
                    <p className="text-xs text-muted-foreground">{upcomingBookings.length} upcoming</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Across all bookings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Favorite Places</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{favorites.length}</div>
                    <p className="text-xs text-muted-foreground">Saved for later</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.joinDate}</div>
                    <p className="text-xs text-muted-foreground">
                      {user.isVerified ? "Verified" : "Unverified"} account
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upcoming Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Trips</CardTitle>
                    <CardDescription>Your confirmed reservations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingBookings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <Image
                                src={booking.propertyImage || "/placeholder.svg"}
                                alt={booking.propertyTitle}
                                width={80}
                                height={60}
                                className="rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold truncate">{booking.propertyTitle}</h4>
                                <p className="text-sm text-gray-600">Host: {booking.hostName}</p>
                                <p className="text-xs text-gray-500">
                                  {booking.checkIn} - {booking.checkOut} • {booking.guests} guests
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <Badge variant="default">Confirmed</Badge>
                                <p className="text-sm font-semibold mt-1">${booking.totalPrice}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming trips</h3>
                        <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
                        <Link href="/search">
                          <Button>Explore destinations</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Favorite Properties */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Favorites</CardTitle>
                    <CardDescription>Properties you've saved</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {favoriteProperties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favoriteProperties.slice(0, 6).map((property) => (
                          <div
                            key={property.id}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <Image
                              src={property.images[0] || "/placeholder.svg"}
                              alt={property.title}
                              width={300}
                              height={200}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-3">
                              <h4 className="font-semibold text-sm mb-1 truncate">{property.title}</h4>
                              <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                                <MapPin className="h-3 w-3" />
                                {property.location}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">${property.price}/night</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{property.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                        <p className="text-gray-600 mb-4">Save properties you love for easy access later</p>
                        <Link href="/search">
                          <Button>Start exploring</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>Your booking history and upcoming trips</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <Image
                                src={booking.propertyImage || "/placeholder.svg"}
                                alt={booking.propertyTitle}
                                width={80}
                                height={60}
                                className="rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold truncate">{booking.propertyTitle}</h4>
                                <p className="text-sm text-gray-600">Host: {booking.hostName}</p>
                                <p className="text-xs text-gray-500">
                                  {booking.checkIn} - {booking.checkOut} • {booking.guests} guests
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <Badge
                                  variant={
                                    booking.status === "confirmed"
                                      ? "default"
                                      : booking.status === "pending"
                                        ? "secondary"
                                        : booking.status === "cancelled"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {booking.status}
                                </Badge>
                                <p className="text-sm font-semibold mt-1">${booking.totalPrice}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-600 mb-4">Book your first stay to get started</p>
                        <Link href="/search">
                          <Button>Find a place to stay</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Favorite Properties</CardTitle>
                    <CardDescription>Places you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {favoriteProperties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteProperties.map((property) => (
                          <div
                            key={property.id}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <Image
                              src={property.images[0] || "/placeholder.svg"}
                              alt={property.title}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-semibold mb-1">{property.title}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                <MapPin className="h-3 w-3" />
                                {property.location}
                              </p>
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold">${property.price}/night</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{property.rating}</span>
                                </div>
                              </div>
                              <Link href={`/property/${property.id}`}>
                                <Button className="w-full" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                        <p className="text-gray-600 mb-4">Save properties you love for easy access later</p>
                        <Link href="/search">
                          <Button>Start exploring</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Manage your personal information</CardDescription>
                      </div>
                      {!isEditingProfile ? (
                        <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {user.isVerified ? (
                            <Badge variant="default" className="text-xs">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Unverified
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Member since {user.joinDate}
                          </Badge>
                        </div>
                        {!isEditingProfile && (
                          <Button variant="outline" size="sm" className="mt-2">
                            Change Photo
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        {isEditingProfile ? (
                          <Input
                            id="firstName"
                            value={editedUser?.firstName || ""}
                            onChange={(e) =>
                              setEditedUser((prev) => (prev ? { ...prev, firstName: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        ) : (
                          <Input value={user.firstName} className="mt-1" readOnly />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        {isEditingProfile ? (
                          <Input
                            id="lastName"
                            value={editedUser?.lastName || ""}
                            onChange={(e) =>
                              setEditedUser((prev) => (prev ? { ...prev, lastName: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        ) : (
                          <Input value={user.lastName} className="mt-1" readOnly />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email} className="mt-1" readOnly />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        {isEditingProfile ? (
                          <Input
                            id="phone"
                            type="tel"
                            value={editedUser?.phone || ""}
                            onChange={(e) =>
                              setEditedUser((prev) => (prev ? { ...prev, phone: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        ) : (
                          <Input value={user.phone || ""} className="mt-1" readOnly />
                        )}
                      </div>
                    </div>

                    {!isEditingProfile && (
                      <div className="flex gap-4">
                        <Button variant="outline">Change Password</Button>
                        <Button variant="outline">Account Settings</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-semibold">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Default</Badge>
                      </div>

                      <Button variant="outline" className="w-full">
                        Add Payment Method
                      </Button>
                    </div>

                    <div className="mt-8">
                      <h4 className="font-semibold mb-4">Payment History</h4>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{booking.propertyTitle}</p>
                              <p className="text-sm text-gray-600">
                                {booking.checkIn} - {booking.checkOut}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${booking.totalPrice}</p>
                              <p className="text-xs text-gray-500">Paid</p>
                            </div>
                          </div>
                        ))}
                      </div>
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
