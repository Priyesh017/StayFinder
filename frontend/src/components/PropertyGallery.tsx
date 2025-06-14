"use client";

import type React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Grid3X3, X } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const displayImages =
    images.length > 0 ? images : ["/placeholder.svg?height=400&width=600"];

  return (
    <>
      <div className="grid grid-cols-4 gap-2 h-96">
        <div className="col-span-2 row-span-2 relative">
          <img
            src={displayImages[0] || "/placeholder.svg"}
            alt="Property main image"
            className="w-full h-full object-cover rounded-l-lg cursor-pointer"
            onClick={() => setShowModal(true)}
          />
        </div>

        {displayImages.slice(1, 3).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image || "/placeholder.svg"}
              alt={`Property image ${index + 2}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowModal(true)}
            />
          </div>
        ))}

        <div className="relative">
          <img
            src={displayImages[3] || displayImages[0]}
            alt="Property image 4"
            className="w-full h-full object-cover rounded-tr-lg cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          <button
            onClick={() => setShowModal(true)}
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white px-4 py-2 rounded-md flex items-center text-sm font-medium"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Show all photos
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative">
              <img
                src={displayImages[currentImage] || "/placeholder.svg"}
                alt={`Property image ${currentImage + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-center mt-4 space-x-2">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentImage ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentImage(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
