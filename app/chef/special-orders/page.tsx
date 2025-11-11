'use client';

// ============================================
// ChefHub - Chef Special Orders Management
// ============================================

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Plus,
  Search,
  ChefHat,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

// Mock special orders data
const MOCK_SPECIAL_ORDERS = [
  {
    id: '1',
    title: 'غبقة رمضان 2025',
    titleEn: 'Ramadan Ghabqa 2025',
    description: 'وجبة رمضانية كاملة تشمل مجبوس، سمبوسة، لقيمات، وعصيرات طازجة',
    price: 15.000,
    originalPrice: 18.000,
    maxOrders: 50,
    currentOrders: 32,
    startDate: '2025-03-15',
    endDate: '2025-04-15',
    status: 'active' as const,
    isActive: true,
    createdAt: '2025-03-01',
  },
  {
    id: '2',
    title: 'كبسة عيد الفطر',
    titleEn: 'Eid Kabsa Special',
    description: 'كبسة لحم فاخرة مع مكسرات ذهبية وسلطات متنوعة',
    price: 12.500,
    originalPrice: 15.000,
    maxOrders: 30,
    currentOrders: 30,
    startDate: '2025-04-01',
    endDate: '2025-04-10',
    status: 'sold_out' as const,
    isActive: true,
    createdAt: '2025-03-20',
  },
  {
    id: '3',
    title: 'حلويات المولد النبوي',
    titleEn: 'Mawlid Sweets',
    description: 'تشكيلة حلويات فاخرة بمناسبة المولد النبوي الشريف',
    price: 8.000,
    originalPrice: 10.000,
    maxOrders: 100,
    currentOrders: 45,
    startDate: '2025-02-20',
    endDate: '2025-02-28',
    status: 'expired' as const,
    isActive: false,
    createdAt: '2025-02-10',
  },
];

export default function ChefSpecialOrdersPage() {
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'sold_out':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'expired':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'sold_out':
        return 'مكتمل';
      case 'expired':
        return 'منتهي';
      default:
        return status;
    }
  };

  const filteredOrders = MOCK_SPECIAL_ORDERS.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: MOCK_SPECIAL_ORDERS.length,
    active: MOCK_SPECIAL_ORDERS.filter((o) => o.status === 'active').length,
    soldOut: MOCK_SPECIAL_ORDERS.filter((o) => o.status === 'sold_out').length,
    expired: MOCK_SPECIAL_ORDERS.filter((o) => o.status === 'expired').length,
  };

  const getProgress = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/chef/dashboard" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  الطلبات الخاصة
                </h1>
                <span className="text-xs text-gray-500">{userData?.name || 'الشيف'}</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/chef/special-orders/new"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">طلب خاص جديد</span>
              </Link>

              <Link
                href="/chef/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">طلباتي الخاصة 🌟</h2>
          <p className="text-gray-600">إدارة العروض والطلبات الموسمية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">إجمالي</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <div className="text-3xl font-black text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">نشط</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-amber-200">
            <div className="text-3xl font-black text-amber-600">{stats.soldOut}</div>
            <div className="text-sm text-gray-600">مكتمل</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="text-3xl font-black text-gray-500">{stats.expired}</div>
            <div className="text-sm text-gray-600">منتهي</div>
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
                placeholder="ابحث عن طلب خاص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filterStatus === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                نشط ({stats.active})
              </button>
              <button
                onClick={() => setFilterStatus('sold_out')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filterStatus === 'sold_out'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                مكتمل ({stats.soldOut})
              </button>
            </div>
          </div>
        </div>

        {/* Special Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-2xl overflow-hidden border-2 transition-all hover:shadow-xl ${
                order.status === 'active'
                  ? 'border-green-200 hover:border-green-300'
                  : 'border-gray-200 opacity-75'
              }`}
            >
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <div className="text-6xl">🌟</div>
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-black text-gray-900 mb-1">{order.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{order.titleEn}</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{order.description}</p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-xl font-black text-emerald-600">
                      {order.price.toFixed(3)}
                    </span>
                    <span className="text-xs text-gray-500">د.ك</span>
                  </div>
                  {order.originalPrice > order.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {order.originalPrice.toFixed(3)}
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {order.currentOrders} / {order.maxOrders}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {Math.round(getProgress(order.currentOrders, order.maxOrders))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        order.status === 'sold_out'
                          ? 'bg-amber-500'
                          : order.currentOrders / order.maxOrders > 0.8
                          ? 'bg-orange-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${getProgress(order.currentOrders, order.maxOrders)}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">يبدأ</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(order.startDate).toLocaleDateString('ar-KW', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ينتهي</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(order.endDate).toLocaleDateString('ar-KW', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* Days Remaining */}
                {order.status === 'active' && (
                  <div className="flex items-center gap-2 mb-4 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">
                      {getDaysRemaining(order.endDate)} يوم متبقي
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/chef/special-orders/${order.id}/edit`}
                    className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل</span>
                  </Link>
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                    {order.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات خاصة</h3>
            <p className="text-gray-600 mb-6">ابدأ بإنشاء طلب خاص جديد لجذب المزيد من العملاء</p>
            <Link
              href="/chef/special-orders/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>إنشاء طلب خاص جديد</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
