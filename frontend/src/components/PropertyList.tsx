"use client";

import React from "react";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

const properties = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    location: "New York, NY",
    price: 150,
    status: "active" as const,
    bookings: 12,
    image: "/placeholder.svg?height=80&width=120",
  },
  {
    id: "2",
    title: "Cozy Beach House",
    location: "Malibu, CA",
    price: 280,
    status: "active" as const,
    bookings: 8,
    image: "/placeholder.svg?height=80&width=120",
  },
  {
    id: "3",
    title: "Mountain Cabin Retreat",
    location: "Aspen, CO",
    price: 200,
    status: "inactive" as const,
    bookings: 0,
    image: "/placeholder.svg?height=80&width=120",
  },
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export const PropertyList: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Your Properties</h3>
      <div className="space-y-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="flex items-center space-x-4 p-4 border rounded-lg"
          >
            <img
              src={property.image || "/placeholder.svg"}
              alt={property.title}
              className="w-20 h-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium">{property.title}</h4>
              <p className="text-sm text-gray-600">{property.location}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[property.status]
                  }`}
                >
                  {property.status}
                </span>
                <span className="text-sm text-gray-500">
                  {property.bookings} bookings this month
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">${property.price}/night</p>
              <div className="relative">
                <button
                  onClick={() =>
                    setDropdownOpen(
                      dropdownOpen === property.id ? null : property.id
                    )
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {dropdownOpen === property.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border z-10">
                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 border border-gray-300 hover:border-gray-400 py-2 rounded-md text-sm">
        Manage All Properties
      </button>
    </div>
  );
};
