'use client';

// ============================================
// ChefHub - Admin Settings Page
// ============================================

import { useState } from 'react';
import {
  Shield,
  Settings,
  Percent,
  DollarSign,
  Clock,
  Bell,
  Lock,
  Globe,
  Mail,
  Phone,
  Save,
  RefreshCw,
  Users,
  ChefHat,
  ShoppingBag,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'platform' | 'commission' | 'notifications' | 'security'>('platform');
  const [isSaving, setIsSaving] = useState(false);

  // Platform Settings
  const [platformName, setPlatformName] = useState('ChefHub');
  const [platformEmail, setPlatformEmail] = useState('info@chefhub.kw');
  const [platformPhone, setPlatformPhone] = useState('+965 2222 2222');
  const [supportEmail, setSupportEmail] = useState('support@chefhub.kw');
  const [supportPhone, setSupportPhone] = useState('+965 9999 0000');

  // Commission Settings
  const [commissionRate, setCommissionRate] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('2.000');
  const [maxOrderAmount, setMaxOrderAmount] = useState('100.000');
  const [deliveryFeeRange, setDeliveryFeeRange] = useState({ min: '0.500', max: '5.000' });

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(true);
  const [newChefAlert, setNewChefAlert] = useState(true);
  const [disputeAlert, setDisputeAlert] = useState(true);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelist, setIpWhitelist] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('تم حفظ الإعدادات بنجاح!');
      setIsSaving(false);
    }, 1000);
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
                  إعدادات المنصة
                </h1>
                <span className="text-xs text-gray-500">Admin Panel - Settings</span>
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
          <h2 className="text-3xl font-black text-gray-900 mb-2">الإعدادات ⚙️</h2>
          <p className="text-gray-600">إدارة إعدادات المنصة والنظام</p>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/dashboard"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-purple-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-all">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">لوحة التحكم</p>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/chefs"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-all">
                <ChefHat className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">الشيفات</p>
                <p className="text-xs text-gray-500">Chefs</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-all">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">الطلبات</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/banners"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-amber-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-all">
                <ImageIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">البنرات</p>
                <p className="text-xs text-gray-500">Banners</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 mb-8">
          <div className="border-b-2 border-gray-100 p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'platform', label: 'إعدادات عامة', icon: Globe },
                { id: 'commission', label: 'العمولات', icon: Percent },
                { id: 'notifications', label: 'الإشعارات', icon: Bell },
                { id: 'security', label: 'الأمان', icon: Lock },
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

          <div className="p-8">
            {/* Platform Settings Tab */}
            {activeTab === 'platform' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6">الإعدادات العامة</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        اسم المنصة
                      </label>
                      <input
                        type="text"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          البريد الإلكتروني
                        </div>
                      </label>
                      <input
                        type="email"
                        value={platformEmail}
                        onChange={(e) => setPlatformEmail(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </div>
                      </label>
                      <input
                        type="tel"
                        value={platformPhone}
                        onChange={(e) => setPlatformPhone(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        بريد الدعم الفني
                      </label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        هاتف الدعم الفني
                      </label>
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commission Settings Tab */}
            {activeTab === 'commission' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6">إعدادات العمولات والحدود</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4" />
                          نسبة عمولة المنصة (%)
                        </div>
                      </label>
                      <input
                        type="number"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        min="0"
                        max="100"
                        step="0.5"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        النسبة الحالية: {commissionRate}%
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          الحد الأدنى للطلب (د.ك)
                        </div>
                      </label>
                      <input
                        type="number"
                        value={minOrderAmount}
                        onChange={(e) => setMinOrderAmount(e.target.value)}
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        الحد الأقصى للطلب (د.ك)
                      </label>
                      <input
                        type="number"
                        value={maxOrderAmount}
                        onChange={(e) => setMaxOrderAmount(e.target.value)}
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        الحد الأدنى لرسوم التوصيل (د.ك)
                      </label>
                      <input
                        type="number"
                        value={deliveryFeeRange.min}
                        onChange={(e) => setDeliveryFeeRange({ ...deliveryFeeRange, min: e.target.value })}
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        الحد الأقصى لرسوم التوصيل (د.ك)
                      </label>
                      <input
                        type="number"
                        value={deliveryFeeRange.max}
                        onChange={(e) => setDeliveryFeeRange({ ...deliveryFeeRange, max: e.target.value })}
                        min="0"
                        step="0.001"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                    <h4 className="font-bold text-purple-900 mb-2">ملاحظة هامة:</h4>
                    <p className="text-sm text-purple-700">
                      تغيير نسبة العمولة سيؤثر على جميع الطلبات الجديدة فقط. الطلبات الحالية ستحتفظ بالنسبة القديمة.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6">إعدادات الإشعارات</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-bold text-gray-900 mb-4">قنوات الإشعارات</h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900">البريد الإلكتروني</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900">WhatsApp</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={whatsappNotifications}
                            onChange={(e) => setWhatsappNotifications(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-bold text-gray-900 mb-4">أنواع الإشعارات</h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-semibold text-gray-900">طلب جديد</span>
                          <input
                            type="checkbox"
                            checked={newOrderAlert}
                            onChange={(e) => setNewOrderAlert(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-semibold text-gray-900">شيف جديد يحتاج موافقة</span>
                          <input
                            type="checkbox"
                            checked={newChefAlert}
                            onChange={(e) => setNewChefAlert(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-semibold text-gray-900">نزاع أو شكوى</span>
                          <input
                            type="checkbox"
                            checked={disputeAlert}
                            onChange={(e) => setDisputeAlert(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6">إعدادات الأمان</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-gray-600" />
                            <span className="font-bold text-gray-900">المصادقة الثنائية (2FA)</span>
                          </div>
                          <p className="text-sm text-gray-600 mr-8 mt-1">
                            تفعيل المصادقة الثنائية لجميع حسابات الأدمن
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={twoFactorAuth}
                          onChange={(e) => setTwoFactorAuth(e.target.checked)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          مدة انتهاء الجلسة (دقيقة)
                        </div>
                      </label>
                      <input
                        type="number"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        min="5"
                        max="120"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        سيتم تسجيل الخروج تلقائياً بعد {sessionTimeout} دقيقة من عدم النشاط
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        قائمة IP المسموح بها (اختياري)
                      </label>
                      <textarea
                        value={ipWhitelist}
                        onChange={(e) => setIpWhitelist(e.target.value)}
                        rows={4}
                        placeholder="192.168.1.1&#10;192.168.1.2&#10;..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        اتركه فارغاً للسماح بالوصول من أي IP. ضع كل IP في سطر منفصل.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        تحذير أمني
                      </h4>
                      <p className="text-sm text-red-700">
                        تأكد من حفظ إعدادات الأمان بعناية. قد يؤدي تفعيل قائمة IP المسموح بها إلى منع الوصول إذا لم يتم تكوينها بشكل صحيح.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            إعادة تعيين
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ الإعدادات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
