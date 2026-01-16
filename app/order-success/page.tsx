'use client';

// ============================================
// ChefHub - Order Success Page
// ============================================

import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, Home, ShoppingBag, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Get order number from URL params
    const orderNum = searchParams.get('orderNumber');
    if (orderNum) {
      setOrderNumber(orderNum);
    } else {
      // Fallback if no order number
      setOrderNumber(`#ORD-${Date.now().toString().slice(-6)}`);
    }
    
    // Clear cart on success (only once)
    clearCart();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 text-center border-2 border-gray-100 shadow-xl">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            تم تأكيد طلبك! 🎉
          </h1>
          
          {/* Order Number */}
          <div className="inline-block px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full font-bold text-lg mb-6">
            رقم الطلب: {orderNumber}
          </div>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            شكراً لك! تم استلام طلبك وسيتم البدء في تحضيره الآن. سنرسل لك إشعارات عبر الواتساب والإيميل.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Delivery Time */}
            <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="font-bold text-gray-900 mb-1">وقت التوصيل</div>
              <div className="text-sm text-gray-600">45-60 دقيقة</div>
            </div>

            {/* Notifications */}
            <div className="p-4 bg-teal-50 rounded-xl border-2 border-teal-200">
              <div className="text-3xl mb-2">📲</div>
              <div className="font-bold text-gray-900 mb-1">تتبع الطلب</div>
              <div className="text-sm text-gray-600">عبر الواتساب والإيميل</div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-right">
            <h3 className="font-black text-gray-900 mb-4 text-lg">الخطوات التالية:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </span>
                <span>سيتلقى الشيف إشعاراً فورياً بطلبك</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </span>
                <span>سيتم البدء في تحضير طلبك الآن</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </span>
                <span>سيتم التواصل معك عبر الواتساب لتأكيد موعد التسليم</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </span>
                <span>سيصلك الطلب في الوقت المحدد</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>تصفح المزيد</span>
            </Link>
            
            <Link
              href="/"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>الصفحة الرئيسية</span>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">هل تحتاج مساعدة؟</p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://wa.me/96512345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-bold">واتساب</span>
              </a>
              <a
                href="mailto:support@chefhub.kw"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-bold">إيميل</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          تم إرسال تأكيد الطلب إلى بريدك الإلكتروني ورقم الواتساب المسجل
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">جاري التحميل...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
