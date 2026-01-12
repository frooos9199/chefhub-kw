'use client';

// ============================================
// ChefHub - Chef Dashboard Main Page
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Star,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChefHat,
  Settings,
  LogOut,
  Bell,
  Plus,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useChefOrders, useChefDishes } from '@/lib/firebase/hooks';
import { getOrderStatusColor, getOrderStatusText, formatKWD } from '@/lib/helpers';
import { OrderFirestore } from '@/types/firebase';

// حساب الإحصائيات من البيانات الحقيقية
function calculateStats(orders: any[], dishes: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  
  const completedToday = orders.filter((o) => {
    const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
    return orderDate >= today && o.status === 'ready';
  }).length;

  const totalRevenue = orders
    .filter((o) => o.status === 'ready' || o.status === 'on_the_way')
    .reduce((sum, o) => sum + (o.total - (o.commission || 0)), 0);

  const monthlyRevenue = orders
    .filter((o) => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      return (
        orderDate >= thisMonth &&
        (o.status === 'ready' || o.status === 'on_the_way')
      );
    })
    .reduce((sum, o) => sum + (o.total - (o.commission || 0)), 0);

  const totalDishes = dishes.length;
  const activeDishes = dishes.filter((d) => d.isActive).length;

  return {
    totalOrders,
    pendingOrders,
    completedToday,
    totalRevenue,
    monthlyRevenue,
    totalDishes,
    activeDishes,
  };
}

export default function ChefDashboardPage() {
  const { user, userData, signOut } = useAuth();
  const router = useRouter();
  
  // جلب بيانات الطلبات والأصناف من Firebase
  const { data: allOrders, loading: ordersLoading } = useChefOrders(userData?.id || '');
  const { data: dishes, loading: dishesLoading } = useChefDishes(userData?.id || '');

  const loading = ordersLoading || dishesLoading;

  // Redirect if not chef
  if (userData && userData.role !== 'chef') {
    router.push('/');
    return null;
  }

  // حساب الإحصائيات
  const stats = calculateStats(allOrders || [], dishes || []);
  
  // آخر 5 طلبات
  const recentOrders = (allOrders || [])
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    لوحة التحكم
                  </h1>
                  <span className="text-xs text-gray-500">{userData?.name || 'الشيف'}</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              <Link
                href="/chef/settings"
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>

              <button 
                onClick={handleSignOut}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            مرحباً، {userData?.name || 'الشيف'} 👋
          </h2>
          <p className="text-gray-600">إليك ملخص نشاطك اليوم</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-500">إجمالي</span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.totalOrders}</div>
            <div className="text-sm text-gray-600">طلب كلي</div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              {stats.pendingOrders > 0 && (
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
                  جديد
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-amber-600 mb-1">{stats.pendingOrders}</div>
            <div className="text-sm text-gray-600">طلب قيد الانتظار</div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 hover:border-green-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-black text-green-600 mb-1">
              {formatKWD(stats.monthlyRevenue)}
            </div>
            <div className="text-sm text-gray-600">دينار كويتي (هذا الشهر)</div>
          </div>

          {/* Dishes */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">{stats.activeDishes} نشط</span>
            </div>
            <div className="text-3xl font-black text-purple-600 mb-1">{stats.totalDishes}</div>
            <div className="text-sm text-gray-600">صنف متاح</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/chef/dishes/new"
            className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>إضافة صنف جديد</span>
          </Link>

          <Link
            href="/chef/special-orders/new"
            className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>طلب خاص جديد</span>
          </Link>

          <Link
            href="/chef/orders"
            className="p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            <span>كل الطلبات</span>
          </Link>

          <Link
            href="/chef/dishes"
            className="p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>إدارة الأصناف</span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-gray-900">الطلبات الأخيرة</h3>
            <Link
              href="/chef/orders"
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              عرض الكل ←
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-emerald-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.items?.length || 0} صنف</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{formatKWD(order.total)}</div>
                    <div className="text-xs text-gray-500">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleTimeString('ar-KW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getOrderStatusColor(
                      order.status
                    )}`}
                  >
                    {getOrderStatusText(order.status)}
                  </div>
                </div>

                <Link
                  href={`/chef/orders/${order.id}`}
                  className="mr-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                >
                  عرض
                </Link>
              </div>
            ))}
          </div>

          {recentOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات جديدة</h3>
              <p className="text-gray-600">ستظهر الطلبات الجديدة هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
