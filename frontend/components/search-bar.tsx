"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { format, isBefore, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/stores/search-store";

interface SearchBarProps {
  variant?: "hero" | "header";
  className?: string;
}

export function SearchBar({
  variant = "hero",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  // const [showGuestPicker, setShowGuestPicker] = useState(false);

  const {
    location,
    checkInDate,
    checkOutDate,
    guests,
    totalGuests,
    setLocation,
    setCheckInDate,
    setCheckOutDate,
    incrementGuest,
    decrementGuest,
  } = useSearchStore();

  const handleSearch = () => {
    if (!location.trim()) return;

    const searchParams = new URLSearchParams();
    searchParams.set("location", location.trim());

    if (checkInDate) {
      searchParams.set("checkIn", format(checkInDate, "yyyy-MM-dd"));
    }
    if (checkOutDate) {
      searchParams.set("checkOut", format(checkOutDate, "yyyy-MM-dd"));
    }
    if (guests.adults !== 2) {
      searchParams.set("adults", guests.adults.toString());
    }
    if (guests.children > 0) {
      searchParams.set("children", guests.children.toString());
    }

    router.push(`/search?${searchParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Disable past dates for check-in
  const isCheckInDateDisabled = (date: Date): boolean => {
    return isBefore(date, new Date()); // block past dates
  };

  // Disable dates before check-in + 1 for check-out
  const isCheckOutDateDisabled = (date: Date): boolean => {
    return !checkInDate || isBefore(date, addDays(checkInDate, 1));
  };

  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className={`bg-white/60 rounded-2xl p-2 shadow-2xl max-w-5xl mx-auto backdrop-blur-sm ${className}`}
      >
        {/* Desktop Search Bar */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-2">
          <div className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-xl transition-colors">
            <MapPin className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 mb-1">Where</p>
              <Input
                placeholder="Search destinations"
                className="border-0 p-0 text-sm text-gray-700 placeholder:text-gray-500 focus-visible:ring-0 bg-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>

          <div className="border-l pl-2 border-gray-200">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer h-full">
                  <Calendar className="h-5 w-5 text-rose-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 mb-1">
                      Check in
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {checkInDate
                        ? format(checkInDate, "MMM dd")
                        : "Add dates"}
                    </p>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  disabled={isCheckInDateDisabled}
                  modifiersStyles={{
                    disabled: {
                      color: "#9CA3AF",
                      fontSize: "0.8rem",
                      cursor: "not-allowed",
                    },
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="border-l pl-2 border-gray-200">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer h-full">
                  <Calendar className="h-5 w-5 text-rose-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 mb-1">
                      Check out
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {checkOutDate
                        ? format(checkOutDate, "MMM dd")
                        : "Add dates"}
                    </p>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  disabled={isCheckOutDateDisabled}
                  modifiersStyles={{
                    disabled: {
                      color: "#9CA3AF",
                      fontSize: "0.8rem",
                      cursor: "not-allowed",
                    },
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="border-l pl-2 border-gray-200">
            <Popover>
              <PopoverTrigger asChild>
                <div className="w-fit flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer h-full">
                  <Users className="h-5 w-5 text-rose-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 mb-1">
                      Who
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Adults</p>
                      <p className="text-sm text-gray-500">Ages 13 or above</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("adults")}
                        disabled={guests.adults <= 1}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("adults")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Children</p>
                      <p className="text-sm text-gray-500">Ages 2-12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("children")}
                        disabled={guests.children <= 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("children")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Infants</p>
                      <p className="text-sm text-gray-500">Under 2</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("infants")}
                        disabled={guests.infants <= 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.infants}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("infants")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pets</p>
                      <p className="text-sm text-gray-500">
                        Bringing a service animal?
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("pets")}
                        disabled={guests.pets <= 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.pets}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("pets")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-center">
            <Button
              className="bg-rose-500 hover:bg-rose-600 rounded-xl h-14 px-8 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 border rounded-xl">
            <MapPin className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Where are you going?"
              className="border-0 p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Check in
                    </p>
                    <p className="text-sm text-gray-500">
                      {checkInDate
                        ? format(checkInDate, "MMM dd")
                        : "Add dates"}
                    </p>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={checkInDate}
                  onSelect={(date) => date && setCheckInDate(date)}
                  disabled={isCheckInDateDisabled}
                  modifiersStyles={{
                    disabled: {
                      color: "#9CA3AF",
                      fontSize: "0.8rem",
                      cursor: "not-allowed",
                    },
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Check out
                    </p>
                    <p className="text-sm text-gray-500">
                      {checkOutDate
                        ? format(checkOutDate, "MMM dd")
                        : "Add dates"}
                    </p>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={checkOutDate}
                  onSelect={(date) => date && setCheckOutDate(date)}
                  disabled={isCheckOutDateDisabled}
                  modifiersStyles={{
                    disabled: {
                      color: "#9CA3AF",
                      fontSize: "0.8rem",
                      cursor: "not-allowed",
                    },
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer flex-1 relative z-50">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Guests
                    </p>
                    <p className="text-sm text-gray-500">
                      {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Adults</p>
                      <p className="text-sm text-gray-500">Ages 13 or above</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("adults")}
                        disabled={guests.adults <= 1}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("adults")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Children</p>
                      <p className="text-sm text-gray-500">Ages 2-12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("children")}
                        disabled={guests.children <= 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("children")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Infants</p>
                      <p className="text-sm text-gray-500">Under 2</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("infants")}
                        disabled={guests.infants <= 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.infants}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("infants")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pets</p>
                      <p className="text-sm text-gray-500">
                        Bringing a service animal?
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decrementGuest("pets")}
                        disabled={guests.pets <= 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{guests.pets}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementGuest("pets")}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              className="bg-rose-500 hover:bg-rose-600 rounded-xl px-8 py-3 text-white font-semibold"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Header variant (simplified)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white shadow-sm">
        <MapPin className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Anywhere"
          className="border-0 p-0 text-sm w-20 focus-visible:ring-0"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-gray-600">
          {checkInDate && checkOutDate
            ? `${format(checkInDate, "MMM dd")} - ${format(
                checkOutDate,
                "MMM dd"
              )}`
            : "Any week"}
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-gray-600">
          {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
        </span>
        <Button
          size="sm"
          className="rounded-full bg-rose-500 hover:bg-rose-600"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
