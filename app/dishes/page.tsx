'use client';

import { Star, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Dish {
  id: string;
  nameAr: string;
  price: number;
  images: string[];
  chefId: string;
  chefName: string;
  rating?: number;
  category?: string;
}

export default function DishesPage() {
  const { user, userData } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const dishesRef = collection(db, 'dishes');
        const dishesQuery = query(
          dishesRef,
          where('isAvailable', '==', true),
          orderBy('createdAt', 'desc')
        );
        const dishesSnapshot = await getDocs(dishesQuery);
        const dishesData = dishesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dish[];
        setDishes(dishesData);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-6">
            <ArrowRight className="w-5 h-5" />
            الرجوع للصفحة الرئيسية
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">جميع المنتجات</h1>
            <p className="text-gray-600">تصفح أشهى الأطباق من مختلف الشيفات</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-bold">جاري التحميل...</p>
            </div>
          )}

          {/* Dishes Grid */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {dishes.map((dish) => (
                <Link key={dish.id} href={`/dishes/${dish.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                      {dish.images && dish.images.length > 0 ? (
                        <img 
                          src={dish.images[0]} 
                          alt={dish.nameAr} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                          <span className="text-6xl">🍽️</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-gray-900 text-base md:text-lg mb-2 line-clamp-1">{dish.nameAr}</h3>
                      <div className="inline-block px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg mb-3">
                        <p className="text-xs md:text-sm text-white font-bold line-clamp-1">{dish.chefName}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xl md:text-2xl font-black text-emerald-600">
                            {dish.price.toFixed(3)}
                          </span>
                          <span className="text-xs text-gray-500">د.ك</span>
                        </div>
                        {dish.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-900 text-sm">{dish.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && dishes.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات حالياً</h3>
              <p className="text-gray-600">جاري إضافة منتجات جديدة قريباً</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
