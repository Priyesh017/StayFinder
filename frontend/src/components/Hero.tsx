import type React from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <div className="relative h-[60vh] bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
        <p className="text-xl mb-8 opacity-90">
          Discover unique places to stay around the world
        </p>

        <div className="bg-white rounded-lg p-4 shadow-lg max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="w-5 h-5" />
              <input
                type="text"
                placeholder="Where are you going?"
                className="w-full p-2 border-0 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <input
                type="date"
                placeholder="Check in"
                className="w-full p-2 border-0 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <input
                type="date"
                placeholder="Check out"
                className="w-full p-2 border-0 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-700" />
              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-md flex items-center justify-center">
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
