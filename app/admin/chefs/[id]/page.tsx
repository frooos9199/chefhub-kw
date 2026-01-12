"use client";


import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, MapPin, Clock, Package, Trash2 } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

export default function AdminChefDetailPage() {
  const params = useParams();
  const [chef, setChef] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dishes, setDishes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);


  async function handleDeleteChef() {
    if (!chef?.id) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا الشيف؟ سيتم حذف جميع بياناته نهائياً!")) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "chefs", chef.id));
      alert("تم حذف الشيف بنجاح!");
      window.location.href = "/admin/chefs";
    } catch (err) {
      alert("حدث خطأ أثناء حذف الشيف");
    }
    setDeleting(false);
  }

  useEffect(() => {
    async function fetchChef() {
      setLoading(true);
      try {
        let chefId = '';
        if (typeof params.id === 'string') chefId = params.id;
        else if (Array.isArray(params.id)) chefId = params.id[0];
        if (!chefId) {
          setError('لم يتم تحديد الشيف');
          setLoading(false);
          return;
        }
        // جلب بيانات الشيف
        const chefRef = doc(db, 'chefs', chefId);
        const chefSnap = await getDoc(chefRef);
        if (chefSnap.exists()) {
          const data = chefSnap.data() || {};
          const chefData = {
            id: chefId,
            name: data.name || '',
            businessName: data.businessName || '',
            profileImage: data.profileImage || '/default-chef-avatar.png',
            specialty: Array.isArray(data.specialty) ? data.specialty : [],
            rating: typeof data.rating === 'number' ? data.rating : 0,
            totalRatings: typeof data.totalRatings === 'number' ? data.totalRatings : 0,
            totalOrders: typeof data.totalOrders === 'number' ? data.totalOrders : 0,
            bio: data.bio || '',
            coverImage: data.coverImage || '',
            status: data.status || 'pending',
            governorate: data.governorate || '',
            area: data.area || '',
            phone: data.phone || '',
            whatsappNumber: data.whatsappNumber || '',
            workingHours: data.workingHours || '',
            deliveryGovernorates: Array.isArray(data.deliveryGovernorates) ? data.deliveryGovernorates : [],
            deliveryFees: typeof data.deliveryFees === 'object' && data.deliveryFees !== null ? data.deliveryFees : {},
            totalRevenue: typeof data.totalRevenue === 'number' ? data.totalRevenue : 0,
            commission: typeof data.commission === 'number' ? data.commission : 0,
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
          };
          setChef(chefData);
          setReviews(chefData.reviews);
        } else {
          setError('الشيف غير موجود');
        }
        // جلب الأصناف الخاصة بالشيف
        const dishesQuery = query(collection(db, 'dishes'), where('chefId', '==', chefId));
        const dishesSnap = await getDocs(dishesQuery);
        const chefDishes = dishesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDishes(chefDishes);
        // جلب التقييمات من مجموعة منفصلة إذا موجودة
        const reviewsQuery = query(collection(db, 'chefReviews'), where('chefId', '==', chefId));
        const reviewsSnap = await getDocs(reviewsQuery);
        if (!Array.isArray(chefSnap.data()?.reviews) && reviewsSnap.size > 0) {
          const chefReviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReviews(chefReviews);
        }
      } catch (err) {
        console.error('خطأ جلب بيانات الشيف:', err);
        setError('حدث خطأ أثناء جلب بيانات الشيف');
      }
      setLoading(false);
    }
    fetchChef();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-600">جاري تحميل بيانات الشيف...</span>
      </div>
    );
  }
  if (error || !chef) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-red-600">{error || 'حدث خطأ'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
        {chef.coverImage ? (
          <Image src={chef.coverImage} alt={chef.businessName} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl">👩‍🍳</span>
          </div>
        )}
        {/* رجوع للوحة الإدارة */}
        <a
          href="/admin/chefs"
          className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl font-semibold hover:bg-white transition-all shadow-lg"
        >
          ← رجوع
        </a>
      </div>

      <div className="container mx-auto px-4 -mt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chef Header Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDeleteChef}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" /> حذف الشيف
                </button>
              </div>
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
                  {chef.profileImage ? (
                    <Image src={chef.profileImage} alt={chef.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                      {chef.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-gray-900 mb-2">{chef.name}</h1>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(chef.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-gray-900">{chef.rating}</span>
                    </div>
                    <span className="text-gray-500">({chef.totalRatings} تقييم)</span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(chef.specialty) && chef.specialty.map((spec: string) => (
                      <span
                        key={spec}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-semibold rounded-full border-2 border-emerald-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">نبذة عن الشيف</h3>
                <p className="text-gray-600 leading-relaxed">{chef.bio}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {chef.totalOrders}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">طلب مكتمل</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {dishes.length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">صنف متوفر</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {chef.totalRatings}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">تقييم</div>
                </div>
              </div>
            </div>

            {/* Dishes */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-emerald-600" />
                الأصناف المتوفرة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dishes.length > 0 ? dishes.map((dish: any) => (
                  <div key={dish.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="font-bold text-gray-900 mb-2">{dish.nameAr || dish.name}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-600 font-bold">{dish.price?.toFixed ? dish.price.toFixed(3) : dish.price || '--'} د.ك</span>
                      <span className="text-gray-500">• {dish.sales || 0} مبيعات</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-amber-600 font-bold">{dish.rating || '--'}</span>
                      </span>
                    </div>
                  </div>
                )) : <div className="text-gray-500">لا توجد أصناف لهذا الشيف.</div>}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                التقييمات ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((review: any, idx: number) => (
                  <div key={review.id || idx} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{review.customerName || review.name || '---'}</h4>
                        <p className="text-sm text-gray-500">{review.date || ''}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment || review.text || ''}</p>
                  </div>
                )) : <div className="text-gray-500">لا توجد تقييمات بعد.</div>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-emerald-100 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">معلومات التواصل</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">ساعات العمل</div>
                      <div className="font-semibold text-gray-900">{chef.workingHours}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Delivery Areas */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  مناطق التوصيل
                </h4>
                <div className="space-y-2">
                  {Array.isArray(chef.deliveryGovernorates) && chef.deliveryGovernorates.map((gov: string) => (
                    <div key={gov} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{gov}</span>
                      <span className="text-emerald-600 font-bold">
                        {chef.deliveryFees && chef.deliveryFees[gov] ? chef.deliveryFees[gov].toFixed(3) : '--'} د.ك
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}