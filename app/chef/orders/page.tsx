'use client';

// ============================================
// ChefHub - Chef Orders Management Page  
// ============================================

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  Clock,
  Search,
  ChefHat,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useChefOrders } from '@/lib/firebase/hooks';
import { getOrderStatusColor, getOrderStatusText, formatKWD } from '@/lib/helpers';

export default function ChefOrdersPage() {
  const { userData } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // جلب الطلبات من Firebase
  const { data: allOrders, loading } = useChefOrders(userData?.id || '');

  // تصفية الطلبات
  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    
    return allOrders.filter((order) => {
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesSearch =
        searchQuery === '' ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [allOrders, selectedStatus, searchQuery]);

  // حساب عدد الطلبات لكل حالة
  const statusCounts = useMemo(() => {
    if (!allOrders) return {
      all: 0,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      on_the_way: 0,
      cancelled: 0,
    };

    return {
      all: allOrders.length,
      pending: allOrders.filter((o) => o.status === 'pending').length,
      confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
      preparing: allOrders.filter((o) => o.status === 'preparing').length,
      ready: allOrders.filter((o) => o.status === 'ready').length,
      on_the_way: allOrders.filter((o) => o.status === 'on_the_way').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
    };
  }, [allOrders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/chef/dashboard" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  إدارة الطلبات
                </h1>
                <span className="text-xs text-gray-500">{userData?.name || 'الشيف'}</span>
              </div>
            </Link>

            <Link
              href="/chef/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">طلباتي 📦</h2>
          <p className="text-gray-600">إدارة ومتابعة جميع الطلبات</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Search & Filters */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث برقم الطلب أو اسم العميل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  الكل ({statusCounts.all})
                </button>
                <button
                  onClick={() => setSelectedStatus('pending')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'pending'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-amber-700 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  جديد ({statusCounts.pending})
                </button>
                <button
                  onClick={() => setSelectedStatus('confirmed')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'confirmed'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-blue-700 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  مؤكد ({statusCounts.confirmed})
                </button>
                <button
                  onClick={() => setSelectedStatus('preparing')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'preparing'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-purple-700 border-purple-200 hover:border-purple-300'
                  }`}
                >
                  قيد التحضير ({statusCounts.preparing})
                </button>
                <button
                  onClick={() => setSelectedStatus('ready')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'ready'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-700 border-green-200 hover:border-green-300'
                  }`}
                >
                  جاهز ({statusCounts.ready})
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-black text-lg text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600">
                          {order.createdAt?.toDate
                            ? order.createdAt.toDate().toLocaleString('ar-KW', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '--'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {getOrderStatusText(order.status)}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">اسم العميل</div>
                        <div className="font-bold text-gray-900">{order.customerName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">رقم الهاتف</div>
                        <div className="font-bold text-emerald-600">{order.customerPhone}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 mb-1">عنوان التوصيل</div>
                        <div className="font-bold text-gray-900">
                          {order.governorate} - {order.area}
                        </div>
                        <div className="text-sm text-gray-600">{order.address}</div>
                      </div>
                      {order.customerNotes && (
                        <div className="md:col-span-2">
                          <div className="text-xs text-gray-500 mb-1">ملاحظات العميل</div>
                          <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                            {order.customerNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <div className="text-sm font-bold text-gray-700 mb-2">الأصناف المطلوبة:</div>
                    <div className="space-y-2">
                      {order.items?.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <span className="font-bold text-emerald-600">{item.quantity}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{item.dishName}</span>
                          </div>
                          <span className="font-bold text-emerald-600">
                            {formatKWD(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-4 p-4 bg-emerald-50 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">المجموع الفرعي:</span>
                      <span className="font-bold text-gray-900">{formatKWD(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">رسوم التوصيل:</span>
                      <span className="font-bold text-gray-900">{formatKWD(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">العمولة (10%):</span>
                      <span className="font-bold text-red-600">- {formatKWD(order.commission)}</span>
                    </div>
                    <div className="pt-2 border-t-2 border-emerald-200 flex justify-between">
                      <span className="font-black text-lg text-gray-900">صافي الربح:</span>
                      <span className="font-black text-2xl text-emerald-600">
                        {formatKWD(order.total - order.commission)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/chef/orders/${order.id}`}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-center"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات</h3>
                  <p className="text-gray-600">ستظهر الطلبات هنا عند استلامها</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
