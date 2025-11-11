'use client';

// ============================================
// ChefHub - Chef Profile Page
// ============================================

import { Star, MapPin, Clock, Phone, MessageSquare, Award, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { DishCard } from '@/components/DishCard';

// Mock chef data
const MOCK_CHEF = {
  id: '1',
  businessName: 'مطبخ فاطمة للحلويات',
  name: 'فاطمة أحمد',
  specialty: ['حلويات شرقية', 'معجنات', 'حلويات غربية'],
  bio: 'متخصصة في الحلويات الشرقية التقليدية مع لمسة عصرية. خبرة أكثر من 10 سنوات في صناعة الحلويات. نستخدم أجود أنواع المكونات لضمان أفضل نكهة وجودة.',
  profileImage: '',
  coverImage: '',
  rating: 4.8,
  totalRatings: 156,
  totalOrders: 342,
  deliveryGovernorates: ['العاصمة', 'حولي', 'الفروانية'],
  deliveryFees: { capital: 2, hawalli: 2.5, farwaniya: 3 },
  phone: '+965 1234 5678',
  whatsappNumber: '+965 9876 5432',
  workingHours: 'السبت - الخميس: 9 صباحاً - 9 مساءً',
};

const MOCK_DISHES = [
  {
    id: '1',
    name: 'كنافة نابلسية',
    description: 'كنافة طازجة بالجبنة مع القطر الفاخر',
    price: 8.500,
    images: [],
    category: 'حلويات',
    prepTime: 30,
    rating: 4.9,
    totalOrders: 128,
    chefName: 'فاطمة أحمد',
    chefId: '1',
  },
  {
    id: '3',
    name: 'بسبوسة محشية',
    description: 'بسبوسة طرية محشية بالمكسرات',
    price: 6.500,
    images: [],
    category: 'حلويات',
    prepTime: 25,
    rating: 4.7,
    totalOrders: 87,
    chefName: 'فاطمة أحمد',
    chefId: '1',
  },
];

const MOCK_REVIEWS = [
  {
    id: '1',
    customerName: 'أحمد محمد',
    rating: 5,
    comment: 'كنافة رائعة! الطعم ممتاز والتوصيل سريع',
    date: '2024-11-05',
  },
  {
    id: '2',
    customerName: 'سارة علي',
    rating: 5,
    comment: 'أفضل حلويات في الكويت، بالتوفيق',
    date: '2024-11-03',
  },
  {
    id: '3',
    customerName: 'خالد يوسف',
    rating: 4,
    comment: 'جيد جداً، سأطلب مرة أخرى بإذن الله',
    date: '2024-10-28',
  },
];

export default function ChefProfilePage() {
  const params = useParams();
  const chef = MOCK_CHEF;

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
        
        {/* Back Button */}
        <Link
          href="/browse"
          className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl font-semibold hover:bg-white transition-all shadow-lg"
        >
          ← رجوع
        </Link>
      </div>

      <div className="container mx-auto px-4 -mt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chef Header Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
                  {chef.profileImage ? (
                    <Image src={chef.profileImage} alt={chef.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                      {chef.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-gray-900 mb-2">{chef.businessName}</h1>
                  <p className="text-lg text-gray-600 mb-4">{chef.name}</p>

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
                    {chef.specialty.map((spec) => (
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
                    {MOCK_DISHES.length}
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
                {MOCK_DISHES.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                التقييمات ({MOCK_REVIEWS.length})
              </h2>
              <div className="space-y-4">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{review.customerName}</h4>
                        <p className="text-sm text-gray-500">{review.date}</p>
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
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-emerald-100 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">معلومات التواصل</h3>
              
              <div className="space-y-4">
                {/* Phone */}
                <a
                  href={`tel:${chef.phone}`}
                  className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all"
                >
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs text-gray-500">هاتف</div>
                    <div className="font-semibold text-gray-900">{chef.phone}</div>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${chef.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-500">واتساب</div>
                    <div className="font-semibold text-gray-900">{chef.whatsappNumber}</div>
                  </div>
                </a>

                {/* Working Hours */}
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
                  {chef.deliveryGovernorates.map((gov) => (
                    <div key={gov} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{gov}</span>
                      <span className="text-emerald-600 font-bold">
                        {chef.deliveryFees.capital.toFixed(3)} د.ك
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
