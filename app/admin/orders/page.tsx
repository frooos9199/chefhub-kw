'use client';

// ============================================
// ChefHub - Admin Orders Management Page
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/lib/firebase/hooks';
import {
  Shield,
  Search,
  Filter,
  Calendar,
  Package,
  TrendingUp,
  Eye,
  Download,
  ChefHat,
  User,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { formatKWD } from '@/lib/helpers';

export default function AdminOrdersPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // التحقق من صلاحيات الأدمن
  useEffect(() => {
    if (!authLoading) {
      if (!user || userData?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, userData, authLoading, router]);

  // جلب الطلبات من Firebase
  const { data: orders, loading } = useCollection('orders');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'on_the_way':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'preparing':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'تم التوصيل';
      case 'on_the_way':
        return 'في الطريق';
      case 'preparing':
        return 'قيد التحضير';
      case 'pending':
        return 'قيد الانتظار';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  // تصفية وترتيب الطلبات
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders.filter((order: any) => {
      const matchesSearch =
        searchQuery === '' ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.chefName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // ترتيب الطلبات
    if (sortBy === 'date') {
      filtered.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  }, [orders, searchQuery, filterStatus, sortBy]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    if (!orders) return {
      total: 0,
      pending: 0,
      preparing: 0,
      on_the_way: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
    };

    return {
      total: orders.length,
      pending: orders.filter((o: any) => o.status === 'pending').length,
      preparing: orders.filter((o: any) => o.status === 'preparing').length,
      on_the_way: orders.filter((o: any) => o.status === 'on_the_way').length,
      delivered: orders.filter((o: any) => o.status === 'delivered').length,
      cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0),
    };
  }, [orders]);

  // رسالة التحميل
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  إدارة الطلبات
                </h1>
                <span className="text-xs text-gray-500">Admin Panel - Orders</span>
              </div>
            </Link>

            <Link
              href="/admin/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              لوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">الطلبات 📦</h2>
          <p className="text-gray-600">مراقبة وإدارة جميع الطلبات على المنصة</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">إجمالي</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <div className="text-3xl font-black text-green-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">مكتملة</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
            <div className="text-3xl font-black text-blue-600">
              {stats.preparing + stats.on_the_way}
            </div>
            <div className="text-sm text-gray-600">نشطة</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-red-200">
            <div className="text-3xl font-black text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">ملغية</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
            <div className="text-xl font-black text-emerald-600">
              {formatKWD(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">الإيرادات</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="text-3xl font-black text-gray-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">قيد الانتظار</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث برقم الطلب، اسم العميل، أو الشيف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all font-semibold"
            >
              <option value="all">كل الحالات ({stats.total})</option>
              <option value="delivered">مكتملة ({stats.delivered})</option>
              <option value="preparing">قيد التحضير</option>
              <option value="on_the_way">في الطريق</option>
              <option value="pending">قيد الانتظار</option>
              <option value="cancelled">ملغية ({stats.cancelled})</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all font-semibold"
            >
              <option value="date">الأحدث</option>
              <option value="amount">الأعلى قيمة</option>
              <option value="commission">الأعلى عمولة</option>
            </select>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              <Download className="w-5 h-5" />
              تصدير
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">رقم الطلب</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">الشيف</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">المحافظة</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">الأصناف</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">العمولة</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">الإجمالي</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">لا توجد طلبات</p>
                        <p className="text-sm">لم يتم العثور على طلبات مطابقة للبحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4">
                        <span className="font-black text-purple-600">#{order.id?.slice(0, 8) || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{order.customerName || 'غير محدد'}</div>
                            <div className="text-xs text-gray-500">{order.phone || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ChefHat className="w-4 h-4 text-emerald-600" />
                          </div>
                          {order.chefId ? (
                            <Link
                              href={`/admin/chefs/${order.chefId}`}
                              className="font-bold text-emerald-600 hover:text-emerald-700"
                            >
                              {order.chefName || 'شيف'}
                            </Link>
                          ) : (
                            <span className="font-bold text-gray-600">{order.chefName || 'غير محدد'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {order.governorate || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-gray-900">
                            {Array.isArray(order.items) ? order.items.length : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-600">
                          {formatKWD(order.subtotal || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-600">
                          {formatKWD((order.subtotal || 0) * 0.1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-900">
                          {formatKWD(order.total || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            {order.createdAt?.toDate
                              ? new Date(order.createdAt.toDate()).toLocaleDateString('ar-KW', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/invoice/${order.id}`}
                          className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all inline-flex items-center"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600">جرب البحث بكلمات مختلفة أو اختر فلتر آخر</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
