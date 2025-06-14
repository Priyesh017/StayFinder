import type React from "react";
import { Calendar, MapPin } from "lucide-react";

const recentBookings = [
  {
    id: "1",
    guest: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    property: "Modern Downtown Apartment",
    checkIn: "Mar 15, 2024",
    checkOut: "Mar 18, 2024",
    status: "confirmed" as const,
    amount: "$450",
  },
  {
    id: "2",
    guest: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    property: "Cozy Beach House",
    checkIn: "Mar 20, 2024",
    checkOut: "Mar 25, 2024",
    status: "pending" as const,
    amount: "$840",
  },
  {
    id: "3",
    guest: {
      name: "Michael Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    property: "Mountain Cabin Retreat",
    checkIn: "Mar 22, 2024",
    checkOut: "Mar 24, 2024",
    status: "confirmed" as const,
    amount: "$400",
  },
];

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

export const RecentBookings: React.FC = () => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
      <div className="space-y-4">
        {recentBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {getInitials(booking.guest.name)}
                </span>
              </div>
              <div>
                <p className="font-medium">{booking.guest.name}</p>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {booking.property}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {booking.checkIn} - {booking.checkOut}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[booking.status]
                }`}
              >
                {booking.status}
              </span>
              <p className="font-semibold mt-1">{booking.amount}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 border border-gray-300 hover:border-gray-400 py-2 rounded-md text-sm">
        View All Bookings
      </button>
    </div>
  );
};
