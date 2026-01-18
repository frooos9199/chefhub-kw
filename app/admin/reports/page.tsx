'use client';

// ============================================
// ChefHub - Admin Reports Page
// ============================================

import { useState } from 'react';
import {
  Shield,
  TrendingUp,
  Calendar,
  Download,
  ChefHat,
  Package,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<'revenue' | 'chefs' | 'orders' | 'customers'>('revenue');
  const [dateRange, setDateRange] = useState('this_month');

  // Mock data
  const revenueData = {
    totalRevenue: 125680.500,
    totalCommission: 12568.050,
    totalOrders: 1245,
    avgOrderValue: 100.947,
    growth: 15.5,
  };

  const topChefs = [
    { name: 'الشيف منى سالم', revenue: 12345.000, orders: 678, rating: 4.9 },
    { name: 'الشيف فاطمة أحمد', revenue: 8456.000, orders: 456, rating: 4.8 },
    { name: 'الشيف يوسف محمد', revenue: 4567.000, orders: 234, rating: 4.6 },
  ];

  const monthlyData = [
    { month: 'يناير', revenue: 15000.000, orders: 150 },
    { month: 'فبراير', revenue: 18000.000, orders: 180 },
    { month: 'مارس', revenue: 22000.000, orders: 220 },
    { month: 'أبريل', revenue: 20000.000, orders: 200 },
    { month: 'مايو', revenue: 25000.000, orders: 250 },
    { month: 'يونيو', revenue: 25680.500, orders: 245 },
  ];

  const governorateData = [
    { name: 'حولي', orders: 450, percentage: 36 },
    { name: 'العاصمة', orders: 350, percentage: 28 },
    { name: 'الفروانية', orders: 250, percentage: 20 },
    { name: 'الجهراء', orders: 125, percentage: 10 },
    { name: 'الأحمدي', orders: 70, percentage: 6 },
  ];

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
                  التقارير والتحليلات
                </h1>
                <span className="text-xs text-gray-500">Admin Panel - Reports</span>
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
          <h2 className="text-3xl font-black text-gray-900 mb-2">التقارير 📊</h2>
          <p className="text-gray-600">تحليلات شاملة وتقارير مفصلة عن أداء المنصة</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">نوع التقرير</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all font-semibold"
              >
                <option value="revenue">الإيرادات والعمولات</option>
                <option value="chefs">أداء الشيف</option>
                <option value="orders">تحليل الطلبات</option>
                <option value="customers">العملاء</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">الفترة الزمنية</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all font-semibold"
              >
                <option value="today">اليوم</option>
                <option value="this_week">هذا الأسبوع</option>
                <option value="this_month">هذا الشهر</option>
                <option value="last_month">الشهر الماضي</option>
                <option value="this_year">هذا العام</option>
                <option value="custom">تخصيص</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => alert('سيتم تفعيل تصدير PDF قريباً 📄')}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                تصدير PDF
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Report */}
        {reportType === 'revenue' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
                </div>
                <div className="text-3xl font-black text-emerald-600 mb-2">
                  {revenueData.totalRevenue.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">دينار كويتي</div>
                <div className="flex items-center gap-1 text-sm font-bold text-green-600 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  +{revenueData.growth}%
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-sm text-gray-600">عمولة المنصة</div>
                </div>
                <div className="text-3xl font-black text-purple-600 mb-2">
                  {revenueData.totalCommission.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">دينار كويتي (10%)</div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-600">عدد الطلبات</div>
                </div>
                <div className="text-3xl font-black text-blue-600 mb-2">{revenueData.totalOrders}</div>
                <div className="text-xs text-gray-500">طلب مكتمل</div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-sm text-gray-600">متوسط قيمة الطلب</div>
                </div>
                <div className="text-3xl font-black text-indigo-600 mb-2">
                  {revenueData.avgOrderValue.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">دينار كويتي</div>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">الإيرادات الشهرية</h3>
              <div className="space-y-3">
                {monthlyData.map((month) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">{month.month}</span>
                      <div className="text-right">
                        <div className="font-black text-emerald-600">{month.revenue.toFixed(3)} د.ك</div>
                        <div className="text-xs text-gray-500">{month.orders} طلب</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${(month.revenue / 30000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Chefs */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">أفضل الشيف أداءً</h3>
              <div className="space-y-4">
                {topChefs.map((chef, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center font-black text-emerald-600">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{chef.name}</div>
                        <div className="text-sm text-gray-600">{chef.orders} طلب</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-600">{chef.revenue.toFixed(3)} د.ك</div>
                      <div className="text-sm text-amber-600 font-bold">⭐ {chef.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders by Governorate */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">التوزيع حسب المحافظة</h3>
              <div className="space-y-4">
                {governorateData.map((gov) => (
                  <div key={gov.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">{gov.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{gov.orders} طلب</span>
                        <span className="font-black text-purple-600">{gov.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all"
                        style={{ width: `${gov.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other Report Types Placeholder */}
        {reportType !== 'revenue' && (
          <div className="bg-white rounded-2xl p-12 border-2 border-gray-100 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {reportType === 'chefs' && 'تقرير أداء الشيف'}
              {reportType === 'orders' && 'تقرير تحليل الطلبات'}
              {reportType === 'customers' && 'تقرير العملاء'}
            </h3>
            <p className="text-gray-600 mb-6">سيتم إضافة هذا التقرير قريباً</p>
            <button
              onClick={() => setReportType('revenue')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              عرض تقرير الإيرادات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
