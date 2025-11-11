'use client';

// ============================================
// ChefHub - Chef Order Details Page
// ============================================

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  User,
  ChefHat,
  ArrowLeft,
  MessageSquare,
  Printer,
  Download,
} from 'lucide-react';
import Link from 'next/link';

// Mock order data
const MOCK_ORDER = {
  id: '1',
  orderNumber: '#ORD-123456',
  customerName: 'أحمد محمد',
  customerPhone: '+965 9999 9999',
  customerEmail: 'ahmed@example.com',
  items: [
    { name: 'مجبوس دجاج', quantity: 2, price: 8.500, image: '/dishes/majboos.jpg' },
    { name: 'معصوب', quantity: 1, price: 4.500, image: '/dishes/maasoob.jpg' },
  ],
  subtotal: 21.500,
  deliveryFee: 2.000,
  commission: 2.350,
  netAmount: 21.150,
  total: 23.500,
  status: 'pending' as 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
  paymentMethod: 'card',
  paymentStatus: 'paid' as const,
  governorate: 'حولي',
  area: 'السالمية',
  address: 'شارع سالم المبارك، مبنى 15، شقة 3',
  customerNotes: 'بدون بصل من فضلك، وأفضل التوصيل بعد الساعة 6 مساءً',
  createdAt: '2025-11-11T10:30:00',
  statusHistory: [
    { status: 'pending', timestamp: '2025-11-11T10:30:00', note: 'تم استلام الطلب' },
  ],
};

export default function ChefOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  const [order] = useState(MOCK_ORDER);
  const [selectedAction, setSelectedAction] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'delivered':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'جديد';
      case 'preparing':
        return 'قيد التحضير';
      case 'ready':
        return 'جاهز';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    setSelectedAction(newStatus);
    // TODO: Update order status in Firebase
    console.log('Updating order status to:', newStatus);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/chef/orders" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  تفاصيل الطلب
                </h1>
                <span className="text-xs text-gray-500">{order.orderNumber}</span>
              </div>
            </Link>

            <button
              onClick={() => router.push('/chef/orders')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-900">حالة الطلب</h3>
                <div
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                {order.statusHistory.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{item.note}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString('ar-KW')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-4">معلومات العميل</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">الاسم</div>
                    <div className="font-bold text-gray-900">{order.customerName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">رقم الهاتف</div>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      {order.customerPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">عنوان التوصيل</div>
                    <div className="font-bold text-gray-900">
                      {order.governorate} - {order.area}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{order.address}</div>
                  </div>
                </div>

                {order.customerNotes && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border-2 border-amber-200">
                    <MessageSquare className="w-5 h-5 text-amber-600 mt-1" />
                    <div className="flex-1">
                      <div className="text-xs text-amber-600 mb-1">ملاحظات العميل</div>
                      <div className="text-sm text-amber-900 font-semibold">
                        {order.customerNotes}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-4">الأصناف المطلوبة</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">الكمية: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-600">
                        {(item.price * item.quantity).toFixed(3)} د.ك
                      </div>
                      <div className="text-xs text-gray-500">{item.price.toFixed(3)} د.ك / قطعة</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold">{order.subtotal.toFixed(3)} د.ك</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>رسوم التوصيل</span>
                  <span className="font-bold">{order.deliveryFee.toFixed(3)} د.ك</span>
                </div>
                <div className="flex items-center justify-between text-red-600">
                  <span>عمولة المنصة (10%)</span>
                  <span className="font-bold">-{order.commission.toFixed(3)} د.ك</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
                  <span className="font-bold text-gray-900">الإجمالي للعميل</span>
                  <span className="font-black text-xl text-emerald-600">
                    {order.total.toFixed(3)} د.ك
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <span className="font-bold text-emerald-900">صافي ربحك</span>
                  <span className="font-black text-xl text-emerald-600">
                    {order.netAmount.toFixed(3)} د.ك
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4">إجراءات سريعة</h3>
              <div className="space-y-3">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus('preparing')}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    <span>بدء التحضير</span>
                  </button>
                )}

                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleUpdateStatus('ready')}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>الطلب جاهز</span>
                  </button>
                )}

                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                  <Printer className="w-5 h-5" />
                  <span>طباعة الطلب</span>
                </button>

                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>تحميل الفاتورة</span>
                </button>

                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border-2 border-red-200"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>إلغاء الطلب</span>
                  </button>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4">معلومات الدفع</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">طريقة الدفع</span>
                  <span className="font-bold text-gray-900">
                    {order.paymentMethod === 'card' ? 'بطاقة ائتمانية' : 'كاش'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <span className="text-green-700">حالة الدفع</span>
                  <span className="font-bold text-green-700">
                    {order.paymentStatus === 'paid' ? '✓ مدفوع' : 'غير مدفوع'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4">معلومات الطلب</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">رقم الطلب</span>
                  <span className="font-bold text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">تاريخ الطلب</span>
                  <span className="font-bold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('ar-KW')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">وقت الطلب</span>
                  <span className="font-bold text-gray-900">
                    {new Date(order.createdAt).toLocaleTimeString('ar-KW', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
