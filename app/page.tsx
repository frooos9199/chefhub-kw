'use client';

import { ChefHat, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Dish } from '@/types';

interface DishWithChef extends Dish {
  chefName?: string;
}

interface AdBanner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [dishes, setDishes] = useState<DishWithChef[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    const fetchLatestDishes = async () => {
      try {
        // جلب أحدث 20 صنف متاح
        const dishesRef = collection(db, 'dishes');
        const q = query(
          dishesRef,
          where('isAvailable', '==', true),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const dishesSnapshot = await getDocs(q);
        const dishesData = dishesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DishWithChef[];

        // جلب أسماء الشيفات
        const chefIds = [...new Set(dishesData.map(d => d.chefId))];
        const chefsMap: { [key: string]: string } = {};
        
        for (const chefId of chefIds) {
          try {
            const chefSnapshot = await getDocs(
              query(collection(db, 'chefs'), limit(100))
            );
            chefSnapshot.forEach(doc => {
              if (doc.id === chefId) {
                chefsMap[chefId] = doc.data().name || 'شيف';
              }
            });
          } catch (error) {
            console.error('Error fetching chef:', error);
          }
        }

        // إضافة أسماء الشيفات للأصناف
        const dishesWithChefs = dishesData.map(dish => ({
          ...dish,
          chefName: chefsMap[dish.chefId] || 'شيف مميز'
        }));

        setDishes(dishesWithChefs);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      } finally {
        setLoadingDishes(false);
      }
    };

    const fetchBanners = async () => {
      try {
        const bannersRef = collection(db, 'banners');
        const q = query(
          bannersRef,
          where('isActive', '==', true),
          orderBy('order', 'asc')
        );
        
        const bannersSnapshot = await getDocs(q);
        const bannersData = bannersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdBanner[];

        setBanners(bannersData);
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchLatestDishes();
    fetchBanners();
  }, []);

  // Auto-rotate banners كل 5 ثواني
  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ChefHat className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ChefHub
                </h1>
                <span className="text-xs text-emerald-600 font-medium">مركز الشيفات</span>
              </div>
            </div>
            <div className="flex gap-3">
              {!loading && user && userData ? (
                <>
                  <span className="px-4 py-2.5 text-sm text-gray-700">
                    مرحباً، <span className="font-bold text-emerald-600">{userData.name}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl border-2 border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-xl border-2 border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/auth/register/customer"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 transition-all"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Ads Banner Slider */}
      <section className="relative bg-gray-900">
        <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden bg-gray-800">
          {banners.length > 0 ? (
            <>
              {/* الصور */}
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {banner.link ? (
                    <Link href={banner.link} className="block w-full h-full">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || 'إعلان'}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'auto' }}
                      />
                    </Link>
                  ) : (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || 'إعلان'}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'auto' }}
                    />
                  )}
                </div>
              ))}

              {/* Navigation Arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentBannerIndex
                          ? 'bg-white w-8 h-3'
                          : 'bg-white/50 w-3 h-3 hover:bg-white/70'
                      }`}
                      aria-label={`صورة ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Default banner إذا ما في إعلانات
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-3xl md:text-5xl font-black mb-3">مرحباً بكم في ChefHub</h2>
                <p className="text-lg md:text-2xl font-semibold">أشهى الأطباق من أفضل الشيفات 🇰🇼</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content - Carousel */}
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {loadingDishes ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600 font-semibold text-lg">جاري تحميل الأصناف...</p>
            </div>
          ) : dishes.length > 0 ? (
            <div className="space-y-8">
              {/* Dishes Grid with Banners */}
              <div className="space-y-6">
                {/* نقسم الأصناف إلى مجموعات من 6 */}
                {Array.from({ length: Math.ceil(dishes.length / 6) }).map((_, groupIndex) => {
                  const startIdx = groupIndex * 6;
                  const groupDishes = dishes.slice(startIdx, startIdx + 6);
                  const bannerIndex = groupIndex % banners.length;
                  
                  return (
                    <div key={groupIndex}>
                      {/* 6 أصناف */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {groupDishes.map((dish) => (
                          <Link
                            key={dish.id}
                            href={`/dishes/${dish.id}`}
                            className="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 aspect-square"
                          >
                            {/* صورة الصنف */}
                            <div className="absolute inset-0">
                              {dish.images && dish.images[0] ? (
                                <img
                                  src={dish.images[0]}
                                  alt={dish.nameAr}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                  <ChefHat className="w-24 h-24 text-white opacity-50" />
                                </div>
                              )}
                            </div>

                            {/* Overlay مع اسم الشيف */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                              {/* السعر - أعلى اليمين */}
                              <div className="absolute top-3 right-3">
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-xl">
                                  <span className="text-sm font-black text-emerald-600">
                                    {dish.price.toFixed(3)} د.ك
                                  </span>
                                </div>
                              </div>

                              {/* اسم الشيف - أعلى اليسار */}
                              <div className="absolute top-3 left-3">
                                <div className="bg-emerald-600/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-1.5">
                                  <ChefHat className="w-3.5 h-3.5 text-white" />
                                  <span className="text-xs font-bold text-white">
                                    {dish.chefName}
                                  </span>
                                </div>
                              </div>

                              {/* المعلومات - أسفل */}
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                {/* اسم الصنف */}
                                <h3 className="text-white text-lg lg:text-xl font-black mb-1 drop-shadow-lg line-clamp-1">
                                  {dish.nameAr}
                                </h3>
                                
                                {/* الفئة */}
                                <div className="inline-block">
                                  <span className="text-xs font-semibold text-white/90 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                                    {dish.category}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* تأثير Hover */}
                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300"></div>
                          </Link>
                        ))}
                      </div>

                      {/* بنر إعلاني بعد كل 6 أصناف (إذا في بنرات وفي أصناف بعد) */}
                      {banners.length > 0 && startIdx + 6 < dishes.length && (
                        <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-3xl shadow-2xl mb-6">
                          {banners[bannerIndex]?.link ? (
                            <Link href={banners[bannerIndex].link} className="block w-full h-full">
                              <img
                                src={banners[bannerIndex].imageUrl}
                                alt={banners[bannerIndex].title || 'إعلان'}
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'auto' }}
                              />
                            </Link>
                          ) : (
                            <img
                              src={banners[bannerIndex]?.imageUrl}
                              alt={banners[bannerIndex]?.title || 'إعلان'}
                              className="w-full h-full object-cover"
                              style={{ imageRendering: 'auto' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* عداد الأصناف */}
              <div className="text-center">
                <p className="text-gray-600 font-semibold">
                  عرض {dishes.length} صنف
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block rounded-3xl bg-white p-12 shadow-2xl">
                <ChefHat className="w-32 h-32 text-gray-300 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-gray-800 mb-3">
                  لا توجد أصناف متاحة حالياً
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  قريباً ستجد أشهى الأطباق من أفضل الشيفات
                </p>
                <Link
                  href="/auth/register/chef"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  انضم كشيف الآن
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 py-8">
        <div className="container mx-auto px-4">
          {/* Developer Credit */}
          <div className="flex justify-center">
            <a 
              href="https://nexdev-portfolio-one.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-white px-6 py-3 shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Developed by</span>
              </div>
              <span className="font-black text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:via-teal-700 group-hover:to-cyan-700">
                NexDev
              </span>
              <svg className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
