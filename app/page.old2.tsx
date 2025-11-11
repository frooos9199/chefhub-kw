'use client';

import { ChefHat, LogOut, Settings, Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CartButton } from '@/components/CartButton';
import { CartSidebar } from '@/components/CartSidebar';

interface Chef {
  id: string;
  name: string;
  profileImage?: string;
  specialty: string[];
  rating: number;
  totalOrders: number;
}

interface Dish {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  images: string[];
  chefId: string;
  chefName: string;
  rating?: number;
}

interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top chefs
        const chefsRef = collection(db, 'chefs');
        const chefsQuery = query(
          chefsRef,
          where('status', '==', 'approved'),
          orderBy('rating', 'desc'),
          limit(6)
        );
        const chefsSnapshot = await getDocs(chefsQuery);
        const chefsData = chefsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chef[];
        setChefs(chefsData);

        // Fetch popular dishes
        const dishesRef = collection(db, 'dishes');
        const dishesQuery = query(
          dishesRef,
          where('isAvailable', '==', true),
          orderBy('createdAt', 'desc'),
          limit(12)
        );
        const dishesSnapshot = await getDocs(dishesQuery);
        const dishesData = dishesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dish[];
        setDishes(dishesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Header - Sticky */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b-2 border-emerald-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                    ChefHub
                  </h1>
                  <span className="text-xs text-emerald-600 font-semibold">مركز الشيفات</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!loading && user && userData ? (
                  <>
                    <Link
                      href="/settings"
                      className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <Settings className="w-5 h-5 text-gray-700" />
                    </Link>
                    <CartButton onClick={() => setIsCartOpen(true)} />
                    <button
                      onClick={handleSignOut}
                      className="p-2.5 rounded-xl border-2 border-red-200 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-5 h-5 text-red-600" />
                    </button>
                  </>
                ) : (
                  <>
                    <CartButton onClick={() => setIsCartOpen(true)} />
                    <Link
                      href="/auth/login"
                      className="px-4 py-2.5 rounded-xl border-2 border-emerald-200 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-all"
                    >
                      دخول
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - MOBILE OPTIMIZED */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-2xl mx-auto">
              {/* Icon */}
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <ChefHat className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              
              {/* Title */}
              <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                أشهى الأطباق من
                <br />
                <span className="text-yellow-300">مطابخ كويتية أصيلة</span>
              </h2>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                اطلب من أفضل الشيفات المنزليين واستمتع بطعم البيت
              </p>

              {/* Search Bar - MOBILE FRIENDLY */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن طبقك المفضل..."
                    className="w-full px-6 py-4 pr-14 rounded-2xl text-gray-900 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-yellow-300">{chefs.length}+</div>
                  <div className="text-sm text-white/80 mt-1">شيف محترف</div>
                </div>
                <div className="text-center border-x-2 border-white/20">
                  <div className="text-3xl md:text-4xl font-black text-yellow-300">{dishes.length}+</div>
                  <div className="text-sm text-white/80 mt-1">طبق متنوع</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-yellow-300">4.9</div>
                  <div className="text-sm text-white/80 mt-1">تقييم عام</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#f0fdfa"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-20">
          
          {/* Featured Chefs Section - MOBILE OPTIMIZED */}
          <div className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900">
                ⭐ الشيفات المميزين
              </h3>
              <Link href="/chefs" className="text-emerald-600 font-bold text-sm hover:text-emerald-700">
                عرض الكل ←
              </Link>
            </div>

            {/* Chefs Grid - 2 columns on mobile, 3 on tablet, 6 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {chefs.map((chef) => (
                <Link 
                  key={chef.id} 
                  href={`/chefs/${chef.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
                    {/* Chef Image - Circular */}
                    <div className="relative w-full aspect-square mb-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-20 group-hover:opacity-30 transition-all"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                        {chef.profileImage ? (
                          <img
                            src={chef.profileImage}
                            alt={chef.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <span className="text-4xl">👨‍🍳</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chef Info */}
                    <div className="text-center">
                      <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">
                        {chef.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {chef.specialty[0]}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">{chef.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({chef.totalOrders})</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Dishes Section - MOBILE OPTIMIZED */}
          <div className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900">
                🔥 الأطباق الأكثر طلباً
              </h3>
              <Link href="/dishes" className="text-emerald-600 font-bold text-sm hover:text-emerald-700">
                عرض الكل ←
              </Link>
            </div>

            {/* Dishes Grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dishes.map((dish) => (
                <Link 
                  key={dish.id} 
                  href={`/dishes/${dish.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-2">
                    {/* Dish Image - Large and prominent */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
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
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </div>

                    {/* Dish Info */}
                    <div className="p-5">
                      {/* Dish Name */}
                      <h4 className="font-black text-gray-900 text-lg mb-2 line-clamp-1">
                        {dish.nameAr}
                      </h4>
                      
                      {/* Chef Name */}
                      <div className="flex items-center gap-2 mb-3">
                        <ChefHat className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 line-clamp-1">{dish.chefName}</span>
                      </div>

                      {/* Price and Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-emerald-600">
                            {dish.price.toFixed(3)}
                          </span>
                          <span className="text-sm text-gray-500 font-bold">د.ك</span>
                        </div>
                        {dish.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-900 text-sm">{dish.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105">
                        <ShoppingCart className="w-5 h-5" />
                        <span>أضف للسلة</span>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loadingData && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-bold">جاري تحميل الأطباق...</p>
            </div>
          )}

          {/* Empty State */}
          {!loadingData && dishes.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد أطباق متوفرة حالياً</h3>
              <p className="text-gray-600">تحقق مرة أخرى قريباً</p>
            </div>
          )}

        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
