import type React from "react";
import { Shield, MessageCircle, Star } from "lucide-react";

interface HostInfoProps {
  host: {
    name: string;
    avatar?: string;
    joinedDate: string;
    verified: boolean;
    responseRate: number;
    responseTime: string;
  };
}

export const HostInfo: React.FC<HostInfoProps> = ({ host }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg border p-6 mt-8">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
          {host.avatar ? (
            <img
              src={host.avatar || "/placeholder.svg"}
              alt={host.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-xl font-semibold text-gray-600">
              {getInitials(host.name)}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">Hosted by {host.name}</h3>
          <p className="text-gray-600">Joined in {host.joinedDate}</p>
          {host.verified && (
            <div className="flex items-center space-x-1 mt-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Verified
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span className="font-medium">4.9</span>
          </div>
          <p className="text-sm text-gray-600">Rating</p>
        </div>
        <div>
          <p className="font-medium">{host.responseRate}%</p>
          <p className="text-sm text-gray-600">Response rate</p>
        </div>
        <div>
          <p className="font-medium">156</p>
          <p className="text-sm text-gray-600">Reviews</p>
        </div>
        <div>
          <p className="font-medium">{host.responseTime}</p>
          <p className="text-sm text-gray-600">Response time</p>
        </div>
      </div>

      <hr className="border-gray-200 my-4" />

      <p className="text-gray-700 mb-4">
        {host.name} is a Superhost. Superhosts are experienced, highly rated
        hosts who are committed to providing great stays for guests.
      </p>

      <button className="w-full border border-gray-300 hover:border-gray-400 py-2 rounded-md flex items-center justify-center">
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact Host
      </button>
    </div>
  );
};
