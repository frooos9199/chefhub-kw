'use client';

// ============================================
// ChefHub - Chef Profile Page
// ============================================

import { useEffect, useState } from 'react';
import { Star, MapPin, Clock, Phone, MessageSquare, Award, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { DishCard } from '@/components/DishCard';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function ChefProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [chef, setChef] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [specialOrders, setSpecialOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch chef and dishes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chefId = params.id as string;
        console.log('🔍 Fetching chef with ID:', chefId);
        
        // Get chef document
        const chefDoc = await getDoc(doc(db, 'chefs', chefId));
        
        if (!chefDoc.exists()) {
          console.error('❌ Chef not found with ID:', chefId);
          router.push('/chefs');
          return;
        }

        const chefData = { id: chefDoc.id, ...chefDoc.data() } as any;
        console.log('✅ Chef data loaded:', chefData.name, 'ID:', chefData.id);
        setChef(chefData);

        // Get chef's dishes
        const dishesQuery = query(
          collection(db, 'dishes'),
          where('chefId', '==', chefId),
          where('isActive', '==', true)
        );
        const dishesSnapshot = await getDocs(dishesQuery);
        const dishesData = dishesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        console.log('✅ Loaded', dishesData.length, 'dishes for chef:', (chefData as any).name);
        setDishes(dishesData);

        // Get chef's special orders
        const specialOrdersQuery = query(
          collection(db, 'special_orders'),
          where('chefId', '==', chefId),
          where('isActive', '==', true)
        );
        const specialOrdersSnapshot = await getDocs(specialOrdersQuery);
        const specialOrdersData = specialOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        console.log('✅ Loaded', specialOrdersData.length, 'special orders for chef:', (chefData as any).name);
        setSpecialOrders(specialOrdersData);

        // Get chef's reviews
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('chefId', '==', chefId),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        console.log('✅ Loaded', reviewsData.length, 'reviews for chef:', (chefData as any).name);
        setReviews(reviewsData);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!chef) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Cover Image */}
      <div className="relative h-48 md:h-80 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
        {chef.coverImage ? (
          <Image src={chef.coverImage} alt={chef.businessName} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl md:text-9xl">👩‍🍳</span>
          </div>
        )}
        
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-4 md:top-6 right-4 md:right-6 px-3 py-1.5 md:px-4 md:py-2 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl text-sm md:text-base font-semibold hover:bg-white transition-all shadow-lg"
        >
          ← رجوع
        </Link>
      </div>

      <div className="container mx-auto px-4 -mt-16 md:-mt-24 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chef Header Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-10 border-2 border-emerald-100">
              <div className="flex items-start gap-3 md:gap-6">
                {/* Profile Image */}
                <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-xl md:rounded-2xl border-2 md:border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
                  {chef.profileImage ? (
                    <Image src={chef.profileImage} alt={chef.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                      {chef.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-3xl font-black text-gray-900 mb-1 md:mb-2">{chef.businessName || chef.name}</h1>
                  <p className="text-lg md:text-2xl font-bold text-emerald-600 mb-2 md:mb-4">{chef.name}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              i < Math.floor(chef.rating || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-base md:text-xl font-bold text-gray-900">{(chef.rating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-xs md:text-base text-gray-500">({chef.totalRatings || 0} تقييم)</span>
                  </div>

                  {/* Specialties */}
                  {chef.specialty && chef.specialty.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 w-full">
                      {chef.specialty.map((spec: string) => (
                      <div
                        key={spec}
                        className="px-2 py-2 md:px-3 md:py-3 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs md:text-sm font-semibold rounded-xl border-2 border-emerald-200 text-center"
                      >
                        {spec}
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {chef.bio && (
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">نبذة عن الشيف</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{chef.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {chef.totalOrders || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">طلب مكتمل</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {dishes.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">صنف متوفر</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {specialOrders.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">عرض خاص</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {chef.totalRatings || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">تقييم</div>
                </div>
              </div>
            </div>

            {/* Dishes */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border-2 border-emerald-100">
              <h2 className="text-lg md:text-2xl font-black text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                الأصناف المتوفرة ({dishes.length})
              </h2>
              {dishes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {dishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-gray-500">لا توجد أصناف متاحة حالياً</p>
                </div>
              )}
            </div>

            {/* Special Orders */}
            {specialOrders.length > 0 && (
              <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border-2 border-orange-100">
                <h2 className="text-lg md:text-2xl font-black text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  العروض الخاصة ({specialOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {specialOrders.map((order) => (
                    <Link key={order.id} href={`/special-orders/${order.id}`}>
                      <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-orange-100 hover:border-orange-300">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          {order.images && order.images.length > 0 ? (
                            <Image
                              src={order.images[0]}
                              alt={order.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : order.image ? (
                            <Image
                              src={order.image}
                              alt={order.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                              <span className="text-6xl">🎁</span>
                            </div>
                          )}
                          {/* Badge */}
                          <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                            عرض خاص
                          </div>
                          {/* Time Badge */}
                          {order.availableUntil && (
                            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                              متاح حتى {new Date(order.availableUntil).toLocaleDateString('ar')}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {order.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{order.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-black text-orange-600">
                              {order.price?.toFixed(3)} د.ك
                            </div>
                            {order.maxOrders && order.currentOrders !== undefined && (
                              <div className="text-xs text-gray-500">
                                متبقي {(order.maxOrders || 0) - (order.currentOrders || 0)} من {order.maxOrders}
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

            {/* Reviews */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border-2 border-emerald-100">
              <h2 className="text-lg md:text-2xl font-black text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                التقييمات ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                  <div key={review.id} className="p-3 md:p-6 bg-gray-50 rounded-lg md:rounded-xl border-2 border-gray-100">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-gray-900">{review.customerName}</h4>
                        <p className="text-xs md:text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-700">{review.comment}</p>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">⭐</div>
                  <p className="text-gray-500">لا توجد تقييمات بعد</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border-2 border-emerald-100 lg:sticky lg:top-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">معلومات التواصل</h3>
              
              <div className="space-y-4">
                {/* Phone */}
                {chef.phone && (
                  <a
                    href={`tel:${chef.phone}`}
                    className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-emerald-50 rounded-lg md:rounded-xl hover:bg-emerald-100 transition-all"
                  >
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs text-gray-500">هاتف</div>
                      <div className="text-sm md:text-base font-semibold text-gray-900">{chef.phone}</div>
                    </div>
                  </a>
                )}

                {/* WhatsApp */}
                {chef.whatsappNumber && (
                  <a
                    href={`https://wa.me/${chef.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-green-50 rounded-lg md:rounded-xl hover:bg-green-100 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    <div>
                      <div className="text-xs text-gray-500">واتساب</div>
                      <div className="text-sm md:text-base font-semibold text-gray-900">{chef.whatsappNumber}</div>
                    </div>
                  </a>
                )}

                {/* Working Hours */}
                {chef.workingHours && (
                  <div className="p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">ساعات العمل</div>
                        <div className="text-sm md:text-base font-semibold text-gray-900">{chef.workingHours}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Areas */}
              {chef.deliveryGovernorates && chef.deliveryGovernorates.length > 0 && (
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                  <h4 className="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                    مناطق التوصيل
                  </h4>
                  <div className="space-y-2">
                    {chef.deliveryGovernorates.map((gov: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm md:text-base text-gray-700">{gov}</span>
                        {chef.deliveryFee && (
                          <span className="text-sm md:text-base text-emerald-600 font-bold">
                            {chef.deliveryFee.toFixed(3)} د.ك
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
