'use client';

// ============================================
// ChefHub - Admin Chefs Management Page
// ============================================

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useCollection } from '@/lib/firebase/hooks';
import { formatKWD } from '@/lib/helpers';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export default function AdminChefsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingChef, setUpdatingChef] = useState<string | null>(null);
  const [deletingChef, setDeletingChef] = useState<string | null>(null);

  // التحقق من صلاحيات الأدمن
  useEffect(() => {
    if (!authLoading) {
      if (!user || userData?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, userData, authLoading, router]);

  // جلب الشيف من Firebase
  const { data: allChefs, loading } = useCollection('chefs');

  // تصفية الشيف
  const filteredChefs = useMemo(() => {
    if (!allChefs) return [];
    
    return allChefs.filter((chef) => {
      const matchesStatus = selectedStatus === 'all' || chef.status === selectedStatus;
      const specialtyText = Array.isArray(chef.specialty)
        ? chef.specialty.join(' ')
        : (chef.specialty || '');
      const matchesSearch =
        searchQuery === '' ||
        chef.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialtyText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  }, [allChefs, selectedStatus, searchQuery]);

  // حساب عدد الشيف لكل حالة
  const statusCounts = useMemo(() => {
    if (!allChefs) return {
      all: 0,
      pending: 0,
      approved: 0,
      suspended: 0,
    };

    return {
      all: allChefs.length,
      pending: allChefs.filter((c) => c.status === 'pending').length,
      approved: allChefs.filter((c) => c.status === 'approved').length,
      suspended: allChefs.filter((c) => c.status === 'suspended').length,
    };
  }, [allChefs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'approved':
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
      case 'approved':
        return 'نشط';
      case 'suspended':
        return 'موقوف';
      default:
        return status;
    }
  };

  // تفعيل/إيقاف الشيف
  const handleToggleStatus = async (chefId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    const confirmMsg = newStatus === 'approved'
      ? 'هل تريد تفعيل هذا الشيف؟'
      : 'هل تريد إيقاف هذا الشيف؟';

    if (!window.confirm(confirmMsg)) return;

    setUpdatingChef(chefId);
    try {
      // تحديث وثيقة الشيف
      await updateDoc(doc(db, 'chefs', chefId), {
        status: newStatus,
        isActive: newStatus === 'approved',
        updatedAt: new Date()
      });
      
      // جلب وثيقة الشيف للحصول على userId
      const chefDoc = await getDoc(doc(db, 'chefs', chefId));
      const chefData = chefDoc.data();
      
      // تحديث وثيقة المستخدم إذا كان userId موجود
      if (chefData?.userId) {
        await updateDoc(doc(db, 'users', chefData.userId), {
          status: newStatus,
          isActive: newStatus === 'approved',
          updatedAt: new Date()
        });
      }
      
      alert(newStatus === 'approved' ? 'تم تفعيل الشيف بنجاح! ✅' : 'تم إيقاف الشيف بنجاح!');
    } catch (err) {
      console.error('خطأ في تحديث الحالة:', err);
      alert('حدث خطأ أثناء تحديث حالة الشيف');
    }
    setUpdatingChef(null);
  };

  // حذف الشيف
  const handleDeleteChef = async (chefId: string, chefName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الشيف "${chefName}"?\nسيتم حذف جميع بياناته نهائياً بما في ذلك حسابه من Firebase Authentication!`)) return;

    if (!user?.uid) {
      alert('خطأ: لم يتم التعرف على المستخدم');
      return;
    }

    setDeletingChef(chefId);
    try {
      // جلب userId من وثيقة الشيف
      const chefDocRef = doc(db, 'chefs', chefId);
      const chefDoc = await getDoc(chefDocRef);
      
      if (!chefDoc.exists()) {
        throw new Error('الشيف غير موجود');
      }
      
      const chefData = chefDoc.data();
      const userId = chefData?.userId;
      
      if (!userId) {
        throw new Error('لم يتم العثور على معرف المستخدم');
      }
      
      // استدعاء API لحذف المستخدم من Auth و Firestore
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          chefId: chefId,
          adminId: user.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل حذف الشيف');
      }

      alert('تم حذف الشيف بنجاح من Firebase Auth و Firestore! ✅');
      
      // تحديث الصفحة لإعادة جلب البيانات
      window.location.reload();
    } catch (err: any) {
      console.error('خطأ في الحذف:', err);
      alert('حدث خطأ أثناء حذف الشيف: ' + err.message);
    }
    setDeletingChef(null);
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
                  إدارة الشيف
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
          <h2 className="text-3xl font-black text-gray-900 mb-2">إدارة الشيف 👨‍🍳</h2>
          <p className="text-gray-600">عرض وإدارة جميع الشيف في المنصة</p>
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
                  onClick={() => setSelectedStatus('approved')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                    selectedStatus === 'approved'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-700 border-green-200 hover:border-green-300'
                  }`}
                >
                  نشط ({statusCounts.approved})
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
                          <span className="text-sm text-gray-700">
                            {Array.isArray(chef.specialty) ? chef.specialty.join(' • ') : (chef.specialty || '--')}
                          </span>
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
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/chef/${chef.id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all text-xs"
                            >
                              <Eye className="w-4 h-4" />
                              عرض
                            </Link>
                            
                            {chef.status === 'approved' ? (
                              <button
                                onClick={() => handleToggleStatus(chef.id, chef.status)}
                                disabled={updatingChef === chef.id || deletingChef === chef.id}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all text-xs disabled:opacity-50"
                                title="إيقاف الشيف"
                              >
                                <XCircle className="w-4 h-4" />
                                إيقاف
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(chef.id, chef.status)}
                                disabled={updatingChef === chef.id || deletingChef === chef.id}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-xs disabled:opacity-50"
                                title="تفعيل الشيف"
                              >
                                <CheckCircle className="w-4 h-4" />
                                تفعيل
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteChef(chef.id, chef.name)}
                              disabled={deletingChef === chef.id || updatingChef === chef.id}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all text-xs disabled:opacity-50"
                              title="حذف الشيف"
                            >
                              <Trash2 className="w-4 h-4" />
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredChefs.length === 0 && (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد شيف</h3>
                    <p className="text-gray-600">لم يتم العثور على شيف يطابق البحث</p>
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
