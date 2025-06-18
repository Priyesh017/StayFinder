"use client"

import { motion } from "framer-motion"
import { Star, MapPin, Heart, Wifi, Car, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { useProperties } from "@/contexts/properties-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { properties } = useProperties()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const { user } = useAuth()
  const { toast } = useToast()

  const featuredProperties = properties.slice(0, 8)

  const handleFavoriteToggle = (propertyId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      })
      return
    }

    if (isFavorite(propertyId)) {
      removeFromFavorites(propertyId)
      toast({
        title: "Removed from favorites",
        description: "Property removed from your favorites",
      })
    } else {
      addToFavorites(propertyId)
      toast({
        title: "Added to favorites",
        description: "Property saved to your favorites",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Beautiful destination"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find your perfect
              <span className="block text-rose-400">stay anywhere</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl mx-auto">
              Discover unique places to stay, from cozy apartments to luxury villas, all around the world.
            </p>
          </motion.div>

          {/* Search Bar */}
          <SearchBar variant="hero" />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Explore</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Stays</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked properties that offer exceptional experiences and outstanding hospitality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <Link href={`/property/${property.id}`}>
                      <Image
                        src={property.images[0] || "/placeholder.svg"}
                        alt={property.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2"
                      onClick={(e) => {
                        e.preventDefault()
                        handleFavoriteToggle(property.id)
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFavorite(property.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                      />
                    </Button>
                    {property.host.isSuperhost && (
                      <Badge className="absolute top-3 left-3 bg-white text-gray-900">Superhost</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/property/${property.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{property.rating}</span>
                          <span className="text-sm text-gray-500">({property.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{property.location.split(",")[0]}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{property.type}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {property.amenities.slice(0, 3).map((amenity, idx) => {
                          const getIcon = (amenity: string) => {
                            switch (amenity.toLowerCase()) {
                              case "wifi":
                                return Wifi
                              case "parking":
                                return Car
                              case "kitchen":
                                return Coffee
                              default:
                                return Wifi
                            }
                          }
                          const IconComponent = getIcon(amenity)
                          return <IconComponent key={idx} className="h-3 w-3 text-gray-400" />
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">${property.price}</span>
                          <span className="text-sm text-gray-600"> / night</span>
                        </div>
                        <span className="text-xs text-gray-500">{property.guests} guests</span>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/search">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl">
                View All Properties
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose StayFinder?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy to find and book the perfect accommodation for your next adventure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Properties",
                description: "All our properties are verified and reviewed by our team to ensure quality and safety.",
                icon: "🏠",
              },
              {
                title: "Best Price Guarantee",
                description: "We guarantee the best prices. If you find a lower price elsewhere, we'll match it.",
                icon: "💰",
              },
              {
                title: "24/7 Support",
                description: "Our customer support team is available 24/7 to help you with any questions or issues.",
                icon: "🛟",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
