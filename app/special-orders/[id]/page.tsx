'use client';

// ============================================
// ChefHub - Special Order Details Page
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, Users, MapPin, ShoppingCart, AlertCircle, Star, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ImageGallery } from '@/components/ImageGallery';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SpecialOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadSpecialOrder(params.id as string);
    }
  }, [params.id]);

  async function loadSpecialOrder(orderId: string) {
    try {
      setLoading(true);
      const orderDoc = await getDoc(doc(db, 'special_orders', orderId));
      
      if (!orderDoc.exists()) {
        router.push('/special-orders');
        return;
      }
      
      const orderData = orderDoc.data();
      
      // Get chef info
      const chefDoc = await getDoc(doc(db, 'chefs', orderData.chefId));
      const chefData = chefDoc.data();
      
      setOrder({
        id: orderDoc.id,
        ...orderData,
        chef: {
          id: orderData.chefId,
          name: chefData?.name || 'شيف',
          businessName: chefData?.businessName || chefData?.name || 'شيف',
          rating: chefData?.rating || 0,
          totalOrders: chefData?.totalOrders || 0,
          profileImage: chefData?.profileImage || '',
        },
        startDate: orderData.startDate?.toDate?.()?.toISOString().split('T')[0] || '',
        endDate: orderData.endDate?.toDate?.()?.toISOString().split('T')[0] || ''
      });
    } catch (error) {
      console.error('Error loading special order:', error);
      router.push('/special-orders');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const remaining = order.maxQuantity - (order.currentOrders || 0);
  const percentageSold = ((order.currentOrders || 0) / order.maxQuantity) * 100;
  const isAlmostFull = percentageSold >= 80;
  const isSoldOut = remaining <= 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-KW', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;

    addItem({
      dishId: order.id,
      dishName: order.title,
      dishImage: order.images[0] || '',
      price: order.price,
      quantity: quantity,
      chefId: order.chefId,
      chefName: order.chef.businessName,
      prepTime: order.prepTime,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const totalPrice = order.price * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
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
          href="/special-orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm mb-6"
        >
          ← رجوع للطلبات الخاصة
        </Link>

        {/* Special Order Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-black flex items-center gap-2 animate-pulse">
            <TrendingUp className="w-5 h-5" />
            <span>طلب خاص ومحدود</span>
          </div>
          {isAlmostFull && !isSoldOut && (
            <div className="px-4 py-2 bg-red-500 text-white rounded-full font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>كمية محدودة جداً!</span>
            </div>
          )}
          {isSoldOut && (
            <div className="px-4 py-2 bg-gray-500 text-white rounded-full font-bold">
              🔒 نفذت الكمية
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Gallery */}
          <div>
            <ImageGallery images={order.images} dishName={order.title} />
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">
                {order.category}
              </span>
              <h1 className="text-4xl font-black text-gray-900 mt-4 mb-4">{order.title}</h1>
              <p className="text-gray-700 leading-relaxed">{order.description}</p>
            </div>

            {/* Availability Timer */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-amber-700" />
                <span className="font-black text-amber-900">فترة التوفر</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-700">من</div>
                  <div className="font-bold text-amber-900">{formatDate(order.startDate)}</div>
                </div>
                <div className="text-amber-600">→</div>
                <div>
                  <div className="text-xs text-amber-700">إلى</div>
                  <div className="font-bold text-amber-900">{formatDate(order.endDate)}</div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-black text-gray-900">حالة الطلب</span>
                </div>
                <span className={`font-bold ${isSoldOut ? 'text-red-600' : isAlmostFull ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {isSoldOut ? 'نفذت الكمية' : `متبقي ${remaining} من ${order.maxQuantity}`}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    isSoldOut
                      ? 'bg-red-500'
                      : isAlmostFull
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(percentageSold, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {order.currentOrders} طلب تم حجزه
              </div>
            </div>

            {/* Chef Info */}
            <Link
              href={`/chefs/${order.chef.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                {order.chef.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">بواسطة</div>
                <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {order.chef.businessName}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{order.chef.rating}</span>
                </div>
              </div>
            </Link>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                <Clock className="w-5 h-5 text-amber-600 mb-2" />
                <div className="text-sm text-gray-500">وقت التحضير</div>
                <div className="text-lg font-bold text-gray-900">{order.prepTime} دقيقة</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                <div className="text-2xl mb-2">🍽️</div>
                <div className="text-sm text-gray-500">الحصص</div>
                <div className="text-lg font-bold text-gray-900">{order.servings} أشخاص</div>
              </div>
            </div>

            {/* Price & Add to Cart */}
            {!isSoldOut && (
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm opacity-90">السعر الخاص</div>
                    <div className="text-4xl font-black">{order.price.toFixed(3)}</div>
                    <div className="text-sm opacity-90">دينار كويتي</div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                    >
                      <span className="text-xl font-bold">-</span>
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(remaining, quantity + 1))}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                    >
                      <span className="text-xl font-bold">+</span>
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
                  className="w-full py-4 bg-white text-amber-600 rounded-xl font-black text-lg hover:bg-gray-50 transition-all shadow-xl flex items-center justify-center gap-2 group"
                >
                  <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  احجز الآن - عرض محدود!
                </button>
              </div>
            )}

            {isSoldOut && (
              <div className="bg-gray-100 rounded-2xl p-8 text-center border-2 border-gray-200">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">نفذت الكمية</h3>
                <p className="text-gray-600 mb-4">عذراً، هذا الطلب الخاص نفذت كميته بالكامل</p>
                <Link
                  href="/special-orders"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  تصفح طلبات خاصة أخرى
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Full Description & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الوصف التفصيلي</h2>
              <div className="prose prose-amber max-w-none">
                {order.longDescription?.split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ingredients */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">المكونات</h3>
              <ul className="space-y-2">
                {order.ingredients?.map((ingredient: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Allergens */}
            {order.allergens.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-3">⚠️ مسببات الحساسية</h3>
                <div className="flex flex-wrap gap-2">
                  {order.allergens?.map((allergen: string, index: number) => (
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
              <h3 className="text-lg font-bold text-gray-900 mb-3">مناطق التوصيل</h3>
              <div className="space-y-2">
                {order.deliveryGovernorates?.map((area: string, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>{area}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">
                      {order.deliveryFees[area as keyof typeof order.deliveryFees].toFixed(3)} د.ك
                    </span>
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
