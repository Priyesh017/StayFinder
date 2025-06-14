import type React from "react";
import { Star } from "lucide-react";

interface ReviewsSectionProps {
  propertyId: string;
  rating: number;
  reviewCount: number;
}

const mockReviews = [
  {
    id: "1",
    user: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    rating: 5,
    date: "March 2024",
    comment:
      "Amazing place! The location was perfect and the host was very responsive. Would definitely stay again.",
  },
  {
    id: "2",
    user: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    rating: 5,
    date: "February 2024",
    comment:
      "Clean, comfortable, and exactly as described. Great communication from the host.",
  },
  {
    id: "3",
    user: {
      name: "Michael Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    rating: 4,
    date: "January 2024",
    comment:
      "Nice apartment in a great location. Only minor issue was the WiFi was a bit slow.",
  },
];

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-rose-500 h-2 rounded-full"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  propertyId,
  rating,
  reviewCount,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2 mb-6">
        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
        <h2 className="text-2xl font-semibold">
          {rating} · {reviewCount} reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm w-20">Cleanliness</span>
            <ProgressBar value={95} />
            <span className="text-sm font-medium">4.8</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm w-20">Accuracy</span>
            <ProgressBar value={92} />
            <span className="text-sm font-medium">4.6</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm w-20">Check-in</span>
            <ProgressBar value={98} />
            <span className="text-sm font-medium">4.9</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm w-20">Communication</span>
            <ProgressBar value={96} />
            <span className="text-sm font-medium">4.8</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm w-20">Location</span>
            <ProgressBar value={94} />
            <span className="text-sm font-medium">4.7</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm w-20">Value</span>
            <ProgressBar value={90} />
            <span className="text-sm font-medium">4.5</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {getInitials(review.user.name)}
                </span>
              </div>
              <div>
                <p className="font-medium">{review.user.name}</p>
                <p className="text-sm text-gray-600">{review.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 mb-2">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      <button className="mt-6 border border-gray-300 hover:border-gray-400 px-6 py-2 rounded-md">
        Show all {reviewCount} reviews
      </button>
    </div>
  );
};
