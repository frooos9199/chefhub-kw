'use client';

// ============================================
// ChefHub - Chef Card Component
// ============================================

import { Star, MapPin, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Chef } from '@/types';

interface ChefCardProps {
  chef: Chef;
}

export function ChefCard({ chef }: ChefCardProps) {
  return (
    <Link href={`/chef/${chef.id}`}>
      <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
          {chef.coverImage ? (
            <Image
              src={chef.coverImage}
              alt={chef.businessName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">👨‍🍳</span>
            </div>
          )}
          
          {/* Favorite Button */}
          <button className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg">
            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Profile Image */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute -top-12 right-6">
            <div className="relative w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500">
              {chef.profileImage ? (
                <Image
                  src={chef.profileImage}
                  alt={chef.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {chef.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Chef Info */}
          <div className="mt-14">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {chef.businessName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{chef.name}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-900">{chef.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">({chef.totalRatings} تقييم)</span>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mt-3">
              {chef.specialty.slice(0, 2).map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                >
                  {spec}
                </span>
              ))}
              {chef.specialty.length > 2 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  +{chef.specialty.length - 2}
                </span>
              )}
            </div>

            {/* Delivery Areas */}
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{chef.deliveryGovernorates.length} محافظات</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{chef.totalOrders}</div>
                <div className="text-xs text-gray-500">طلب مكتمل</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {chef.deliveryFees[chef.deliveryGovernorates[0] as keyof typeof chef.deliveryFees]?.toFixed(3) || '0.000'}
                </div>
                <div className="text-xs text-gray-500">د.ك توصيل</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
