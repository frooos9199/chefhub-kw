'use client';

import { Star, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DishCard } from '@/components/DishCard';

interface Dish {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  chefId: string;
  chefName: string;
  chefImage?: string;
  chefDishesCount?: number;
  rating: number;
  totalOrders: number;
  prepTime?: number;
  deliveryFee?: number;
  servingSize?: string;
  createdAt?: any;
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
          where('isActive', '==', true),
          where('isAvailable', '==', true),
          orderBy('createdAt', 'desc')
        );
        const dishesSnapshot = await getDocs(dishesQuery);
        
        // جلب الأطباق مع معلومات الشيف
        const dishesData = await Promise.all(
          dishesSnapshot.docs.map(async (dishDoc) => {
            const dishData = { 
              id: dishDoc.id, 
              ...dishDoc.data(),
              name: dishDoc.data().nameAr || dishDoc.data().name,
              description: dishDoc.data().descriptionAr || dishDoc.data().description || '',
              rating: dishDoc.data().rating || 4.5,
              totalOrders: dishDoc.data().totalOrders || 0
            } as Dish;
            
            // جلب معلومات الشيف
            if (dishData.chefId) {
              try {
                const chefDoc = await getDoc(doc(db, 'chefs', dishData.chefId));
                if (chefDoc.exists()) {
                  const chefData = chefDoc.data();
                  dishData.chefName = chefData.name || dishData.chefName;
                  dishData.chefImage = chefData.profileImage;
                  
                  // حساب عدد منتجات الشيف
                  const chefDishesQuery = query(
                    collection(db, 'dishes'),
                    where('chefId', '==', dishData.chefId),
                    where('isActive', '==', true),
                    where('isAvailable', '==', true)
                  );
                  const chefDishesSnapshot = await getDocs(chefDishesQuery);
                  dishData.chefDishesCount = chefDishesSnapshot.size;
                }
              } catch (error) {
                console.error('Error fetching chef data:', error);
              }
            }
            
            return dishData;
          })
        );
        
        setDishes(dishesData);
      } catch (error: any) {
        const message = String(error?.message || '');
        const code = String(error?.code || '');
        const isIndexBuildingError =
          code === 'failed-precondition' &&
          /requires an index|index is currently building/i.test(message);

        if (isIndexBuildingError) {
          try {
            const dishesRef = collection(db, 'dishes');
            const fallbackQuery = query(
              dishesRef,
              where('isActive', '==', true),
              where('isAvailable', '==', true),
              limit(200)
            );
            const fallbackSnapshot = await getDocs(fallbackQuery);

            const toMillis = (value: any) => {
              if (!value) return 0;
              if (typeof value?.toMillis === 'function') return value.toMillis();
              if (typeof value?.seconds === 'number') return value.seconds * 1000;
              if (typeof value === 'number') return value;
              return 0;
            };

            const dishesData = await Promise.all(
              fallbackSnapshot.docs.map(async (dishDoc) => {
                const dishData = {
                  id: dishDoc.id,
                  ...dishDoc.data(),
                  name: dishDoc.data().nameAr || dishDoc.data().name,
                  description: dishDoc.data().descriptionAr || dishDoc.data().description || '',
                  rating: dishDoc.data().rating || 4.5,
                  totalOrders: dishDoc.data().totalOrders || 0,
                } as Dish;

                if (dishData.chefId) {
                  try {
                    const chefDoc = await getDoc(doc(db, 'chefs', dishData.chefId));
                    if (chefDoc.exists()) {
                      const chefData = chefDoc.data();
                      dishData.chefName = chefData.name || dishData.chefName;
                      dishData.chefImage = chefData.profileImage;

                      const chefDishesQuery = query(
                        collection(db, 'dishes'),
                        where('chefId', '==', dishData.chefId),
                        where('isActive', '==', true),
                        where('isAvailable', '==', true)
                      );
                      const chefDishesSnapshot = await getDocs(chefDishesQuery);
                      dishData.chefDishesCount = chefDishesSnapshot.size;
                    }
                  } catch (innerError) {
                    console.error('Error fetching chef data:', innerError);
                  }
                }

                return dishData;
              })
            );

            dishesData.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
            setDishes(dishesData);
            return;
          } catch (fallbackError) {
            console.error('Fallback dishes query failed:', fallbackError);
          }
        }

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
            <p className="text-gray-600">تصفح أشهى الأطباق من مختلف الشيف</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
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
