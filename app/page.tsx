'use client';

import { Star, Users, Package } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
}

interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
  order: number;
}

export default function Home() {
  const { user, userData, loading } = useAuth();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch chefs from Firestore
  const [chefs, setChefs] = useState<Chef[]>([]);

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

  const dummyDishes: Dish[] = [
    { id: '1', nameAr: 'مجبوس دجاج', price: 4.500, images: ['https://via.placeholder.com/400x400/10b981/ffffff?text=مجبوس+دجاج'], chefId: '1', chefName: 'الشيف أحمد محمد', rating: 4.8 },
    { id: '2', nameAr: 'كنافة نابلسية', price: 3.000, images: ['https://via.placeholder.com/400x400/14b8a6/ffffff?text=كنافة+نابلسية'], chefId: '2', chefName: 'الشيف فاطمة العلي', rating: 4.9 },
    { id: '3', nameAr: 'مشاوي مشكلة', price: 6.500, images: ['https://via.placeholder.com/400x400/059669/ffffff?text=مشاوي+مشكلة'], chefId: '3', chefName: 'الشيف محمد الخالد', rating: 4.7 },
    { id: '4', nameAr: 'فطائر السبانخ', price: 2.500, images: ['https://via.placeholder.com/400x400/0d9488/ffffff?text=فطائر+السبانخ'], chefId: '4', chefName: 'الشيف نورة السالم', rating: 4.6 },
    { id: '5', nameAr: 'باستا كاربونارا', price: 5.000, images: ['https://via.placeholder.com/400x400/10b981/ffffff?text=باستا+كاربونارا'], chefId: '5', chefName: 'الشيف عبدالله العتيبي', rating: 4.8 },
    { id: '6', nameAr: 'تشيز كيك', price: 3.500, images: ['https://via.placeholder.com/400x400/14b8a6/ffffff?text=تشيز+كيك'], chefId: '6', chefName: 'الشيف مريم الرشيد', rating: 4.9 },
    { id: '7', nameAr: 'سوشي رول', price: 7.000, images: ['https://via.placeholder.com/400x400/059669/ffffff?text=سوشي+رول'], chefId: '7', chefName: 'الشيف خالد المطيري', rating: 4.7 },
    { id: '8', nameAr: 'سلطة سيزر', price: 3.000, images: ['https://via.placeholder.com/400x400/0d9488/ffffff?text=سلطة+سيزر'], chefId: '8', chefName: 'الشيف هند الدوسري', rating: 4.8 },
    { id: '9', nameAr: 'كبسة لحم', price: 5.500, images: ['https://via.placeholder.com/400x400/f59e0b/ffffff?text=كبسة+لحم'], chefId: '9', chefName: 'الشيف سعود القحطاني', rating: 4.9 },
    { id: '10', nameAr: 'بسبوسة بالقشطة', price: 2.800, images: ['https://via.placeholder.com/400x400/ec4899/ffffff?text=بسبوسة+بالقشطة'], chefId: '10', chefName: 'الشيف ريم الشمري', rating: 4.6 },
    { id: '11', nameAr: 'صيادية سمك', price: 6.000, images: ['https://via.placeholder.com/400x400/3b82f6/ffffff?text=صيادية+سمك'], chefId: '11', chefName: 'الشيف طارق الحربي', rating: 4.7 },
    { id: '12', nameAr: 'خبز تنور طازج', price: 1.500, images: ['https://via.placeholder.com/400x400/8b5cf6/ffffff?text=خبز+تنور'], chefId: '12', chefName: 'الشيف لطيفة العنزي', rating: 4.8 },
    { id: '13', nameAr: 'برياني دجاج', price: 4.800, images: ['https://via.placeholder.com/400x400/ef4444/ffffff?text=برياني+دجاج'], chefId: '1', chefName: 'الشيف أحمد محمد', rating: 4.7 },
    { id: '14', nameAr: 'لقيمات بالعسل', price: 2.200, images: ['https://via.placeholder.com/400x400/22c55e/ffffff?text=لقيمات+بالعسل'], chefId: '2', chefName: 'الشيف فاطمة العلي', rating: 4.8 },
    { id: '15', nameAr: 'شاورما عربي', price: 3.200, images: ['https://via.placeholder.com/400x400/06b6d4/ffffff?text=شاورما+عربي'], chefId: '3', chefName: 'الشيف محمد الخالد', rating: 4.6 },
    { id: '16', nameAr: 'سمبوسة لحم', price: 2.000, images: ['https://via.placeholder.com/400x400/f97316/ffffff?text=سمبوسة+لحم'], chefId: '4', chefName: 'الشيف نورة السالم', rating: 4.7 },
  ];

  const dummyBanners: Banner[] = [
    { id: '1', imageUrl: 'https://via.placeholder.com/1200x400/f59e0b/ffffff?text=ChefHub+-+مركز+الشيفات', title: 'ChefHub', link: '#', order: 1 },
    { id: '2', imageUrl: 'https://via.placeholder.com/1200x300/10b981/ffffff?text=اطلب+الآن+-+توصيل+سريع', title: 'توصيل سريع', link: '#', order: 2 },
    { id: '3', imageUrl: 'https://via.placeholder.com/1200x300/14b8a6/ffffff?text=عروض+خاصة', title: 'عروض خاصة', link: '#', order: 3 },
    { id: '4', imageUrl: 'https://via.placeholder.com/1200x300/059669/ffffff?text=أفضل+الشيفات', title: 'أفضل الشيفات', link: '#', order: 4 },
  ];

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
        
        // Use dummy banners if no data from Firebase
        setBanners(bannersData.length > 0 ? bannersData : dummyBanners);

        // Fetch approved chefs
        const chefsRef = collection(db, 'chefs');
        const chefsQuery = query(
          chefsRef,
          where('status', '==', 'approved'),
          orderBy('rating', 'desc'),
          limit(12)
        );
        const chefsSnapshot = await getDocs(chefsQuery);
        const chefsData = chefsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chef[];
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
        const dishesData = dishesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dish[];
        console.log('Dishes loaded:', dishesData.length, dishesData);
        
        // Use dummy dishes if no data from Firebase
        setDishes(dishesData.length > 0 ? dishesData : dummyDishes);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use dummy data on error
        setBanners(dummyBanners);
  setChefs([]);
        setDishes(dummyDishes);
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
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  <div className="flex flex-col items-center text-center gap-3 relative z-10">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black">الشيفات</h3>
                    <p className="text-sm text-white/90">تصفح جميع الشيفات</p>
                  </div>
                </div>
              </Link>

              <Link href="/dishes" className="group">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  <div className="flex flex-col items-center text-center gap-3 relative z-10">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black">المنتجات</h3>
                    <p className="text-sm text-white/90">تصفح جميع الأطباق</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* 2. FIRST BANNER - بعد الأزرار */}
          {banners[0] && (
            <div className="w-full">
              <Link href={banners[0].link || '#'}>
                <div className="container mx-auto px-4">
                  <div className="relative w-full h-48 md:h-56 overflow-hidden rounded-2xl">
                    <img
                      src={banners[0].imageUrl}
                      alt={banners[0].title || 'Banner'}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
            <div className="w-full py-4">
              <Link href={banners[1].link || '#'}>
                <div className="container mx-auto px-4">
                  <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-2xl">
                    <img src={banners[1].imageUrl} alt={banners[1].title || 'Banner'} className="w-full h-full object-cover" />
                  </div>
                </div>
              </Link>
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
                      <div className="p-3">
                        <h4 className="font-black text-gray-900 text-sm mb-2 line-clamp-1">{dish.nameAr}</h4>
                        <div className="inline-block px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg mb-2">
                          <p className="text-xs text-white font-bold line-clamp-1">{dish.chefName}</p>
                        </div>
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

          {/* 6. THIRD BANNER */}
          {banners[2] && (
            <div className="w-full py-4">
              <Link href={banners[2].link || '#'}>
                <div className="container mx-auto px-4">
                  <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-2xl">
                    <img src={banners[2].imageUrl} alt={banners[2].title || 'Banner'} className="w-full h-full object-cover" />
                  </div>
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
            <div className="w-full py-4">
              <Link href={banners[3].link || '#'}>
                <div className="container mx-auto px-4">
                  <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-2xl">
                    <img src={banners[3].imageUrl} alt={banners[3].title || 'Banner'} className="w-full h-full object-cover" />
                  </div>
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
