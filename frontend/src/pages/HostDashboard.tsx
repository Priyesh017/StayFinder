"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { HostSidebar } from "../components/HostSidebar";
import { DashboardStats } from "../components/DashboardStats";
import { RecentBookings } from "../components/RecentBookings";
import { PropertyList } from "../components/PropertyList";
import { Plus } from "lucide-react";

const HostDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HostSidebar />

      <div className="flex-1 p-8 ml-0 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName}! Here's what's happening with
                your properties.
              </p>
            </div>
            <Link
              to="/host/properties/new"
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          </div>

          <DashboardStats />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <RecentBookings />
            <PropertyList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
