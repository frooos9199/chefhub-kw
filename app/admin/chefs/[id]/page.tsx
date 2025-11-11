'use client';

// ============================================
// ChefHub - Admin Chef Detail Page
// ============================================

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield,
  ChefHat,
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Ban,
  FileText,
  TrendingUp,
  Package,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

// Mock chef data
const MOCK_CHEF = {
  id: '1',
  name: 'الشيف سارة أحمد',
  email: 'sara@example.com',
  phone: '+965 9999 9999',
  specialty: 'مأكولات كويتية تقليدية',
  governorate: 'حولي',
  area: 'السالمية',
  address: 'شارع سالم المبارك، مجمع السالمية',
  bio: 'شيف متخصصة في الطبخ الكويتي الأصيل مع خبرة 15 سنة في المجال. حاصلة على شهادات من معهد الطهي الفرنسي Le Cordon Bleu.',
  rating: 4.8,
  totalOrders: 456,
  completedOrders: 445,
  cancelledOrders: 11,
  totalRevenue: 8456.000,
  commission: 845.600,
  status: 'pending' as 'active' | 'pending' | 'suspended',
  isVerified: false,
  joinedAt: '2025-11-15',
  documents: [
    { type: 'civil_id', url: '/docs/civil-id.pdf', status: 'pending' },
    { type: 'health_certificate', url: '/docs/health-cert.pdf', status: 'pending' },
    { type: 'business_license', url: '/docs/license.pdf', status: 'pending' },
  ],
  dishes: [
    {
      id: '1',
      name: 'مچبوس دجاج',
      price: 5.500,
      sales: 123,
      rating: 4.9,
    },
    {
      id: '2',
      name: 'هريس',
      price: 4.000,
      sales: 89,
      rating: 4.7,
    },
    {
      id: '3',
      name: 'جريش',
      price: 4.500,
      sales: 67,
      rating: 4.8,
    },
  ],
  reviews: [
    {
      id: '1',
      customerName: 'أحمد محمد',
      rating: 5,
      comment: 'طبخ ممتاز وتوصيل سريع',
      date: '2025-11-10',
    },
    {
      id: '2',
      customerName: 'فاطمة علي',
      rating: 4,
      comment: 'أكل طيب بس التوصيل تأخر شوي',
      date: '2025-11-08',
    },
  ],
  recentOrders: [
    {
      id: 'ORD-001',
      date: '2025-11-15',
      amount: 12.500,
      commission: 1.250,
      status: 'completed',
    },
    {
      id: 'ORD-002',
      date: '2025-11-14',
      amount: 8.000,
      commission: 0.800,
      status: 'completed',
    },
    {
      id: 'ORD-003',
      date: '2025-11-13',
      amount: 15.000,
      commission: 1.500,
      status: 'cancelled',
    },
  ],
};

export default function AdminChefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'dishes' | 'orders' | 'reviews' | 'documents'>('overview');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () => {
    console.log('Approving chef:', params.id);
    alert('تم قبول الشيف بنجاح!');
    setShowApprovalModal(false);
    router.push('/admin/chefs');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('الرجاء إدخال سبب الرفض');
      return;
    }
    console.log('Rejecting chef:', params.id, 'Reason:', rejectReason);
    alert('تم رفض الشيف');
    setShowRejectModal(false);
    router.push('/admin/chefs');
  };

  const handleSuspend = () => {
    if (confirm('هل أنت متأكد من إيقاف هذا الشيف؟')) {
      console.log('Suspending chef:', params.id);
      alert('تم إيقاف الشيف');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/chefs" className="flex items-center gap-3">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 p-2">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    تفاصيل الشيف
                  </h1>
                  <span className="text-xs text-gray-500">Chef Details</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {MOCK_CHEF.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-5 h-5" />
                    قبول
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    رفض
                  </button>
                </>
              )}
              {MOCK_CHEF.status === 'active' && (
                <button
                  onClick={handleSuspend}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <Ban className="w-5 h-5" />
                  إيقاف
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Chef Profile Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-purple-600" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">{MOCK_CHEF.name}</h2>
                  <p className="text-emerald-600 font-bold mb-2">{MOCK_CHEF.specialty}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {MOCK_CHEF.governorate} - {MOCK_CHEF.area}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      انضم: {new Date(MOCK_CHEF.joinedAt).toLocaleDateString('ar-KW')}
                    </div>
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                    MOCK_CHEF.status === 'pending'
                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-green-100 text-green-700 border-green-300'
                  }`}
                >
                  {MOCK_CHEF.status === 'pending' ? 'قيد المراجعة' : 'نشط'}
                </div>
              </div>

              <p className="text-gray-700 mb-6">{MOCK_CHEF.bio}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Star className="w-5 h-5 fill-purple-600" />
                    <span className="text-2xl font-black">{MOCK_CHEF.rating}</span>
                  </div>
                  <div className="text-xs text-gray-600">التقييم</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
                  <div className="text-2xl font-black text-blue-600 mb-2">{MOCK_CHEF.totalOrders}</div>
                  <div className="text-xs text-gray-600">إجمالي الطلبات</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-100">
                  <div className="text-2xl font-black text-emerald-600 mb-2">
                    {MOCK_CHEF.totalRevenue.toFixed(3)}
                  </div>
                  <div className="text-xs text-gray-600">الإيرادات (د.ك)</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-100">
                  <div className="text-2xl font-black text-green-600 mb-2">{MOCK_CHEF.commission.toFixed(3)}</div>
                  <div className="text-xs text-gray-600">العمولة (د.ك)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">البريد الإلكتروني</div>
              <div className="font-bold text-gray-900">{MOCK_CHEF.email}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">رقم الهاتف</div>
              <div className="font-bold text-gray-900">{MOCK_CHEF.phone}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">العنوان</div>
              <div className="font-bold text-gray-900">{MOCK_CHEF.address}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 mb-8">
          <div className="border-b-2 border-gray-100 p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: FileText },
                { id: 'dishes', label: 'الأصناف', icon: Package },
                { id: 'orders', label: 'الطلبات', icon: TrendingUp },
                { id: 'reviews', label: 'التقييمات', icon: Star },
                { id: 'documents', label: 'المستندات', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-4">إحصائيات الأداء</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الطلبات المكتملة</span>
                        <span className="font-bold text-green-600">{MOCK_CHEF.completedOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الطلبات الملغية</span>
                        <span className="font-bold text-red-600">{MOCK_CHEF.cancelledOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">نسبة النجاح</span>
                        <span className="font-bold text-purple-600">
                          {((MOCK_CHEF.completedOrders / MOCK_CHEF.totalOrders) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-4">معلومات مالية</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">إجمالي الإيرادات</span>
                        <span className="font-bold text-emerald-600">{MOCK_CHEF.totalRevenue.toFixed(3)} د.ك</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">عمولة المنصة (10%)</span>
                        <span className="font-bold text-green-600">{MOCK_CHEF.commission.toFixed(3)} د.ك</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">متوسط قيمة الطلب</span>
                        <span className="font-bold text-purple-600">
                          {(MOCK_CHEF.totalRevenue / MOCK_CHEF.totalOrders).toFixed(3)} د.ك
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dishes' && (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-4">الأصناف ({MOCK_CHEF.dishes.length})</h3>
                <div className="space-y-3">
                  {MOCK_CHEF.dishes.map((dish) => (
                    <div key={dish.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">{dish.name}</div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-emerald-600 font-bold">{dish.price.toFixed(3)} د.ك</span>
                          <span className="text-gray-500">• {dish.sales} مبيعات</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-amber-600 font-bold">{dish.rating}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-4">
                  الطلبات الأخيرة ({MOCK_CHEF.recentOrders.length})
                </h3>
                <div className="space-y-3">
                  {MOCK_CHEF.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('ar-KW')}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-emerald-600">{order.amount.toFixed(3)} د.ك</div>
                        <div className="text-sm text-gray-500">عمولة: {order.commission.toFixed(3)} د.ك</div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-4">التقييمات ({MOCK_CHEF.reviews.length})</h3>
                <div className="space-y-4">
                  {MOCK_CHEF.reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-900">{review.customerName}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <div className="text-xs text-gray-500">
                        {new Date(review.date).toLocaleDateString('ar-KW')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-4">المستندات المطلوبة</h3>
                <div className="space-y-4">
                  {MOCK_CHEF.documents.map((doc, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {doc.type === 'civil_id' && 'البطاقة المدنية'}
                            {doc.type === 'health_certificate' && 'الشهادة الصحية'}
                            {doc.type === 'business_license' && 'الرخصة التجارية'}
                          </div>
                          <div className="text-sm text-gray-500">{doc.url}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          {doc.status === 'pending' ? 'قيد المراجعة' : 'موافق عليه'}
                        </span>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all">
                          عرض
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">قبول الشيف</h3>
              <p className="text-gray-600">هل أنت متأكد من قبول {MOCK_CHEF.name}؟</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                تأكيد القبول
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">رفض الشيف</h3>
              <p className="text-gray-600 mb-4">الرجاء إدخال سبب الرفض</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="اكتب السبب هنا..."
                rows={4}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
