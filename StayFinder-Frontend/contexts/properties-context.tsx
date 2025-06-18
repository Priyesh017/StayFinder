"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  rating: number
  reviews: number
  images: string[]
  host: {
    name: string
    avatar: string
    joinDate: string
    isSuperhost: boolean
    responseRate: string
    responseTime: string
  }
  type: string
  guests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  highlights: string[]
  category: string
  status: "active" | "inactive" | "pending"
  createdAt: string
  updatedAt: string
}

interface PropertiesContextType {
  properties: Property[]
  addProperty: (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => void
  updateProperty: (id: string, property: Partial<Property>) => void
  deleteProperty: (id: string) => void
  getProperty: (id: string) => Property | undefined
  searchProperties: (query: string, filters?: SearchFilters) => Property[]
}

interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
  amenities?: string[]
  location?: string
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined)

// Update the initialProperties array with more demo listings
const initialProperties: Property[] = [
  {
    id: "1",
    title: "Modern Loft in Downtown",
    description:
      "Experience the heart of Manhattan in this stunning modern loft. Located in the vibrant downtown area, you'll be steps away from world-class dining, shopping, and entertainment.",
    location: "New York, NY",
    price: 120,
    rating: 4.9,
    reviews: 127,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Sarah Johnson",
      avatar: "/placeholder-user.jpg",
      joinDate: "2019",
      isSuperhost: true,
      responseRate: "100%",
      responseTime: "within an hour",
    },
    type: "Entire apartment",
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "Parking", "Pool"],
    highlights: ["Prime downtown location", "Floor-to-ceiling windows", "Modern amenities"],
    category: "City",
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    title: "Cozy Beach House",
    description: "Relax in this beautiful beachfront property with stunning ocean views and direct beach access.",
    location: "Malibu, CA",
    price: 250,
    rating: 4.8,
    reviews: 89,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Mike Wilson",
      avatar: "/placeholder-user.jpg",
      joinDate: "2020",
      isSuperhost: false,
      responseRate: "95%",
      responseTime: "within 2 hours",
    },
    type: "Entire house",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "Beach access", "Hot tub"],
    highlights: ["Beachfront location", "Ocean views", "Private beach access"],
    category: "Beachfront",
    status: "active",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
  },
  {
    id: "3",
    title: "Mountain Cabin Retreat",
    description: "Escape to this cozy mountain cabin surrounded by nature and perfect for outdoor enthusiasts.",
    location: "Aspen, CO",
    price: 180,
    rating: 4.7,
    reviews: 156,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Emma Davis",
      avatar: "/placeholder-user.jpg",
      joinDate: "2018",
      isSuperhost: true,
      responseRate: "100%",
      responseTime: "within 30 minutes",
    },
    type: "Entire cabin",
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["WiFi", "Kitchen", "Fireplace", "Ski access"],
    highlights: ["Mountain views", "Ski-in/ski-out", "Fireplace"],
    category: "Cabins",
    status: "active",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03",
  },
  {
    id: "4",
    title: "Urban Studio Apartment",
    description: "Perfect for solo travelers or couples, this modern studio is located in the heart of San Francisco.",
    location: "San Francisco, CA",
    price: 95,
    rating: 4.6,
    reviews: 203,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "David Chen",
      avatar: "/placeholder-user.jpg",
      joinDate: "2021",
      isSuperhost: false,
      responseRate: "90%",
      responseTime: "within 4 hours",
    },
    type: "Entire studio",
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Kitchen", "Gym", "Rooftop"],
    highlights: ["City center location", "Modern amenities", "Rooftop access"],
    category: "City",
    status: "active",
    createdAt: "2024-01-04",
    updatedAt: "2024-01-04",
  },
  {
    id: "5",
    title: "Luxury Villa with Pool",
    description: "Indulge in luxury at this stunning villa featuring a private pool and breathtaking ocean views.",
    location: "Miami, FL",
    price: 350,
    rating: 4.9,
    reviews: 78,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Isabella Rodriguez",
      avatar: "/placeholder-user.jpg",
      joinDate: "2017",
      isSuperhost: true,
      responseRate: "100%",
      responseTime: "within 15 minutes",
    },
    type: "Entire villa",
    guests: 10,
    bedrooms: 5,
    bathrooms: 4,
    amenities: ["WiFi", "Kitchen", "Pool", "Ocean view"],
    highlights: ["Private pool", "Ocean views", "Luxury amenities"],
    category: "Luxury",
    status: "active",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: "6",
    title: "Historic Brownstone",
    description: "Stay in this beautifully restored historic brownstone in the heart of Boston's Back Bay.",
    location: "Boston, MA",
    price: 140,
    rating: 4.8,
    reviews: 92,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "James Thompson",
      avatar: "/placeholder-user.jpg",
      joinDate: "2019",
      isSuperhost: true,
      responseRate: "98%",
      responseTime: "within 1 hour",
    },
    type: "Entire house",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "Parking", "Garden"],
    highlights: ["Historic charm", "Prime location", "Private garden"],
    category: "City",
    status: "active",
    createdAt: "2024-01-06",
    updatedAt: "2024-01-06",
  },
  {
    id: "7",
    title: "Countryside Farmhouse",
    description: "Escape to the peaceful countryside in this charming farmhouse surrounded by rolling hills.",
    location: "Napa Valley, CA",
    price: 200,
    rating: 4.7,
    reviews: 134,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Maria Garcia",
      avatar: "/placeholder-user.jpg",
      joinDate: "2020",
      isSuperhost: false,
      responseRate: "95%",
      responseTime: "within 3 hours",
    },
    type: "Entire house",
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["WiFi", "Kitchen", "Fireplace", "Garden"],
    highlights: ["Wine country location", "Peaceful setting", "Large garden"],
    category: "Countryside",
    status: "active",
    createdAt: "2024-01-07",
    updatedAt: "2024-01-07",
  },
  {
    id: "8",
    title: "Lakefront Cottage",
    description: "Enjoy serene lake views from this cozy cottage perfect for a romantic getaway or family vacation.",
    location: "Lake Tahoe, CA",
    price: 175,
    rating: 4.8,
    reviews: 167,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Robert Kim",
      avatar: "/placeholder-user.jpg",
      joinDate: "2018",
      isSuperhost: true,
      responseRate: "100%",
      responseTime: "within 30 minutes",
    },
    type: "Entire cottage",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "Fireplace", "Lake access"],
    highlights: ["Lake views", "Private dock", "Mountain setting"],
    category: "Countryside",
    status: "active",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
  {
    id: "9",
    title: "Desert Oasis Resort",
    description: "Experience luxury in the desert at this stunning resort-style property with pool and spa.",
    location: "Scottsdale, AZ",
    price: 280,
    rating: 4.9,
    reviews: 95,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Jennifer Lee",
      avatar: "/placeholder-user.jpg",
      joinDate: "2019",
      isSuperhost: true,
      responseRate: "100%",
      responseTime: "within 20 minutes",
    },
    type: "Entire villa",
    guests: 12,
    bedrooms: 6,
    bathrooms: 5,
    amenities: ["WiFi", "Kitchen", "Pool", "Spa"],
    highlights: ["Desert views", "Resort amenities", "Private spa"],
    category: "Luxury",
    status: "active",
    createdAt: "2024-01-09",
    updatedAt: "2024-01-09",
  },
  {
    id: "10",
    title: "Ski Lodge Chalet",
    description: "Hit the slopes from this authentic ski lodge with direct access to world-class skiing.",
    location: "Whistler, BC",
    price: 220,
    rating: 4.6,
    reviews: 188,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Michael Brown",
      avatar: "/placeholder-user.jpg",
      joinDate: "2017",
      isSuperhost: false,
      responseRate: "92%",
      responseTime: "within 2 hours",
    },
    type: "Entire chalet",
    guests: 10,
    bedrooms: 5,
    bathrooms: 3,
    amenities: ["WiFi", "Kitchen", "Fireplace", "Ski access"],
    highlights: ["Ski-in/ski-out", "Mountain views", "Hot tub"],
    category: "Cabins",
    status: "active",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
  },
  {
    id: "11",
    title: "Penthouse Suite",
    description: "Live like royalty in this luxurious penthouse with panoramic city views and premium amenities.",
    location: "Chicago, IL",
    price: 400,
    rating: 4.9,
    reviews: 67,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Alexandra White",
      avatar: "/placeholder-user.jpg",
      joinDate: "2020",
      isSuperhost: true,
      responseRate: "100%",
      responseTime: "within 10 minutes",
    },
    type: "Entire penthouse",
    guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    amenities: ["WiFi", "Kitchen", "Pool", "Gym"],
    highlights: ["Panoramic views", "Luxury finishes", "Rooftop terrace"],
    category: "Luxury",
    status: "active",
    createdAt: "2024-01-11",
    updatedAt: "2024-01-11",
  },
  {
    id: "12",
    title: "Tropical Beach Bungalow",
    description: "Paradise awaits in this charming beach bungalow just steps from pristine white sand beaches.",
    location: "Key West, FL",
    price: 190,
    rating: 4.7,
    reviews: 145,
    images: ["/placeholder.svg?height=300&width=400"],
    host: {
      name: "Carlos Martinez",
      avatar: "/placeholder-user.jpg",
      joinDate: "2018",
      isSuperhost: false,
      responseRate: "88%",
      responseTime: "within 4 hours",
    },
    type: "Entire bungalow",
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Kitchen", "Beach access", "Outdoor shower"],
    highlights: ["Beach location", "Tropical setting", "Private patio"],
    category: "Beachfront",
    status: "active",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-12",
  },
]

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    const storedProperties = localStorage.getItem("stayfinder_properties")
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties))
    } else {
      setProperties(initialProperties)
      localStorage.setItem("stayfinder_properties", JSON.stringify(initialProperties))
    }
  }, [])

  const saveToStorage = (updatedProperties: Property[]) => {
    localStorage.setItem("stayfinder_properties", JSON.stringify(updatedProperties))
  }

  const addProperty = (propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
    const newProperty: Property = {
      ...propertyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedProperties = [...properties, newProperty]
    setProperties(updatedProperties)
    saveToStorage(updatedProperties)
  }

  const updateProperty = (id: string, propertyData: Partial<Property>) => {
    const updatedProperties = properties.map((property) =>
      property.id === id ? { ...property, ...propertyData, updatedAt: new Date().toISOString() } : property,
    )
    setProperties(updatedProperties)
    saveToStorage(updatedProperties)
  }

  const deleteProperty = (id: string) => {
    const updatedProperties = properties.filter((property) => property.id !== id)
    setProperties(updatedProperties)
    saveToStorage(updatedProperties)
  }

  const getProperty = (id: string) => {
    return properties.find((property) => property.id === id)
  }

  const searchProperties = (query: string, filters?: SearchFilters) => {
    let filteredProperties = properties

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filteredProperties = filteredProperties.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm) ||
          property.location.toLowerCase().includes(searchTerm) ||
          property.description.toLowerCase().includes(searchTerm) ||
          property.amenities.some((amenity) => amenity.toLowerCase().includes(searchTerm)),
      )
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        filteredProperties = filteredProperties.filter((property) => property.category === filters.category)
      }

      if (filters.minPrice !== undefined) {
        filteredProperties = filteredProperties.filter((property) => property.price >= filters.minPrice!)
      }

      if (filters.maxPrice !== undefined) {
        filteredProperties = filteredProperties.filter((property) => property.price <= filters.maxPrice!)
      }

      if (filters.guests) {
        filteredProperties = filteredProperties.filter((property) => property.guests >= filters.guests!)
      }

      if (filters.location) {
        filteredProperties = filteredProperties.filter((property) =>
          property.location.toLowerCase().includes(filters.location!.toLowerCase()),
        )
      }

      if (filters.amenities && filters.amenities.length > 0) {
        filteredProperties = filteredProperties.filter((property) =>
          filters.amenities!.every((amenity) => property.amenities.includes(amenity)),
        )
      }
    }

    return filteredProperties
  }

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
        getProperty,
        searchProperties,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  )
}

export function useProperties() {
  const context = useContext(PropertiesContext)
  if (context === undefined) {
    throw new Error("useProperties must be used within a PropertiesProvider")
  }
  return context
}
