'use client';

// ============================================
// ChefHub - Dish Details Page
// ============================================

import { useState } from 'react';
import { Star, Clock, ChefHat, MapPin, ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ImageGallery } from '@/components/ImageGallery';
import { ReviewForm } from '@/components/ReviewForm';
import { DishCard } from '@/components/DishCard';
import { useCart } from '@/contexts/CartContext';

// Mock dish data
const MOCK_DISH = {
  id: '1',
  name: 'كنافة نابلسية فاخرة',
  description: 'كنافة طازجة محضرة يومياً بأجود أنواع الجبنة العكاوي والقطر الطبيعي. مكونات طبيعية 100% بدون مواد حافظة. تقدم ساخنة مع القطر البارد والفستق الحلبي المطحون.',
  longDescription: `كنافة نابلسية أصيلة محضرة بعناية فائقة من أجود المكونات:

• جبنة عكاوي طازجة مستوردة من فلسطين
• عجينة كنافة طازجة يومياً
• قطر طبيعي محضر من السكر والماء وماء الورد
• سمن بلدي نقي
• فستق حلبي مطحون للتزيين

طريقة التحضير:
يتم تحضير الكنافة طازجة يومياً على نار هادئة لضمان النضج المتساوي والطعم الأصيل. تقدم ساخنة مباشرة بعد التحضير مع القطر البارد.

مثالية للمناسبات الخاصة، أعياد الميلاد، الولائم، أو كحلى فاخرة لضيوفك.`,
  price: 8.500,
  images: [],
  category: 'حلويات شرقية',
  prepTime: 30,
  servings: 6,
  rating: 4.9,
  totalRatings: 128,
  totalOrders: 342,
  
  chef: {
    id: '1',
    name: 'فاطمة أحمد',
    businessName: 'مطبخ فاطمة للحلويات',
    rating: 4.8,
    totalOrders: 456,
    profileImage: '',
  },

  ingredients: [
    '500 جرام جبنة عكاوي',
    '500 جرام عجينة كنافة',
    '200 جرام سمن بلدي',
    'كوب قطر (شيرة)',
    'فستق حلبي مطحون للتزيين',
    'ماء ورد',
  ],

  allergens: ['حليب', 'مكسرات'],
  
  nutritionFacts: {
    calories: 420,
    protein: 12,
    carbs: 45,
    fat: 22,
  },

  availableFor: ['العاصمة', 'حولي', 'الفروانية'],
  deliveryFee: 2.000,
};

const MOCK_REVIEWS = [
  {
    id: '1',
    customerName: 'أحمد محمد',
    customerImage: '',
    rating: 5,
    comment: 'كنافة رائعة! أفضل كنافة جربتها في الكويت. الجبنة طرية والقطر مظبوط تماماً. التوصيل كان سريع والصنف وصل ساخن. بالتوفيق!',
    date: '2024-11-05',
    verified: true,
  },
  {
    id: '2',
    customerName: 'سارة علي',
    customerImage: '',
    rating: 5,
    comment: 'ما شاء الله، طعم أصيل ومكونات طبيعية. طلبتها لحفلة عيد ميلاد ابني وكل الضيوف أعجبتهم. شكراً فاطمة ❤️',
    date: '2024-11-03',
    verified: true,
  },
  {
    id: '3',
    customerName: 'خالد يوسف',
    customerImage: '',
    rating: 4,
    comment: 'جيدة جداً، الطعم ممتاز لكن كان ودي لو كان في قطر أكثر. بشكل عام راضي عن الطلب وسأطلب مرة أخرى.',
    date: '2024-10-28',
    verified: false,
  },
];

const RELATED_DISHES = [
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

export default function DishDetailsPage() {
  const params = useParams();
  const dish = MOCK_DISH;
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = () => {
    addItem({
      dishId: dish.id,
      dishName: dish.name,
      dishImage: dish.images[0] || '',
      price: dish.price,
      quantity: quantity,
      chefId: dish.chef.id,
      chefName: dish.chef.businessName,
      prepTime: dish.prepTime,
    });
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    console.log('Submitting review:', { dishId: dish.id, rating, comment });
    // سيتم ربطه بـ Firebase لاحقاً
  };

  const totalPrice = dish.price * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold">تمت الإضافة للسلة! ✓</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm mb-6"
        >
          ← رجوع للتصفح
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Gallery */}
          <div>
            <ImageGallery images={dish.images} dishName={dish.name} />
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                  {dish.category}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-4xl font-black text-gray-900 mb-4">{dish.name}</h1>
              
              {/* Rating & Orders */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(dish.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{dish.rating}</span>
                  <span className="text-gray-500">({dish.totalRatings} تقييم)</span>
                </div>
                <div className="text-gray-500">
                  <span className="font-bold text-emerald-600">{dish.totalOrders}</span> طلب
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <p className="text-gray-700 leading-relaxed">{dish.description}</p>
            </div>

            {/* Chef Info */}
            <Link
              href={`/chefs/${dish.chef.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {dish.chef.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">بواسطة</div>
                <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {dish.chef.businessName}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{dish.chef.rating}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{dish.chef.totalOrders} طلب</span>
                </div>
              </div>
              <ChefHat className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                <Clock className="w-5 h-5 text-emerald-600 mb-2" />
                <div className="text-sm text-gray-500">وقت التحضير</div>
                <div className="text-lg font-bold text-gray-900">{dish.prepTime} دقيقة</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                <MapPin className="w-5 h-5 text-emerald-600 mb-2" />
                <div className="text-sm text-gray-500">التوصيل</div>
                <div className="text-lg font-bold text-gray-900">{dish.deliveryFee.toFixed(3)} د.ك</div>
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm opacity-90">السعر</div>
                  <div className="text-4xl font-black">{dish.price.toFixed(3)}</div>
                  <div className="text-sm opacity-90">دينار كويتي</div>
                </div>
                
                {/* Quantity Selector */}
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Total */}
              {quantity > 1 && (
                <div className="mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="opacity-90">المجموع ({quantity} قطعة)</span>
                    <span className="text-2xl font-bold">{totalPrice.toFixed(3)} د.ك</span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-white text-emerald-600 rounded-xl font-black text-lg hover:bg-gray-50 transition-all shadow-xl flex items-center justify-center gap-2 group"
              >
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                إضافة للسلة
              </button>
            </div>
          </div>
        </div>

        {/* Full Description & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الوصف التفصيلي</h2>
              <div className="prose prose-emerald max-w-none">
                {dish.longDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                التقييمات ({MOCK_REVIEWS.length})
              </h2>

              <div className="space-y-6 mb-8">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {review.customerName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-gray-900">{review.customerName}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          {review.verified && (
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                              ✓ طلب موثق
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Form */}
              <ReviewForm
                dishId={dish.id}
                dishName={dish.name}
                onSubmit={handleSubmitReview}
              />
            </div>

            {/* Related Dishes */}
            {RELATED_DISHES.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">أصناف مشابهة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {RELATED_DISHES.map((relatedDish) => (
                    <DishCard key={relatedDish.id} dish={relatedDish} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ingredients */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">المكونات</h3>
              <ul className="space-y-2">
                {dish.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition Facts */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">القيمة الغذائية</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">السعرات الحرارية</span>
                  <span className="font-bold text-gray-900">{dish.nutritionFacts.calories} كيلو كالوري</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">البروتين</span>
                  <span className="font-bold text-gray-900">{dish.nutritionFacts.protein} جرام</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الكربوهيدرات</span>
                  <span className="font-bold text-gray-900">{dish.nutritionFacts.carbs} جرام</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الدهون</span>
                  <span className="font-bold text-gray-900">{dish.nutritionFacts.fat} جرام</span>
                </div>
              </div>
            </div>

            {/* Allergens */}
            {dish.allergens.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-3">⚠️ مسببات الحساسية</h3>
                <div className="flex flex-wrap gap-2">
                  {dish.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-100 text-amber-900 text-sm font-semibold rounded-full"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Areas */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">متوفر في</h3>
              <div className="space-y-2">
                {dish.availableFor.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
