'use client';

// ============================================
// ChefHub - Image Gallery Component
// ============================================

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  dishName: string;
}

export function ImageGallery({ images, dishName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasImages = images && images.length > 0;
  const displayImages = hasImages ? images : ['/placeholder-dish.png'];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group">
          {displayImages[selectedIndex] ? (
            <Image
              src={displayImages[selectedIndex]}
              alt={`${dishName} - صورة ${selectedIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl">🍽️</span>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
          >
            <ZoomIn className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                  index === selectedIndex
                    ? 'ring-4 ring-emerald-500 scale-105'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`${dishName} - صورة مصغرة ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image */}
          <div className="relative w-full max-w-6xl aspect-square">
            {displayImages[selectedIndex] ? (
              <Image
                src={displayImages[selectedIndex]}
                alt={`${dishName} - صورة كبيرة ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl">🍽️</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white font-semibold">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
