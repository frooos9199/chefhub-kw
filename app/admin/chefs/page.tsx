'use client';

// ============================================
// ChefHub - Admin Chefs Management Page
// ============================================

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  ChefHat,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  Eye,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useCollection } from '@/lib/firebase/hooks';
import { formatKWD } from '@/lib/helpers';

export default function AdminChefsPage() {
  const { userData } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // جلب الشيفات من Firebase
  const { data: allChefs, loading } = useCollection('chefs');

  // تصفية الشيفات
  const filteredChefs = useMemo(() => {
    if (!allChefs) return [];
    
    return allChefs.filter((chef) => {
      const matchesStatus = selectedStatus === 'all' || chef.status === selectedStatus;
      const matchesSearch =
        searchQuery === '' ||
        chef.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  }, [allChefs, selectedStatus, searchQuery]);

  // حساب عدد الشيفات لكل حالة
  const statusCounts = useMemo(() => {
    if (!allChefs) return {
      all: 0,
      pending: 0,
      active: 0,
      suspended: 0,
    };

    return {
      all: allChefs.length,
      pending: allChefs.filter((c) => c.status === 'pending').length,
      active: allChefs.filter((c) => c.status === 'active').length,
      suspended: allChefs.filter((c) => c.status === 'suspended').length,
    };
  }, [allChefs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'suspended':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'active':
        return 'نشط';
      case 'suspended':
        return 'موقوف';
      default:
        return status;
    }
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
                  إدارة الشيفات
                </h1>
                <span className="text-xs text-gray-500">Admin Panel</span>
              </div>
            </Link>

            <Link
              href="/admin/dashboard"
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
          <h2 className="text-3xl font-black text-gray-900 mb-2">إدارة الشيفات 👨‍🍳</h2>
          <p className="text-gray-600">عرض وإدارة جميع الشيفات في المنصة</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Search & Filters */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، الإيميل، التخصص..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'all'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  الكل ({statusCounts.all})
                </button>
                <button
                  onClick={() => setSelectedStatus('active')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'active'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-700 border-green-200 hover:border-green-300'
                  }`}
                >
                  نشط ({statusCounts.active})
                </button>
                <button
                  onClick={() => setSelectedStatus('pending')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'pending'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-amber-700 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  قيد المراجعة ({statusCounts.pending})
                </button>
                <button
                  onClick={() => setSelectedStatus('suspended')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'suspended'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-red-700 border-red-200 hover:border-red-300'
                  }`}
                >
                  موقوف ({statusCounts.suspended})
                </button>
              </div>
            </div>

            {/* Chefs Table */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-700">الشيف</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-700">التخصص</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-700">المحافظة</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-700">التقييم</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-700">الحالة</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-700">تاريخ الانضمام</th>
                      <th className="px-6 py-4 text-right text-sm font-black text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredChefs.map((chef: any) => (
                      <tr key={chef.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                              <ChefHat className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{chef.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {chef.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {chef.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{chef.specialty || '--'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <MapPin className="w-4 h-4" />
                            {chef.governorate || '--'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-bold text-gray-900">{chef.rating || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                              chef.status
                            )}`}
                          >
                            {getStatusText(chef.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {chef.createdAt?.toDate
                            ? chef.createdAt.toDate().toLocaleDateString('ar-KW')
                            : '--'}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/chefs/${chef.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            عرض
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredChefs.length === 0 && (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد شيفات</h3>
                    <p className="text-gray-600">لم يتم العثور على شيفات تطابق البحث</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
