"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/properties/useProperties";
import { useFavoriteToggle } from "@/hooks/favorites/useFavToggle";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Star, MapPin, Heart, Wifi, Car, Coffee } from "lucide-react";
import type { Property } from "@/types/property";

export default function Feature() {
  const propertiesQuery = useProperties();

  if (propertiesQuery.isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">Loading...</div>
      </section>
    );
  }

  if (propertiesQuery.isError) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-red-500">
          Error loading properties.
        </div>
      </section>
    );
  }

  const properties = propertiesQuery.data ?? [];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Stays
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked properties that offer exceptional experiences and
            outstanding hospitality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property: Property, index: number) => {
            const { isFavorite, toggleFavorite } = useFavoriteToggle(
              property.id
            );
            return (
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
                        e.preventDefault();
                        toggleFavorite(); // ✅ call inside
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite(property.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </Button>
                    {property.host.isSuperhost && (
                      <Badge className="absolute top-3 left-3 bg-white text-gray-900">
                        Superhost
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/property/${property.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {property.rating}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({property.reviews})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">
                            {property.location.split(",")[0]}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {property.type}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        {property.amenities.slice(0, 3).map((amenity, idx) => {
                          const getIcon = (amenity: string) => {
                            switch (amenity.toLowerCase()) {
                              case "wifi":
                                return Wifi;
                              case "parking":
                                return Car;
                              case "kitchen":
                                return Coffee;
                              default:
                                return Wifi;
                            }
                          };
                          const IconComponent = getIcon(amenity);
                          return (
                            <IconComponent
                              key={idx}
                              className="h-3 w-3 text-gray-400"
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            ${property.price}
                          </span>
                          <span className="text-sm text-gray-600">
                            {" "}
                            / night
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {property.guests} guests
                        </span>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/search">
            <Button
              size="lg"
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl"
            >
              View All Properties
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
