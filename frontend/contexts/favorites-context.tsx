"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface FavoritesContextType {
  favorites: string[]
  addToFavorites: (propertyId: string) => void
  removeFromFavorites: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const storedFavorites = localStorage.getItem("stayfinder_favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  const addToFavorites = (propertyId: string) => {
    const updatedFavorites = [...favorites, propertyId]
    setFavorites(updatedFavorites)
    localStorage.setItem("stayfinder_favorites", JSON.stringify(updatedFavorites))
  }

  const removeFromFavorites = (propertyId: string) => {
    const updatedFavorites = favorites.filter((id) => id !== propertyId)
    setFavorites(updatedFavorites)
    localStorage.setItem("stayfinder_favorites", JSON.stringify(updatedFavorites))
  }

  const isFavorite = (propertyId: string) => {
    return favorites.includes(propertyId)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
