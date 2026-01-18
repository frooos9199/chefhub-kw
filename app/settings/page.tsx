'use client';

// ============================================
// ChefHub - Customer Settings Page
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  ArrowRight,
  Bell,
  ChefHat,
  ShoppingBag,
  Home,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const GOVERNORATES = [
  'العاصمة',
  'حولي',
  'الفروانية',
  'الجهراء',
  'الأحمدي',
  'مبارك الكبير',
];

export default function CustomerSettingsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    governorate: '',
    area: '',
    block: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    notes: '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    specialOffers: true,
    newDishes: false,
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (userData) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        governorate: (userData as any).governorate || '',
        area: (userData as any).area || '',
        block: (userData as any).block || '',
        street: (userData as any).street || '',
        building: (userData as any).building || '',
        floor: (userData as any).floor || '',
        apartment: (userData as any).apartment || '',
        notes: (userData as any).notes || '',
      });
    }
  }, [user, userData, loading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profileData.name,
        phone: profileData.phone,
        governorate: profileData.governorate,
        area: profileData.area,
        block: profileData.block,
        street: profileData.street,
        building: profileData.building,
        floor: profileData.floor,
        apartment: profileData.apartment,
        notes: profileData.notes,
        updatedAt: new Date().toISOString(),
      });
      alert('تم حفظ البيانات بنجاح! ✅');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (!user || !user.email) return;

    setIsSaving(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('تم تغيير كلمة المرور بنجاح! ✅');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        alert('كلمة المرور الحالية غير صحيحة');
      } else {
        alert('حدث خطأ أثناء تغيير كلمة المرور');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                    الإعدادات
                  </h1>
                  <span className="text-xs text-gray-600">{userData?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link
            href="/"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-emerald-200 transition-all group"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-all">
                <Home className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">الرئيسية</p>
            </div>
          </Link>

          <Link
            href="/special-orders"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-purple-200 transition-all group"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-all">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">الطلبات الخاصة</p>
            </div>
          </Link>

          <Link
            href="/orders"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-all">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">طلباتي</p>
            </div>
          </Link>

          <Link
            href="/chef"
            className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-amber-200 transition-all group"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-all">
                <ChefHat className="w-6 h-6 text-amber-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm">الشيف</p>
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-6 flex gap-2 shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4 inline-block ml-2" />
            الملف الشخصي
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-4 h-4 inline-block ml-2" />
            الإشعارات
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-4 h-4 inline-block ml-2" />
            كلمة المرور
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">المعلومات الشخصية</h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline-block ml-1" />
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline-block ml-1" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline-block ml-1" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+965 9999 9999"
                />
              </div>

              {/* Address Section */}
              <div className="pt-4 border-t-2 border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  <MapPin className="w-4 h-4 inline-block ml-1" />
                  العنوان الافتراضي
                </h4>

                {/* Governorate */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">المحافظة</label>
                  <select
                    value={profileData.governorate}
                    onChange={(e) => setProfileData({ ...profileData, governorate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                {/* Area */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">المنطقة</label>
                  <input
                    type="text"
                    value={profileData.area}
                    onChange={(e) => setProfileData({ ...profileData, area: e.target.value })}
                    placeholder="مثال: السالمية"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Block, Street, Building */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">القطعة</label>
                    <input
                      type="text"
                      value={profileData.block}
                      onChange={(e) => setProfileData({ ...profileData, block: e.target.value })}
                      placeholder="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الشارع</label>
                    <input
                      type="text"
                      value={profileData.street}
                      onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                      placeholder="15"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المبنى</label>
                    <input
                      type="text"
                      value={profileData.building}
                      onChange={(e) => setProfileData({ ...profileData, building: e.target.value })}
                      placeholder="10"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Floor, Apartment */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الطابق</label>
                    <input
                      type="text"
                      value={profileData.floor}
                      onChange={(e) => setProfileData({ ...profileData, floor: e.target.value })}
                      placeholder="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الشقة</label>
                    <input
                      type="text"
                      value={profileData.apartment}
                      onChange={(e) => setProfileData({ ...profileData, apartment: e.target.value })}
                      placeholder="5"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    value={profileData.notes}
                    onChange={(e) => setProfileData({ ...profileData, notes: e.target.value })}
                    rows={3}
                    placeholder="مثال: الشقة بجانب المصعد"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">إعدادات الإشعارات</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">إشعارات البريد الإلكتروني</p>
                  <p className="text-sm text-gray-600">استقبال الإشعارات عبر البريد</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">تحديثات الطلبات</p>
                  <p className="text-sm text-gray-600">تنبيهات عند تغيير حالة الطلب</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.orderUpdates}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, orderUpdates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">العروض الخاصة</p>
                  <p className="text-sm text-gray-600">تنبيهات عن العروض والخصومات</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.specialOffers}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, specialOffers: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">أطباق جديدة</p>
                  <p className="text-sm text-gray-600">تنبيهات عند إضافة أطباق جديدة</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.newDishes}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, newDishes: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ الإعدادات
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">تغيير كلمة المرور</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>ملاحظة:</strong> كلمة المرور يجب أن تكون 6 أحرف على الأقل
                </p>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isSaving}
              className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  تغيير كلمة المرور
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
