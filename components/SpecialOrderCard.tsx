'use client';

// ============================================
// ChefHub - Special Order Card Component
// ============================================

import { useState } from 'react';
import { Calendar, Clock, TrendingUp, Users, MapPin, ShoppingCart, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface SpecialOrder {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  chefId: string;
  chefName: string;
  chefImage: string;
  maxOrders: number;
  currentOrders: number;
  startDate: string;
  endDate: string;
  deliveryGovernorates: string[];
  category: string;
  prepTime: number;
}

interface SpecialOrderCardProps {
  order: SpecialOrder;
}

export function SpecialOrderCard({ order }: SpecialOrderCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const maxOrders = order.maxOrders || 0;
  const currentOrders = order.currentOrders || 0;
  const remaining = maxOrders - currentOrders;
  const percentageSold = maxOrders > 0 ? (currentOrders / maxOrders) * 100 : 0;
  const isAlmostFull = percentageSold >= 80;
  const isSoldOut = remaining <= 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-KW', { month: 'short', day: 'numeric' });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) return;

    addItem({
      dishId: order.id,
      dishName: order.title,
      dishImage: order.image,
      price: order.price,
      quantity: 1,
      chefId: order.chefId,
      chefName: order.chefName,
      prepTime: order.prepTime,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200">
      {/* Special Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1 animate-pulse">
          <TrendingUp className="w-3 h-3" />
          <span>طلب خاص</span>
        </div>
      </div>

      {/* Sold Out Badge */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-white text-xl font-black">نفذت الكمية</div>
          </div>
        </div>
      )}

      {/* Almost Full Badge */}
      {!isSoldOut && isAlmostFull && (
        <div className="absolute top-4 right-4 z-10">
          <div className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>كمية محدودة!</span>
          </div>
        </div>
      )}

      {/* Image */}
      <Link href={`/special-orders/${order.id}`}>
        <div className="relative h-56 bg-gradient-to-br from-amber-100 to-orange-200 overflow-hidden">
          {order.image ? (
            <Image
              src={order.image}
              alt={order.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl">⭐</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            {order.category}
          </span>
          <div className="flex items-center gap-1 text-orange-600">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold">
              {formatDate(order.startDate)} - {formatDate(order.endDate)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/special-orders/${order.id}`}>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-2">
            {order.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-3">
          {order.description}
        </p>

        {/* Chef Info */}
        <Link
          href={`/chef/${order.chefId}`}
          className="flex items-center gap-2 mb-4 hover:text-emerald-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
            {order.chefName.charAt(0)}
          </div>
          <span className="text-sm font-medium text-gray-700">{order.chefName}</span>
        </Link>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-gray-700">
              <Users className="w-3 h-3 inline ml-1" />
              {currentOrders} / {maxOrders} طلب
            </span>
            <span className={`font-bold ${isSoldOut ? 'text-red-600' : isAlmostFull ? 'text-orange-600' : 'text-emerald-600'}`}>
              {isSoldOut ? 'نفذت' : `متبقي ${remaining}`}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isSoldOut
                  ? 'bg-red-500'
                  : isAlmostFull
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${Math.min(percentageSold, 100)}%` }}
            />
          </div>
        </div>

        {/* Delivery Info */}
        {order.deliveryGovernorates && order.deliveryGovernorates.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <MapPin className="w-3 h-3" />
              <span className="font-medium">متوفر في:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {order.deliveryGovernorates.slice(0, 3).map((gov, index) => (
                <span key={index} className="px-2 py-0.5 bg-white text-gray-700 text-xs rounded-full border border-gray-200">
                  {gov}
                </span>
              ))}
              {order.deliveryGovernorates.length > 3 && (
                <span className="px-2 py-0.5 bg-white text-gray-500 text-xs rounded-full border border-gray-200">
                  +{order.deliveryGovernorates.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {order.price.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500">دينار كويتي</div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group ${
              isSoldOut
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isAdded
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
            }`}
          >
            {isAdded ? (
              <>
                <span className="text-xl">✓</span>
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{isSoldOut ? 'نفذت' : 'إضافة'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
