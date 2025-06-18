"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Heart,
  Share,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves,
  Calendar,
  Users,
  Minus,
  Plus,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { format, differenceInDays, isBefore, addDays } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ReservationModal } from "@/components/reservation-modal"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useProperties } from "@/contexts/properties-context"
import { useSearchStore } from "@/stores/search-store"
import { useReservationStore, type ReservationDetails } from "@/stores/reservation-store"

export default function PropertyPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { user } = useAuth()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const { getProperty } = useProperties()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    checkInDate,
    checkOutDate,
    guests,
    setCheckInDate,
    setCheckOutDate,
    incrementGuest,
    decrementGuest,
    setSearchFromParams,
  } = useSearchStore()

  const { setReservation } = useReservationStore()

  const property = getProperty(params.id)

  // Initialize dates from search params only once
  useEffect(() => {
    if (searchParams && !isInitialized) {
      setSearchFromParams(searchParams)
      setIsInitialized(true)
    }
  }, [searchParams, setSearchFromParams, isInitialized, checkInDate, checkOutDate])

  // Memoize calculations to prevent unnecessary re-renders
  const calculations = useMemo(() => {
    const calculateNights = () => {
      if (checkInDate && checkOutDate) {
        return differenceInDays(checkOutDate, checkInDate)
      }
      return 0
    }

    const nights = calculateNights()
    const subtotal = property ? property.price * nights : 0
    const cleaningFee = 50
    const serviceFee = Math.round(subtotal * 0.14)
    const taxes = Math.round(subtotal * 0.12)
    const total = subtotal + cleaningFee + serviceFee + taxes

    return {
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
    }
  }, [checkInDate, checkOutDate, property?.price])

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link href="/search">
            <Button>Back to search</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isPropertyFavorite = isFavorite(property.id)

  const handleFavoriteToggle = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      })
      return
    }

    if (isPropertyFavorite) {
      removeFromFavorites(property.id)
      toast({
        title: "Removed from favorites",
        description: "Property removed from your favorites",
      })
    } else {
      addToFavorites(property.id)
      toast({
        title: "Added to favorites",
        description: "Property saved to your favorites",
      })
    }
  }

  const handleReservation = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to make a booking",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Select Dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      })
      return
    }

    if (calculations.nights < 1) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      })
      return
    }

    if (isBefore(checkInDate, new Date())) {
      toast({
        title: "Invalid Date",
        description: "Check-in date cannot be in the past",
        variant: "destructive",
      })
      return
    }

    const reservationDetails: ReservationDetails = {
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.images[0],
      propertyPrice: property.price,
      hostName: property.host.name,
      location: property.location,
      checkInDate,
      checkOutDate,
      guests,
      nights: calculations.nights,
      subtotal: calculations.subtotal,
      cleaningFee: calculations.cleaningFee,
      serviceFee: calculations.serviceFee,
      taxes: calculations.taxes,
      total: calculations.total,
    }

    setReservation(reservationDetails)
    setShowReservationModal(true)
  }

  const isDateDisabled = (date: Date) => {
    return isBefore(date, new Date())
  }

  const totalGuests = guests.adults + guests.children

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/search">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </Button>
          </Link>
        </div>

        {/* Property Header */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-gray-600">({property.reviews} reviews)</span>
                </div>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{property.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleFavoriteToggle}>
                  <Heart className={`h-4 w-4 ${isPropertyFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
            <div className="md:col-span-2 md:row-span-2">
              <Image
                src={property.images[0] || "/placeholder.svg"}
                alt="Main property image"
                width={600}
                height={400}
                className="w-full h-64 md:h-full object-cover hover:brightness-90 transition-all cursor-pointer"
              />
            </div>
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="hidden md:block">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Property image ${index + 2}`}
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover hover:brightness-90 transition-all cursor-pointer"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Property Details */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Host Info */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                    {property.type} hosted by {property.host.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 flex-wrap">
                    <span>{property.guests} guests</span>
                    <span>•</span>
                    <span>{property.bedrooms} bedrooms</span>
                    <span>•</span>
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={property.host.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{property.host.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <Separator className="my-6" />

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
                <div className="space-y-3">
                  {property.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">About this space</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              <Separator className="my-6" />

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => {
                    const getAmenityIcon = (amenity: string) => {
                      switch (amenity.toLowerCase()) {
                        case "wifi":
                          return Wifi
                        case "kitchen":
                          return Coffee
                        case "parking":
                          return Car
                        case "tv":
                          return Tv
                        case "air conditioning":
                          return Wind
                        case "pool":
                          return Waves
                        default:
                          return CheckCircle
                      }
                    }
                    const IconComponent = getAmenityIcon(amenity)
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span>{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-24"
            >
              <Card className="shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-2xl font-bold">${property.price}</span>
                      <span className="text-gray-600"> / night</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{property.rating}</span>
                      <span className="text-gray-600">({property.reviews})</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal h-12">
                            <Calendar className="mr-2 h-4 w-4" />
                            <div>
                              <div className="text-xs text-gray-500">CHECK-IN</div>
                              <div className="text-sm">{checkInDate ? format(checkInDate, "MMM dd") : "Add date"}</div>
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={checkInDate}
                            onSelect={setCheckInDate}
                            disabled={isDateDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal h-12">
                            <Calendar className="mr-2 h-4 w-4" />
                            <div>
                              <div className="text-xs text-gray-500">CHECK-OUT</div>
                              <div className="text-sm">
                                {checkOutDate ? format(checkOutDate, "MMM dd") : "Add date"}
                              </div>
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={checkOutDate}
                            onSelect={setCheckOutDate}
                            disabled={(date) =>
                              isDateDisabled(date) || (checkInDate ? isBefore(date, addDays(checkInDate, 1)) : false)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                          <Users className="mr-2 h-4 w-4" />
                          <div>
                            <div className="text-xs text-gray-500">GUESTS</div>
                            <div className="text-sm">
                              {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                              {guests.infants > 0 && `, ${guests.infants} infant${guests.infants !== 1 ? "s" : ""}`}
                            </div>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Adults</p>
                              <p className="text-sm text-gray-500">Ages 13 or above</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => decrementGuest("adults")}
                                disabled={guests.adults <= 1}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-8 text-center">{guests.adults}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementGuest("adults")}
                                disabled={totalGuests >= property.guests}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Children</p>
                              <p className="text-sm text-gray-500">Ages 2-12</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => decrementGuest("children")}
                                disabled={guests.children <= 0}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-8 text-center">{guests.children}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementGuest("children")}
                                disabled={totalGuests >= property.guests}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Infants</p>
                              <p className="text-sm text-gray-500">Under 2</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => decrementGuest("infants")}
                                disabled={guests.infants <= 0}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-8 text-center">{guests.infants}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementGuest("infants")}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Pets</p>
                              <p className="text-sm text-gray-500">Bringing a service animal?</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => decrementGuest("pets")}
                                disabled={guests.pets <= 0}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-8 text-center">{guests.pets}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementGuest("pets")}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg mb-4 h-12"
                    onClick={handleReservation}
                    disabled={!checkInDate || !checkOutDate}
                  >
                    {user ? "Reserve" : "Log in to Reserve"}
                  </Button>

                  <p className="text-center text-sm text-gray-600 mb-4">You won't be charged yet</p>

                  {checkInDate && checkOutDate && calculations.nights > 0 && (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="underline">
                          ${property.price} x {calculations.nights} night{calculations.nights !== 1 ? "s" : ""}
                        </span>
                        <span>${calculations.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="underline">Cleaning fee</span>
                        <span>${calculations.cleaningFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="underline">Service fee</span>
                        <span>${calculations.serviceFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="underline">Taxes</span>
                        <span>${calculations.taxes}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>${calculations.total}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Host Info Card */}
              <Card className="mt-6 shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={property.host.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{property.host.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{property.host.name}</h4>
                      {property.host.isSuperhost && (
                        <Badge variant="secondary" className="text-xs">
                          Superhost
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Response rate: {property.host.responseRate}</p>
                    <p>Response time: {property.host.responseTime}</p>
                    <p>Joined in {property.host.joinDate}</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Contact host
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <h3 className="text-2xl font-semibold">
                {property.rating} · {property.reviews} reviews
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((review) => (
                <div key={review} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>U{review}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Guest {review}</p>
                      <p className="text-sm text-gray-600">December 2024</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Amazing stay! The location was perfect and the host was very responsive. Would definitely recommend
                    this place to anyone visiting the area.
                  </p>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-8">
              Show all {property.reviews} reviews
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />

      {/* Reservation Modal */}
      {showReservationModal && (
        <ReservationModal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          reservation={useReservationStore.getState().reservation!}
        />
      )}
    </div>
  )
}
