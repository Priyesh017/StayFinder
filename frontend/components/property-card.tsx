"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavoriteToggle } from "@/hooks/favorites/useFavToggle";

interface PropertyCardProps {
  property: any;
  index: number;
}

export default function PropertyCard({ property, index }: PropertyCardProps) {
  const { isFavorite, toggleFavorite, isLoading } = useFavoriteToggle(
    property.id
  ); // ✅ use the hook

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
              disabled={isLoading}
              className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 rounded-full"
              onClick={toggleFavorite} // ✅ updated
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>

            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {property.type}
              </Badge>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {property.title}
              </h3>
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
              {property.guests} guests · {property.bedrooms} bedrooms ·{" "}
              {property.bathrooms} bathrooms
            </p>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">${property.price}</span>
                <span className="text-gray-600 text-sm"> / night</span>
              </div>
              <span className="text-sm text-gray-500">
                ({property.reviews} reviews)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
