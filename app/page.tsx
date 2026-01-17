'use client';

import { Star, Users, Package, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  price: number;
  images: string[];
  chefId: string;
  chefName: string;
  rating?: number;
  prepTime?: number;
  deliveryFee?: number;
  totalOrders?: number;
  servingSize?: string;
}

interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
  order: number;
}

interface SpecialOrder {
  id: string;
  title: string;
  titleEn: string;
  price: number;
  originalPrice?: number;
  image: string;
  chefId: string;
  chefName: string;
  chefImage?: string;
  startDate: Date;
  endDate: Date;
  maxOrders: number;
  currentOrders: number;
}

export default function Home() {
  const { user, userData, loading } = useAuth();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [specialOrders, setSpecialOrders] = useState<SpecialOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch chefs from Firestore
  // Duplicate declaration removed

  useEffect(() => {
    const fetchChefs = async () => {
      const snapshot = await getDocs(collection(db, 'chefs'));
      const chefsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          profileImage: data.profileImage || '/default-chef-avatar.png',
          specialty: data.specialty || [],
          rating: data.rating || 0,
          totalOrders: data.totalOrders || 0
        };
      });
      setChefs(chefsData);
    };
    fetchChefs();
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch banners
        const bannersRef = collection(db, 'banners');
        const bannersQuery = query(
          bannersRef,
          where('isActive', '==', true),
          orderBy('order', 'asc'),
          limit(10)
        );
        const bannersSnapshot = await getDocs(bannersQuery);
        const bannersData = bannersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Banner[];
        
        setBanners(bannersData);
        
        // Fetch special orders (active and not expired)
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const specialOrdersRef = collection(db, 'special_orders');
          const specialOrdersQuery = query(
            specialOrdersRef,
            where('isActive', '==', true),
            where('endDate', '>=', Timestamp.fromDate(today)),
            orderBy('endDate', 'asc'),
            limit(6)
          );
          const specialOrdersSnapshot = await getDocs(specialOrdersQuery);
          const specialOrdersData = await Promise.all(
            specialOrdersSnapshot.docs.map(async (orderDoc) => {
              const orderData = orderDoc.data();
              
              // Get chef info
              try {
                const chefDoc = await getDoc(doc(db, 'chefs', orderData.chefId));
                const chefData = chefDoc.data();
                
                return {
                  id: orderDoc.id,
                  title: orderData.title,
                  titleEn: orderData.titleEn,
                  price: orderData.price,
                  originalPrice: orderData.originalPrice,
                  image: orderData.image,
                  chefId: orderData.chefId,
                  chefName: chefData?.name || orderData.chefName,
                  chefImage: chefData?.profileImage,
                  startDate: orderData.startDate?.toDate?.() || new Date(orderData.startDate),
                  endDate: orderData.endDate?.toDate?.() || new Date(orderData.endDate),
                  maxOrders: orderData.maxOrders,
                  currentOrders: orderData.currentOrders || 0,
                } as SpecialOrder;
              } catch (chefError) {
                console.error('Error fetching chef for special order:', chefError);
                return {
                  id: orderDoc.id,
                  title: orderData.title,
                  titleEn: orderData.titleEn,
                  price: orderData.price,
                  originalPrice: orderData.originalPrice,
                  image: orderData.image,
                  chefId: orderData.chefId,
                  chefName: orderData.chefName || 'شيف',
                  chefImage: '',
                  startDate: orderData.startDate?.toDate?.() || new Date(orderData.startDate),
                  endDate: orderData.endDate?.toDate?.() || new Date(orderData.endDate),
                  maxOrders: orderData.maxOrders,
                  currentOrders: orderData.currentOrders || 0,
                } as SpecialOrder;
              }
            })
          );
          setSpecialOrders(specialOrdersData);
          console.log('✅ Special orders loaded:', specialOrdersData.length);
        } catch (specialOrdersError) {
          console.error('⚠️ Error fetching special orders:', specialOrdersError);
          setSpecialOrders([]);
        }

        // Fetch approved chefs
        const chefsRef = collection(db, 'chefs');
        const chefsQuery = query(
          chefsRef,
          where('status', '==', 'approved'),
          orderBy('rating', 'desc'),
          limit(12)
        );
        const chefsSnapshot = await getDocs(chefsQuery);
        const chefsData = chefsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            profileImage: data.profileImage && data.profileImage.trim() !== '' ? data.profileImage : '/default-chef-avatar.png',
            specialty: data.specialty || [],
            rating: data.rating || 0,
            totalOrders: data.totalOrders || 0
          };
        });
        console.log('Chefs loaded:', chefsData.length, chefsData);
        
        // Use dummy chefs if no data from Firebase
  setChefs(chefsData);

        // Fetch dishes
        const dishesRef = collection(db, 'dishes');
        const dishesQuery = query(
          dishesRef,
          where('isAvailable', '==', true),
          orderBy('createdAt', 'desc'),
          limit(16)
        );
        const dishesSnapshot = await getDocs(dishesQuery);
        const dishesData = await Promise.all(
          dishesSnapshot.docs.map(async (dishDoc) => {
            const dishData = { id: dishDoc.id, ...dishDoc.data() } as Dish;
            
            // جلب معلومات الشيف لكل منتج
            if (dishData.chefId) {
              try {
                const chefDocRef = doc(db, 'chefs', dishData.chefId);
                const chefDocSnap = await getDoc(chefDocRef);
                if (chefDocSnap.exists()) {
                  const chefData = chefDocSnap.data();
                  dishData.chefName = chefData.name || dishData.chefName;
                  
                  // إضافة صورة الشيف
                  (dishData as any).chefImage = chefData.profileImage;
                  
                  // حساب عدد منتجات الشيف
                  const chefDishesQuery = query(
                    collection(db, 'dishes'),
                    where('chefId', '==', dishData.chefId),
                    where('isAvailable', '==', true)
                  );
                  const chefDishesSnapshot = await getDocs(chefDishesQuery);
                  (dishData as any).chefDishesCount = chefDishesSnapshot.size;
                }
              } catch (error) {
                console.error('Error fetching chef data for dish:', dishData.id, error);
              }
            }
            
            return dishData;
          })
        );
        console.log('Dishes loaded with chef data:', dishesData.length, dishesData);
        
        setDishes(dishesData);
        
        console.log('✅ Data loaded successfully:', {
          banners: bannersData.length,
          specialOrders: specialOrders.length,
          chefs: chefsData.length,
          dishes: dishesData.length
        });
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setBanners([]);
        setChefs([]);
        setDishes([]);
        setSpecialOrders([]);
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
          <p className="text-gray-600 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Split data into chunks
  const chefsChunk1 = chefs.slice(0, 4);
  const chefsChunk2 = chefs.slice(4, 8);
  const chefsChunk3 = chefs.slice(8, 12);
  
  const dishesChunk1 = dishes.slice(0, 4);
  const dishesChunk2 = dishes.slice(4, 8);
  const dishesChunk3 = dishes.slice(8, 12);
  
  console.log('📊 Display chunks:', {
    chefs: chefs.length,
    dishes: dishes.length,
    specialOrders: specialOrders.length,
    dishesChunk1: dishesChunk1.length,
    dishesChunk2: dishesChunk2.length,
    dishesChunk3: dishesChunk3.length,
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large floating circles */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-400/40 to-teal-400/40 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/4 -left-48 w-[32rem] h-[32rem] bg-gradient-to-br from-teal-300/30 to-cyan-300/30 rounded-full blur-3xl animate-float-slow delay-1000"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/35 to-emerald-400/35 rounded-full blur-3xl animate-float-fast delay-2000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-emerald-300/25 to-teal-300/25 rounded-full blur-2xl animate-float delay-3000"></div>
          
          {/* Small floating circles */}
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl animate-pulse-scale"></div>
          <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-teal-400/20 rounded-full blur-xl animate-pulse-scale delay-1000"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl animate-pulse-scale delay-2000"></div>
          
          {/* Rotating gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-gradient opacity-50"></div>
        </div>

        {/* Main Content */}
        <div className="w-full relative z-10">
          
          {/* 1. TWO ACTION BUTTONS - في الأعلى */}
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/chefs" className="group">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 md:p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  <div className="flex flex-col items-center text-center gap-2 md:gap-3 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Users className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-xl font-black">الشيفات</h3>
                    <p className="text-xs md:text-sm text-white/90">تصفح جميع الشيفات</p>
                  </div>
                </div>
              </Link>

              <Link href="/dishes" className="group">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 md:p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  <div className="flex flex-col items-center text-center gap-2 md:gap-3 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Package className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-xl font-black">المنتجات</h3>
                    <p className="text-xs md:text-sm text-white/90">تصفح جميع الأطباق</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* 2. FIRST BANNER - بعد الأزرار */}
          {banners[0] && (
            <div className="w-full px-4">
              <Link href={banners[0].link || '#'}>
                <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={banners[0].imageUrl}
                    alt={banners[0].title || 'Banner'}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>
          )}

          {/* 3. FIRST CHEFS (4) */}
          {chefsChunk1.length > 0 && (
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chefsChunk1.map((chef) => (
                  <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                    <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
                      <div className="relative w-full aspect-square mb-3">
                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                          {chef.profileImage ? (
                            <img src={chef.profileImage} alt={chef.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                              <span className="text-4xl">👨‍🍳</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{chef.name}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{chef.specialty[0]}</p>
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900">{chef.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 4. SECOND BANNER */}
          {banners[1] && (
            <div className="w-full px-4 py-4">
              <Link href={banners[1].link || '#'}>
                <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl bg-gray-100">
                  <img src={banners[1].imageUrl} alt={banners[1].title || 'Banner'} className="w-full h-full object-contain" />
                </div>
              </Link>
            </div>
          )}
          
          {/* 5. SPECIAL ORDERS - العروض الخاصة */}
          {specialOrders.length > 0 && (
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">العروض الخاصة</h2>
                    <p className="text-sm text-gray-600">عروض محدودة - لفترة محدودة</p>
                  </div>
                </div>
                <Link href="/special-orders" className="text-sm font-bold text-amber-600 hover:text-amber-700">
                  عرض الكل ←
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specialOrders.map((order) => {
                  const now = new Date();
                  const daysLeft = Math.ceil((order.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const progress = (order.currentOrders / order.maxOrders) * 100;
                  
                  return (
                    <Link key={order.id} href={`/special-orders/${order.id}`} className="group">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-amber-200 hover:border-amber-300 hover:-translate-y-1 relative">
                        {/* Discount Badge */}
                        {order.originalPrice && order.originalPrice > order.price && (
                          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-black">
                            -{Math.round(((order.originalPrice - order.price) / order.originalPrice) * 100)}%
                          </div>
                        )}
                        
                        {/* Image */}
                        <div className="relative w-full aspect-square bg-gradient-to-br from-amber-50 to-orange-50">
                          {order.image ? (
                            <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="w-12 h-12 text-amber-300" />
                            </div>
                          )}
                          {/* Time Left Badge */}
                          <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysLeft > 0 ? `${daysLeft} يوم` : 'ينتهي اليوم'}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-3">
                          <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{order.title}</h4>
                          
                          {/* Chef */}
                          <div className="flex items-center gap-2 mb-2">
                            {order.chefImage ? (
                              <img src={order.chefImage} alt={order.chefName} className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                            )}
                            <span className="text-xs text-gray-600 line-clamp-1">{order.chefName}</span>
                          </div>
                          
                          {/* Price */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-black text-amber-600">{order.price.toFixed(3)}</span>
                            {order.originalPrice && order.originalPrice > order.price && (
                              <span className="text-xs text-gray-400 line-through">{order.originalPrice.toFixed(3)}</span>
                            )}
                            <span className="text-xs text-gray-500">د.ك</span>
                          </div>
                          
                          {/* Progress */}
                          <div>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>{order.currentOrders} / {order.maxOrders}</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  progress >= 80 ? 'bg-red-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. FIRST DISHES (4) */}
          {dishesChunk1.length > 0 && (
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dishesChunk1.map((dish) => (
                  <Link key={dish.id} href={`/dishes/${dish.id}`} className="group">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                        {dish.images && dish.images.length > 0 ? (
                          <img src={dish.images[0]} alt={dish.nameAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <span className="text-5xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 md:p-3">
                        <h4 className="font-black text-gray-900 text-xs md:text-sm mb-1 md:mb-2 line-clamp-1">{dish.nameAr}</h4>
                        <div className="inline-block px-1.5 md:px-2 py-0.5 md:py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg mb-1 md:mb-2">
                          <p className="text-[10px] md:text-xs text-white font-bold line-clamp-1">{dish.chefName}</p>
                        </div>
                        {dish.servingSize && (
                          <div className="text-[10px] md:text-xs text-gray-600 mb-1 md:mb-2">
                            <span className="font-semibold">الحجم:</span> {dish.servingSize}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-base md:text-lg font-black text-emerald-600">{dish.price.toFixed(3)} <span className="text-[10px] md:text-xs">د.ك</span></span>
                          {dish.rating && (
                            <div className="flex items-center gap-0.5 md:gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-gray-900 text-[10px] md:text-xs">{dish.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 6. THIRD BANNER */}
          {banners[2] && (
            <div className="w-full px-4 py-4">
              <Link href={banners[2].link || '#'}>
                <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl bg-gray-100">
                  <img src={banners[2].imageUrl} alt={banners[2].title || 'Banner'} className="w-full h-full object-contain" />
                </div>
              </Link>
            </div>
          )}

          {/* 7. SECOND CHEFS (4) */}
          {chefsChunk2.length > 0 && (
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chefsChunk2.map((chef) => (
                  <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                    <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
                      <div className="relative w-full aspect-square mb-3">
                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                          {chef.profileImage ? (
                            <img src={chef.profileImage} alt={chef.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                              <span className="text-4xl">👨‍🍳</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{chef.name}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{chef.specialty[0]}</p>
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900">{chef.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 8. FOURTH BANNER */}
          {banners[3] && (
            <div className="w-full px-4 py-4">
              <Link href={banners[3].link || '#'}>
                <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl bg-gray-100">
                  <img src={banners[3].imageUrl} alt={banners[3].title || 'Banner'} className="w-full h-full object-contain" />
                </div>
              </Link>
            </div>
          )}

          {/* 9. SECOND DISHES (4) */}
          {dishesChunk2.length > 0 && (
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dishesChunk2.map((dish) => (
                  <Link key={dish.id} href={`/dishes/${dish.id}`} className="group">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                        {dish.images && dish.images.length > 0 ? (
                          <img src={dish.images[0]} alt={dish.nameAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <span className="text-5xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-black text-gray-900 text-sm mb-2 line-clamp-1">{dish.nameAr}</h4>
                        <div className="inline-block px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mb-2">
                          <p className="text-xs text-white font-bold line-clamp-1">{dish.chefName}</p>
                        </div>
                        {dish.servingSize && (
                          <div className="text-xs text-gray-600 mb-2">
                            <span className="font-semibold">الحجم:</span> {dish.servingSize}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-emerald-600">{dish.price.toFixed(3)} <span className="text-xs">د.ك</span></span>
                          {dish.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-gray-900 text-xs">{dish.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loadingData && (
            <div className="container mx-auto px-4 text-center py-20">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-bold">جاري التحميل...</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
