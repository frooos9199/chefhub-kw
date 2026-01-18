'use client';

// ============================================
// ChefHub - Dish Card Component
// ============================================

import { useState } from 'react';
import { Star, Clock, Heart, ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  prepTime?: number;
  rating: number;
  totalOrders: number;
  chefName: string;
  chefId: string;
  chefImage?: string;
  chefDishesCount?: number;
  servingSize?: string;
}

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const formatPrice = (price: number) => {
    return price.toFixed(3);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      dishId: dish.id,
      dishName: dish.name,
      dishImage: dish.images[0] || '',
      price: dish.price,
      quantity: 1,
      chefId: dish.chefId,
      chefName: dish.chefName,
      prepTime: dish.prepTime || 30,
    });

    // Show success feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200">
      {/* Image */}
      <Link href={`/dishes/${dish.id}`}>
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {dish.images[0] ? (
            <Image
              src={dish.images[0]}
              alt={dish.name || 'طبق'}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl">🍽️</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-bold rounded-full shadow-lg">
              {dish.category}
            </span>
          </div>

          {/* Favorite Button */}
          <button className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg">
            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link href={`/dishes/${dish.id}`}>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
            {dish.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mt-2 line-clamp-2 h-10">
          {dish.description}
        </p>

        {/* Chef Info - Enhanced */}
        <Link 
          href={`/chef/${dish.chefId}`} 
          className="mt-3 flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-all group/chef border border-gray-100 hover:border-emerald-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chef Avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex-shrink-0 border-2 border-white shadow-sm">
            {dish.chefImage ? (
              <Image
                src={dish.chefImage}
                alt={dish.chefName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs">👨‍🍳</div>
            )}
          </div>
          
          {/* Chef Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">الشيف</div>
            <div className="font-bold text-gray-900 text-sm truncate group-hover/chef:text-emerald-600 transition-colors">
              {dish.chefName}
            </div>
            {dish.chefDishesCount !== undefined && (
              <div className="text-xs text-gray-500">
                {dish.chefDishesCount} منتج متوفر
              </div>
            )}
          </div>
          
          {/* Arrow Icon */}
          <div className="text-gray-400 group-hover/chef:text-emerald-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </Link>

        {/* Serving Size */}
        {dish.servingSize && (
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-semibold">الحجم:</span> {dish.servingSize}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-900">{(dish.rating || 0).toFixed(1)}</span>
          </div>
          
          {dish.prepTime && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{dish.prepTime} دقيقة</span>
            </div>
          )}
          
          <span className="text-xs text-gray-400">
            {dish.totalOrders || 0} طلب
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {formatPrice(dish.price)}
            </div>
            <div className="text-xs text-gray-500">دينار كويتي</div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full sm:w-auto justify-center px-3 py-2 text-sm sm:text-base sm:px-5 sm:py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group ${
              isAdded
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>إضافة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
