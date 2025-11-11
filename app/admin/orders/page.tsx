'use client';

// ============================================
// ChefHub - Admin Orders Management Page
// ============================================

import { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

// Mock orders data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    orderNumber: '#12345',
    customer: {
      name: 'أحمد محمد',
      phone: '+965 9999 9999',
    },
    chef: {
      name: 'الشيف فاطمة',
      id: '1',
    },
    items: 3,
    amount: 15.500,
    commission: 1.550,
    deliveryFee: 1.500,
    total: 17.000,
    governorate: 'حولي',
    status: 'delivered',
    paymentStatus: 'paid',
    date: '2025-11-15 14:30',
  },
  {
    id: 'ORD-002',
    orderNumber: '#12346',
    customer: {
      name: 'فاطمة علي',
      phone: '+965 8888 8888',
    },
    chef: {
      name: 'الشيف يوسف',
      id: '2',
    },
    items: 2,
    amount: 12.000,
    commission: 1.200,
    deliveryFee: 1.000,
    total: 13.000,
    governorate: 'العاصمة',
    status: 'preparing',
    paymentStatus: 'paid',
    date: '2025-11-15 15:45',
  },
  {
    id: 'ORD-003',
    orderNumber: '#12347',
    customer: {
      name: 'سارة خالد',
      phone: '+965 7777 7777',
    },
    chef: {
      name: 'الشيف منى',
      id: '3',
    },
    items: 5,
    amount: 25.000,
    commission: 2.500,
    deliveryFee: 2.000,
    total: 27.000,
    governorate: 'الفروانية',
    status: 'on_the_way',
    paymentStatus: 'paid',
    date: '2025-11-15 16:00',
  },
  {
    id: 'ORD-004',
    orderNumber: '#12348',
    customer: {
      name: 'محمد سالم',
      phone: '+965 6666 6666',
    },
    chef: {
      name: 'الشيف أحمد',
      id: '4',
    },
    items: 1,
    amount: 5.500,
    commission: 0.550,
    deliveryFee: 1.000,
    total: 6.500,
    governorate: 'الجهراء',
    status: 'cancelled',
    paymentStatus: 'refunded',
    date: '2025-11-15 12:20',
  },
  {
    id: 'ORD-005',
    orderNumber: '#12349',
    customer: {
      name: 'مريم أحمد',
      phone: '+965 5555 5555',
    },
    chef: {
      name: 'الشيف فاطمة',
      id: '1',
    },
    items: 4,
    amount: 18.000,
    commission: 1.800,
    deliveryFee: 1.500,
    total: 19.500,
    governorate: 'الأحمدي',
    status: 'pending',
    paymentStatus: 'pending',
    date: '2025-11-15 17:10',
  },
];

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

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

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.chef.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'amount':
        return b.total - a.total;
      case 'commission':
        return b.commission - a.commission;
      default:
        return 0;
    }
  });

  const stats = {
    total: MOCK_ORDERS.length,
    delivered: MOCK_ORDERS.filter((o) => o.status === 'delivered').length,
    active: MOCK_ORDERS.filter((o) => ['preparing', 'on_the_way'].includes(o.status)).length,
    cancelled: MOCK_ORDERS.filter((o) => o.status === 'cancelled').length,
    totalRevenue: MOCK_ORDERS.reduce((sum, o) => sum + o.amount, 0),
    totalCommission: MOCK_ORDERS.reduce((sum, o) => sum + o.commission, 0),
  };

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
            <div className="text-3xl font-black text-blue-600">{stats.active}</div>
            <div className="text-sm text-gray-600">نشطة</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-red-200">
            <div className="text-3xl font-black text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">ملغية</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
            <div className="text-xl font-black text-emerald-600">{stats.totalRevenue.toFixed(3)}</div>
            <div className="text-sm text-gray-600">الإيرادات (د.ك)</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
            <div className="text-xl font-black text-purple-600">{stats.totalCommission.toFixed(3)}</div>
            <div className="text-sm text-gray-600">العمولة (د.ك)</div>
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <span className="font-black text-purple-600">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{order.customer.name}</div>
                          <div className="text-xs text-gray-500">{order.customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ChefHat className="w-4 h-4 text-emerald-600" />
                        </div>
                        <Link
                          href={`/admin/chefs/${order.chef.id}`}
                          className="font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          {order.chef.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {order.governorate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900">{order.items}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-600">{order.amount.toFixed(3)} د.ك</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-purple-600">{order.commission.toFixed(3)} د.ك</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900">{order.total.toFixed(3)} د.ك</span>
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
                        <span>{new Date(order.date).toLocaleString('ar-KW', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all inline-flex items-center"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
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
