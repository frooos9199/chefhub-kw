'use client';

// ============================================
// ChefHub - Customer Orders Page
// ============================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Loader2,
  Search,
  ShoppingBag,
  Receipt,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/lib/firebase/hooks';
import { formatKWD, getOrderStatusColor, getOrderStatusText } from '@/lib/helpers';

type OrderStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

type FirestoreTimestampLike = { toDate: () => Date };

type CustomerOrderItem = {
  dishName?: string;
  name?: string;
  quantity?: number;
  price?: number;
};

type CustomerOrder = {
  id: string;
  orderNumber?: string;
  chefName?: string;
  status?: string;
  total?: number;
  items?: CustomerOrderItem[];
  createdAt?: FirestoreTimestampLike | string | number | Date;
};

function getCreatedAtMs(createdAt: CustomerOrder['createdAt']): number {
  if (!createdAt) return 0;
  if (typeof (createdAt as FirestoreTimestampLike).toDate === 'function') {
    return (createdAt as FirestoreTimestampLike).toDate().getTime();
  }
  const asDate = new Date(createdAt as string | number | Date);
  return Number.isFinite(asDate.getTime()) ? asDate.getTime() : 0;
}

function formatCreatedAt(createdAt: CustomerOrder['createdAt']): string {
  if (!createdAt) return '--';
  if (typeof (createdAt as FirestoreTimestampLike).toDate === 'function') {
    return (createdAt as FirestoreTimestampLike).toDate().toLocaleString('ar-KW', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
  const asDate = new Date(createdAt as string | number | Date);
  if (!Number.isFinite(asDate.getTime())) return '--';
  return asDate.toLocaleString('ar-KW', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function CustomerOrdersPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allOrders, loading } = useCustomerOrders(userData?.uid || null);
  const orders = (Array.isArray(allOrders) ? allOrders : []) as CustomerOrder[];

  const redirectTo = useMemo(() => {
    if (authLoading) return null;
    if (!user) return '/auth/login';
    if (userData?.role && userData.role !== 'customer') {
      return userData.role === 'chef'
        ? '/chef/orders'
        : userData.role === 'admin'
          ? '/admin/orders'
          : '/';
    }
    return null;
  }, [authLoading, user, userData?.role]);

  useEffect(() => {
    if (!redirectTo) return;
    router.replace(redirectTo);
  }, [redirectTo, router]);

  const statusCounts = useMemo(() => {
    const base = {
      all: 0,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      on_the_way: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const order of orders) {
      base.all += 1;
      const s = order.status as keyof typeof base;
      if (s && s in base) {
        base[s] += 1;
      }
    }

    return base;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          q === '' ||
          (order.orderNumber || '').toLowerCase().includes(q) ||
          String(order.id || '').toLowerCase().includes(q) ||
          (order.chefName || '').toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
      })
      .slice()
      .sort((a, b) => getCreatedAtMs(b.createdAt) - getCreatedAtMs(a.createdAt));
  }, [orders, selectedStatus, searchQuery]);

  const isLoading = authLoading || loading || !!redirectTo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  طلباتي
                </h1>
                <span className="text-xs text-gray-500">{userData?.name || 'العميل'}</span>
              </div>
            </div>

            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">الطلبات 📦</h2>
          <p className="text-gray-600">تابع حالة طلباتك وسجل مشترياتك</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Search & Filters */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث برقم الطلب أو اسم الشيف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {(
                  [
                    { key: 'all', label: `الكل (${statusCounts.all})` },
                    { key: 'pending', label: `انتظار (${statusCounts.pending})` },
                    { key: 'preparing', label: `تحضير (${statusCounts.preparing})` },
                    { key: 'ready', label: `جاهز (${statusCounts.ready})` },
                    { key: 'on_the_way', label: `بالطريق (${statusCounts.on_the_way})` },
                    { key: 'delivered', label: `تم (${statusCounts.delivered})` },
                    { key: 'cancelled', label: `ملغي (${statusCounts.cancelled})` },
                  ] as Array<{ key: OrderStatus; label: string }>
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedStatus(tab.key)}
                    className={
                      'px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ' +
                      (selectedStatus === tab.key
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-200')
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-black text-lg text-gray-900">
                          {order.orderNumber || `#${String(order.id || '').slice(0, 8)}`}
                        </div>
                        <div className="text-sm text-gray-600">{order.chefName || 'الشيف'}</div>
                        <div className="text-xs text-gray-500">{order.items?.length || 0} صنف</div>
                      </div>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getOrderStatusColor(
                        order.status || 'pending'
                      )}`}
                    >
                      {getOrderStatusText(order.status || 'pending')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">التاريخ</div>
                      <div className="font-bold text-gray-900">{formatCreatedAt(order.createdAt)}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">الإجمالي</div>
                      <div className="font-black text-emerald-600 text-lg">
                        {formatKWD(Number(order.total) || 0)}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">الفاتورة</div>
                        <div className="text-sm text-gray-700">عرض تفاصيل الفاتورة</div>
                      </div>
                      <Link
                        href={`/invoice/${order.id}`}
                        className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4" />
                        عرض
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بالتسوق وسيظهر سجل طلباتك هنا</p>
                  <Link
                    href="/browse"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    تصفح الآن
                    <ShoppingBag className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
