'use client';

// ============================================
// ChefHub - Checkout Page
// Complete order checkout with address & payment
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Phone, CreditCard, ShoppingBag, Clock, Truck, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createOrder } from '@/lib/orders';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { notifyNewOrder } from '@/lib/notifications';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const GOVERNORATES = [
  'العاصمة',
  'حولي',
  'الفروانية',
  'الأحمدي',
  'الجهراء',
  'مبارك الكبير',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    setDeliveryAddress,
    getUniqueChefs,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    governorate: deliveryAddress?.governorate || '',
    area: deliveryAddress?.area || '',
    block: deliveryAddress?.block || '',
    street: deliveryAddress?.street || '',
    building: deliveryAddress?.building || '',
    floor: deliveryAddress?.floor || '',
    apartment: deliveryAddress?.apartment || '',
    additionalInfo: deliveryAddress?.additionalInfo || '',
    phoneNumber: deliveryAddress?.phoneNumber || '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'knet' | 'visa' | 'cod'>('knet');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const chefs = getUniqueChefs();

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">السلة فارغة</h2>
          <p className="text-gray-600 mb-6">لا يمكنك إتمام الطلب والسلة فارغة</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            تصفح الأصناف
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.governorate) newErrors.governorate = 'المحافظة مطلوبة';
    if (!formData.area) newErrors.area = 'المنطقة مطلوبة';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'رقم الهاتف مطلوب';
    if (formData.phoneNumber && !/^[0-9]{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف يجب أن يكون 8 أرقام';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user || !userData) {
      alert('يجب تسجيل الدخول أولاً');
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);

    try {
      // Save delivery address
      const address = {
        governorate: formData.governorate,
        area: formData.area,
        block: formData.block,
        street: formData.street,
        building: formData.building,
        floor: formData.floor,
        apartment: formData.apartment,
        additionalInfo: formData.additionalInfo,
        phoneNumber: formData.phoneNumber,
      };

      setDeliveryAddress(address);

      // Calculate delivery fees (simplified - should be fetched from chef data)
      const deliveryFee = chefs.length * 1.5; // 1.5 KD per chef

      // Create order in Firebase
      const { orderId, orderNumber } = await createOrder({
        customerId: user.uid,
        customerName: userData.name,
        customerEmail: userData.email,
        customerPhone: userData.phone || address.phoneNumber,
        items: items.map(item => ({
          dishId: item.dishId || item.id,
          dishName: item.dishName,
          chefId: item.chefId,
          chefName: item.chefName,
          quantity: item.quantity,
          price: item.price,
          image: item.dishImage,
        })),
        deliveryAddress: address,
        paymentMethod,
        subtotal: total,
        deliveryFee,
        total: total + deliveryFee,
      });

      console.log('✅ Order created:', orderNumber);

      // إرسال إشعار للعميل
      try {
        await sendOrderConfirmationEmail(
          userData.email,
          userData.name,
          orderNumber,
          chefs[0]?.name || 'الشيف', // اسم أول شيف
          items.map(item => ({
            name: item.dishName,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
          deliveryFee
        );
      } catch (emailError) {
        console.error('⚠️ Failed to send customer email:', emailError);
        // لا نوقف العملية إذا فشل الإيميل
      }

      // إرسال إشعارات للشيفات والأدمن
      const uniqueChefs = chefs;
      for (const chef of uniqueChefs) {
        try {
          // جلب بيانات الشيف من قاعدة البيانات
          const chefDoc = await getDoc(doc(db, 'chefs', chef.id));
          const chefData = chefDoc.data();
          
          if (!chefData) {
            console.error(`⚠️ Chef data not found for ${chef.id}`);
            continue;
          }
          
          // حساب أصناف ومبلغ هذا الشيف
          const chefItems = items.filter(item => item.chefId === chef.id);
          const chefTotal = chefItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          // إرسال الإشعارات للشيف
          await notifyNewOrder({
            chefId: chef.id,
            chefName: chefData.businessName || chefData.name,
            chefEmail: chefData.email,
            chefWhatsApp: chefData.phone,
            chefPreferences: chefData.notificationPreferences || {
              receiveEmailNotifications: true,
              receiveWhatsAppNotifications: true,
              newOrder: true
            },
            orderId,
            orderNumber,
            customerId: user.uid,
            customerName: userData.name,
            customerEmail: userData.email,
            customerPhone: userData.phone || address.phoneNumber,
            items: chefItems.map(item => ({
              name: item.dishName,
              quantity: item.quantity,
              price: item.price
            })),
            totalAmount: chefTotal,
            deliveryFee,
            deliveryAddress: `${address.area}, ${address.governorate}`
          });
          
          console.log(`✅ Notifications sent to chef ${chefData.businessName}`);
        } catch (notifError) {
          console.error(`⚠️ Failed to send notification to chef ${chef.name}:`, notifError);
          // لا نوقف العملية إذا فشل الإشعار
        }
      }
      
      // إرسال إشعار للأدمن
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          type: 'new_order',
          titleAr: 'طلب جديد',
          titleEn: 'New Order',
          messageAr: `طلب جديد #${orderNumber} من ${userData.name}`,
          messageEn: `New order #${orderNumber} from ${userData.name}`,
          isRead: false,
          link: `/admin/orders/${orderNumber}`,
          orderNumber,
          totalAmount: total + deliveryFee,
          createdAt: new Date()
        });
        console.log('✅ Admin notification created');
      } catch (adminNotifError) {
        console.error('⚠️ Failed to create admin notification:', adminNotifError);
      }

      // TODO: Process payment if not COD
      // if (paymentMethod !== 'cod') {
      //   await processPayment(orderId, total + deliveryFee);
      // }

      // Clear cart after successful order
      clearCart();

      // Redirect to success page with order number
      router.push(`/order-success?orderNumber=${orderNumber}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm mb-4"
          >
            ← رجوع للصفحة الرئيسية
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-2">إتمام الطلب</h1>
          <p className="text-gray-600">أدخل معلومات التوصيل واستكمل طلبك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900">عنوان التوصيل</h2>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Governorate */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    المحافظة *
                  </label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.governorate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                  {errors.governorate && (
                    <p className="text-red-500 text-sm mt-1">{errors.governorate}</p>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    المنطقة *
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="مثال: السالمية"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.area ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                </div>

                {/* Block, Street, Building */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">القطعة</label>
                    <input
                      type="text"
                      name="block"
                      value={formData.block}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الشارع</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="15"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المبنى</label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleInputChange}
                      placeholder="10"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Floor, Apartment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الطابق</label>
                    <input
                      type="text"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      placeholder="2"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الشقة</label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="5"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <div className="flex gap-2">
                    <span className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-bold text-gray-700">
                      +965
                    </span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="12345678"
                      maxLength={8}
                      className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    معلومات إضافية (اختياري)
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="مثال: البيت الأزرق، بجانب السوبرماركت"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900">طريقة الدفع</h2>
              </div>

              <div className="space-y-3">
                {/* KNET */}
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'knet'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="knet"
                    checked={paymentMethod === 'knet'}
                    onChange={() => setPaymentMethod('knet')}
                    className="w-5 h-5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">KNET</div>
                    <div className="text-sm text-gray-500">الدفع الإلكتروني عبر كي نت</div>
                  </div>
                  <div className="text-3xl">💳</div>
                </label>

                {/* Visa/MasterCard */}
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'visa'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="visa"
                    checked={paymentMethod === 'visa'}
                    onChange={() => setPaymentMethod('visa')}
                    className="w-5 h-5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Visa / MasterCard</div>
                    <div className="text-sm text-gray-500">الدفع بالبطاقة الائتمانية</div>
                  </div>
                  <div className="text-3xl">💳</div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">الدفع عند الاستلام</div>
                    <div className="text-sm text-gray-500">ادفع نقداً عند استلام طلبك</div>
                  </div>
                  <div className="text-3xl">💵</div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 sticky top-4">
              <h2 className="text-xl font-black text-gray-900 mb-6">ملخص الطلب</h2>

              {/* Items by Chef */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {chefs.map((chef) => (
                  <div key={chef.id} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                        {chef.name.charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-gray-900">{chef.name}</span>
                    </div>

                    {chef.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.dishImage ? (
                            <Image
                              src={item.dishImage}
                              alt={item.dishName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🍽️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {item.dishName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.price.toFixed(3)} د.ك × {item.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-emerald-600">
                          {(item.price * item.quantity).toFixed(3)}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Delivery Info */}
              {formData.governorate && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-gray-900">التوصيل إلى</span>
                  </div>
                  <p className="text-sm text-gray-700">{formData.governorate}</p>
                  {formData.area && <p className="text-sm text-gray-700">{formData.area}</p>}
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold">{subtotal.toFixed(3)} د.ك</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>رسوم التوصيل</span>
                  <span className="font-bold">{deliveryFee.toFixed(3)} د.ك</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-lg">
                  <span className="font-black text-gray-900">الإجمالي</span>
                  <span className="font-black text-emerald-600">{total.toFixed(3)} د.ك</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري معالجة الطلب...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد الطلب</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Estimated Delivery */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>وقت التوصيل المتوقع: 45-60 دقيقة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
