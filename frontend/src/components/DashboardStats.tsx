import type React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Calendar,
  Star,
} from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$12,450",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Active Properties",
    value: "8",
    change: "+2",
    trend: "up" as const,
    icon: Home,
    description: "properties listed",
  },
  {
    title: "Bookings",
    value: "24",
    change: "-3",
    trend: "down" as const,
    icon: Calendar,
    description: "this month",
  },
  {
    title: "Average Rating",
    value: "4.8",
    change: "+0.2",
    trend: "up" as const,
    icon: Star,
    description: "across all properties",
  },
];

export const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <stat.icon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {stat.value}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            {stat.trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span
              className={
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              }
            >
              {stat.change}
            </span>
            <span className="ml-1">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
