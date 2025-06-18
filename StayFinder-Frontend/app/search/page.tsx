"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Star, Heart, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import { useProperties } from "@/contexts/properties-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

function PropertyCard({ property, index }: { property: any; index: number }) {
  const { user } = useAuth()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const { toast } = useToast()

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group cursor-pointer border-0 shadow-none hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-xl">
            <Link href={`/property/${property.id}`}>
              <Image
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                width={400}
                height={300}
                className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 rounded-full"
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-4 w-4 ${isPropertyFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {property.type}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{property.rating}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {property.location}
            </p>
            <p className="text-gray-600 text-sm mb-3">
              {property.guests} guests · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">${property.price}</span>
                <span className="text-gray-600 text-sm"> / night</span>
              </div>
              <span className="text-sm text-gray-500">({property.reviews} reviews)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { searchProperties } = useProperties()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [priceRange, setPriceRange] = useState([50, 500])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("recommended")
  const [guests, setGuests] = useState<number | undefined>()

  const amenities = [
    "WiFi",
    "Kitchen",
    "Parking",
    "Pool",
    "Hot tub",
    "Fireplace",
    "Beach access",
    "Gym",
    "Rooftop",
    "Garden",
    "Ocean view",
    "Ski access",
  ]

  const categories = ["All", "Beachfront", "Cabins", "City", "Countryside", "Luxury"]

  // Search and filter properties
  const searchResults = searchProperties(searchQuery, {
    category: category || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    guests,
    amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    location: location || undefined,
  })

  // Sort results
  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity])
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setLocation("")
    setCategory("")
    setPriceRange([50, 500])
    setSelectedAmenities([])
    setGuests(undefined)
  }

  const hasActiveFilters =
    searchQuery ||
    location ||
    category ||
    priceRange[0] !== 50 ||
    priceRange[1] !== 500 ||
    selectedAmenities.length > 0 ||
    guests

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20">
        {/* Search Header */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search destinations, properties..."
                    className="pl-10 pr-4 py-2 border-gray-300 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 rounded-full flex-1 sm:flex-none">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                          !
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Refine your search to find the perfect stay</SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                      {/* Location */}
                      <div>
                        <Label className="text-base font-semibold">Location</Label>
                        <Input
                          placeholder="Enter location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <Label className="text-base font-semibold">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat === "All" ? "" : cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <Label className="text-base font-semibold">Price Range</Label>
                        <div className="mt-4">
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={1000}
                            min={0}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-2 text-sm text-gray-600">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Guests */}
                      <div>
                        <Label className="text-base font-semibold">Guests</Label>
                        <Select
                          value={guests?.toString() || ""}
                          onValueChange={(value) => setGuests(value ? Number(value) : undefined)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Any number of guests" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any number of guests</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} guest{num > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amenities */}
                      <div>
                        <Label className="text-base font-semibold">Amenities</Label>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox
                                id={amenity}
                                checked={selectedAmenities.includes(amenity)}
                                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                              />
                              <Label htmlFor={amenity} className="text-sm">
                                {amenity}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <Button variant="outline" onClick={clearFilters} className="w-full">
                          <X className="h-4 w-4 mr-2" />
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {location}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setLocation("")} />
                  </Badge>
                )}
                {category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {category}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory("")} />
                  </Badge>
                )}
                {(priceRange[0] !== 50 || priceRange[1] !== 500) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange([50, 500])} />
                  </Badge>
                )}
                {guests && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Guests: {guests}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setGuests(undefined)} />
                  </Badge>
                )}
                {selectedAmenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {sortedResults.length} stay{sortedResults.length !== 1 ? "s" : ""} found
            </h1>
            <p className="text-gray-600">
              {searchQuery || location || category
                ? "Showing results for your search criteria"
                : "Showing all available properties"}
            </p>
          </motion.div>

          {sortedResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {sortedResults.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or clearing some filters to see more results.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            </motion.div>
          )}

          {/* Load More */}
          {sortedResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-12"
            >
              <Button variant="outline" size="lg" className="rounded-full">
                Load more properties
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
