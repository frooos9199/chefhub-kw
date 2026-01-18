'use client';

// ============================================
// ChefHub - Admin Dashboard Main Page
// ============================================

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  Users,
  ChefHat,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Settings,
  LogOut,
  BarChart3,
  Loader2,
  Image as ImageIcon,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { useCollection, usePendingChefs } from '@/lib/firebase/hooks';
import { formatKWD, getOrderStatusColor, getOrderStatusText } from '@/lib/helpers';

// حساب الإحصائيات من البيانات الحقيقية
function calculateAdminStats(chefs: any[], orders: any[], users: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalChefs = chefs.length;
  const pendingChefs = chefs.filter((c) => c.status === 'pending').length;
  const activeChefs = chefs.filter((c) => c.status === 'approved').length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  
  const totalOrders = orders.length;
  const todayOrders = orders.filter((o) => {
    const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
    return orderDate >= today;
  }).length;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const platformCommission = orders.reduce((sum, o) => sum + (o.commission || 0), 0);
  
  const monthlyRevenue = orders
    .filter((o) => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      return orderDate >= thisMonth;
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Find top chef
  const chefRevenues = new Map();
  orders.forEach((order) => {
    const current = chefRevenues.get(order.chefId) || { orders: 0, revenue: 0, name: order.chefName };
    chefRevenues.set(order.chefId, {
      orders: current.orders + 1,
      revenue: current.revenue + (order.total || 0),
      name: order.chefName,
    });
  });

  let topChef = { name: 'لا يوجد', orders: 0, revenue: 0 };
  chefRevenues.forEach((value) => {
    if (value.revenue > topChef.revenue) {
      topChef = value;
    }
  });

  return {
    totalChefs,
    pendingChefs,
    activeChefs,
    totalCustomers,
    totalOrders,
    todayOrders,
    totalRevenue,
    platformCommission,
    monthlyRevenue,
    averageOrderValue,
    topChef,
  };
}

export default function AdminDashboardPage() {
  const { userData, signOut } = useAuth();
  const router = useRouter();

  const adminName = (typeof (userData as any)?.name === 'string' && (userData as any).name.trim())
    ? (userData as any).name.trim()
    : 'Admin';

  // Redirect if not admin (قبل أي hooks أخرى)
  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      router.push('/');
    }
  }, [userData, router]);

  // جلب البيانات من Firebase (فقط إذا كان المستخدم admin أو loading)
  const shouldFetch = !userData || userData.role === 'admin';
  
  const { data: allChefs, loading: chefsLoading } = useCollection(
    'chefs',
    shouldFetch ? undefined : [], // لن يجلب إذا لم يكن admin
    undefined,
    'desc',
    undefined
  );
  const { data: allOrders, loading: ordersLoading } = useCollection(
    'orders',
    shouldFetch ? undefined : [],
    undefined,
    'desc',
    undefined
  );
  const { data: allUsers, loading: usersLoading } = useCollection(
    'users',
    shouldFetch ? undefined : [],
    undefined,
    'desc',
    undefined
  );
  const { data: pendingChefs, loading: pendingLoading } = usePendingChefs();

  const loading = chefsLoading || ordersLoading || usersLoading;

  // حساب الإحصائيات
  const stats = useMemo(() => {
    return calculateAdminStats(allChefs || [], allOrders || [], allUsers || []);
  }, [allChefs, allOrders, allUsers]);

  // آخر 5 طلبات
  const recentOrders = useMemo(() => {
    if (!allOrders) return [];
    return [...allOrders]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [allOrders]);

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">جاري تحميل لوحة التحكم...</p>
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
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  لوحة تحكم الأدمن
                </h1>
                <span className="text-xs text-gray-500">ChefHub</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href="/admin/banners"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-bold text-sm"
                aria-label="إدارة البنرات"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">إدارة البنرات</span>
              </Link>
              <Link
                href="/admin/settings"
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="الإعدادات"
                title="الإعدادات"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            مرحباً، {adminName} 👋
          </h2>
          <p className="text-gray-600">إليك نظرة عامة على المنصة</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Chefs */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.totalChefs}</div>
            <div className="text-sm text-gray-600 mb-2">إجمالي الشيف</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">
                {stats.pendingChefs} قيد المراجعة
              </span>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.totalCustomers}</div>
            <div className="text-sm text-gray-600">إجمالي العملاء</div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-500">{stats.todayOrders} اليوم</span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.totalOrders}</div>
            <div className="text-sm text-gray-600">إجمالي الطلبات</div>
          </div>

          {/* Platform Commission */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-green-200 hover:border-green-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-black text-green-600 mb-1">
              {formatKWD(stats.platformCommission)}
            </div>
            <div className="text-sm text-gray-600">عمولة المنصة</div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm opacity-90">إجمالي الإيرادات</span>
            </div>
            <div className="text-3xl font-black mb-2">{formatKWD(stats.totalRevenue)}</div>
            <div className="text-xs opacity-75">منذ بداية التشغيل</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">إيرادات الشهر</span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-2">
              {formatKWD(stats.monthlyRevenue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>هذا الشهر</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">متوسط قيمة الطلب</span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-2">
              {formatKWD(stats.averageOrderValue)}
            </div>
            <div className="text-xs text-gray-500">لكل طلب</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-4">إجراءات سريعة</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/admin/banners"
              className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg">إدارة البنرات</div>
                  <div className="text-sm opacity-90">إضافة وتعديل الإعلانات</div>
                </div>
              </div>
              <div className="text-xs opacity-75">أضف بنرات إعلانية للصفحة الرئيسية</div>
            </Link>

            <Link
              href="/admin/chef"
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChefHat className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">إدارة الشيف</div>
                  <div className="text-sm text-gray-600">مراجعة وموافقة</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">عرض وإدارة طلبات الشيف</div>
            </Link>

            <Link
              href="/admin/orders"
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">إدارة الطلبات</div>
                  <div className="text-sm text-gray-600">متابعة ومراقبة</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">عرض جميع الطلبات في المنصة</div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Chefs */}
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-black text-gray-900">
                  شيف قيد المراجعة ({stats.pendingChefs})
                </h3>
              </div>
              <Link
                href="/admin/chef"
                className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                عرض الكل ←
              </Link>
            </div>

            <div className="space-y-3">
              {(pendingChefs || []).slice(0, 3).map((chef: any) => (
                <div
                  key={chef.id}
                  className="p-4 bg-amber-50 rounded-xl border-2 border-amber-100 hover:border-amber-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{chef.name}</div>
                      <div className="text-sm text-gray-600">{chef.specialty}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {chef.createdAt?.toDate
                        ? chef.createdAt.toDate().toLocaleDateString('ar-KW')
                        : '--'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="text-gray-600">
                      <span className="text-xs">📧</span> {chef.email}
                    </div>
                    <div className="text-gray-600">
                      <span className="text-xs">📱</span> {chef.phone}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/chef/${chef.id}`}
                      className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm text-center"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}

              {(pendingChefs || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا يوجد شيف قيد المراجعة
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">آخر الطلبات</h3>
              <Link
                href="/admin/orders"
                className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                عرض الكل ←
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="font-bold text-gray-900">{order.orderNumber}</div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {getOrderStatusText(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div className="text-gray-600">
                      <span className="font-semibold">العميل:</span> {order.customerName}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold">الشيف:</span> {order.chefName}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString('ar-KW')
                        : '--'}
                    </div>
                    <div className="font-bold text-emerald-600">{formatKWD(order.total)}</div>
                  </div>
                </div>
              ))}

              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد طلبات بعد
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-100 bg-white/95 backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-5">
          <Link href="/admin/dashboard" className="flex flex-col items-center justify-center py-2 text-purple-700 font-semibold">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[11px] mt-1">الرئيسية</span>
          </Link>
          <Link href="/admin/chef" className="flex flex-col items-center justify-center py-2 text-gray-700">
            <ChefHat className="w-5 h-5" />
            <span className="text-[11px] mt-1">الشيف</span>
          </Link>
          <Link href="/admin/orders" className="flex flex-col items-center justify-center py-2 text-gray-700">
            <ClipboardList className="w-5 h-5" />
            <span className="text-[11px] mt-1">الطلبات</span>
          </Link>
          <Link href="/admin/banners" className="flex flex-col items-center justify-center py-2 text-gray-700">
            <ImageIcon className="w-5 h-5" />
            <span className="text-[11px] mt-1">بنرات</span>
          </Link>
          <Link href="/admin/settings" className="flex flex-col items-center justify-center py-2 text-gray-700">
            <Settings className="w-5 h-5" />
            <span className="text-[11px] mt-1">إعدادات</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
