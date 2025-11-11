'use client';

// ============================================
// ChefHub - Chef Settings Page
// ============================================

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChefHat,
  User,
  Bell,
  MapPin,
  Clock,
  Lock,
  Save,
  Upload,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  Info,
} from 'lucide-react';
import Link from 'next/link';

const GOVERNORATES = [
  'العاصمة',
  'حولي',
  'الفروانية',
  'الجهراء',
  'الأحمدي',
  'مبارك الكبير',
];

const SPECIALTIES = [
  'مأكولات كويتية',
  'مأكولات خليجية',
  'مأكولات عربية',
  'حلويات شرقية',
  'حلويات غربية',
  'معجنات',
  'مخبوزات',
  'أخرى',
];

export default function ChefSettingsPage() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: 'الشيف فاطمة أحمد',
    email: 'fatima@example.com',
    phone: '+965 9999 9999',
    bio: 'شيف متخصصة في الأكلات الكويتية الأصيلة مع خبرة 10 سنوات',
    specialty: 'مأكولات كويتية',
    businessName: 'مطبخ فاطمة',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    whatsappNotifications: true,
    newOrders: true,
    orderUpdates: true,
    customerReviews: true,
    specialOffers: false,
  });

  // Delivery Settings
  const [deliverySettings, setdeliverySettings] = useState({
    availableGovernorates: ['العاصمة', 'حولي'],
    baseDeliveryFee: '2.000',
    freeDeliveryThreshold: '15.000',
    estimatedDeliveryTime: '60',
  });

  // Working Hours
  const [workingHours, setWorkingHours] = useState({
    saturday: { enabled: true, from: '09:00', to: '22:00' },
    sunday: { enabled: true, from: '09:00', to: '22:00' },
    monday: { enabled: true, from: '09:00', to: '22:00' },
    tuesday: { enabled: true, from: '09:00', to: '22:00' },
    wednesday: { enabled: true, from: '09:00', to: '22:00' },
    thursday: { enabled: true, from: '09:00', to: '22:00' },
    friday: { enabled: false, from: '09:00', to: '22:00' },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to Firebase
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      saturday: 'السبت',
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
    };
    return days[day] || day;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/chef/dashboard" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  الإعدادات
                </h1>
                <span className="text-xs text-gray-500">{profileData.name}</span>
              </div>
            </Link>

            <Link
              href="/chef/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              لوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 border-2 border-gray-100 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>الملف الشخصي</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span>الإشعارات</span>
                </button>

                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'delivery'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>التوصيل</span>
                </button>

                <button
                  onClick={() => setActiveTab('hours')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'hours'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>ساعات العمل</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'security'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span>الأمان</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">معلومات الملف الشخصي</h2>

                  {/* Profile Image */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">صورة الملف الشخصي</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <span className="text-4xl">👨‍🍳</span>
                      </div>
                      <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>رفع صورة جديدة</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline ml-1" />
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <Briefcase className="w-4 h-4 inline ml-1" />
                        اسم العمل
                      </label>
                      <input
                        type="text"
                        value={profileData.businessName}
                        onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline ml-1" />
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline ml-1" />
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <ChefHat className="w-4 h-4 inline ml-1" />
                        التخصص
                      </label>
                      <select
                        value={profileData.specialty}
                        onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      >
                        {SPECIALTIES.map((specialty) => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <Info className="w-4 h-4 inline ml-1" />
                        نبذة تعريفية
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all resize-none"
                        placeholder="اكتب نبذة عن خبرتك وتخصصك..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">إعدادات الإشعارات</h2>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <div className="font-bold text-blue-900 mb-1">قنوات الإشعارات</div>
                        <div className="text-sm text-blue-700">اختر كيف تريد استلام الإشعارات</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-bold text-gray-900">إشعارات البريد الإلكتروني</div>
                          <div className="text-sm text-gray-600">استلام الإشعارات عبر الإيميل</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-bold text-gray-900">إشعارات واتساب</div>
                          <div className="text-sm text-gray-600">استلام الإشعارات عبر WhatsApp</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.whatsappNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            whatsappNotifications: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="pt-6 border-t-2 border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">أنواع الإشعارات</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'newOrders', label: 'طلبات جديدة', desc: 'عند استلام طلب جديد' },
                        { key: 'orderUpdates', label: 'تحديثات الطلبات', desc: 'عند تغيير حالة الطلب' },
                        { key: 'customerReviews', label: 'تقييمات العملاء', desc: 'عند إضافة تقييم جديد' },
                        { key: 'specialOffers', label: 'عروض خاصة', desc: 'إشعارات تسويقية وعروض' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Settings */}
            {activeTab === 'delivery' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">إعدادات التوصيل</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      <MapPin className="w-4 h-4 inline ml-1" />
                      المحافظات المتاحة للتوصيل
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {GOVERNORATES.map((gov) => (
                        <label
                          key={gov}
                          className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={deliverySettings.availableGovernorates.includes(gov)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setdeliverySettings({
                                  ...deliverySettings,
                                  availableGovernorates: [...deliverySettings.availableGovernorates, gov],
                                });
                              } else {
                                setdeliverySettings({
                                  ...deliverySettings,
                                  availableGovernorates: deliverySettings.availableGovernorates.filter(
                                    (g) => g !== gov
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-gray-900">{gov}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline ml-1" />
                        رسوم التوصيل الأساسية (د.ك)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={deliverySettings.baseDeliveryFee}
                        onChange={(e) =>
                          setdeliverySettings({ ...deliverySettings, baseDeliveryFee: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline ml-1" />
                        توصيل مجاني عند (د.ك)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={deliverySettings.freeDeliveryThreshold}
                        onChange={(e) =>
                          setdeliverySettings({ ...deliverySettings, freeDeliveryThreshold: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline ml-1" />
                        وقت التوصيل المتوقع (دقيقة)
                      </label>
                      <input
                        type="number"
                        value={deliverySettings.estimatedDeliveryTime}
                        onChange={(e) =>
                          setdeliverySettings({ ...deliverySettings, estimatedDeliveryTime: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Working Hours */}
            {activeTab === 'hours' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">ساعات العمل</h2>

                <div className="space-y-4">
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hours.enabled}
                          onChange={(e) =>
                            setWorkingHours({
                              ...workingHours,
                              [day]: { ...hours, enabled: e.target.checked },
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-gray-900">{getDayName(day)}</span>
                      </label>

                      {hours.enabled ? (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-gray-600">من</label>
                            <input
                              type="time"
                              value={hours.from}
                              onChange={(e) =>
                                setWorkingHours({
                                  ...workingHours,
                                  [day]: { ...hours, from: e.target.value },
                                })
                              }
                              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-gray-600">إلى</label>
                            <input
                              type="time"
                              value={hours.to}
                              onChange={(e) =>
                                setWorkingHours({
                                  ...workingHours,
                                  [day]: { ...hours, to: e.target.value },
                                })
                              }
                              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 font-semibold flex-1">مغلق</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">الأمان وكلمة المرور</h2>

                <div className="space-y-6">
                  <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-600 mt-1" />
                      <div>
                        <div className="font-bold text-amber-900 mb-1">تغيير كلمة المرور</div>
                        <div className="text-sm text-amber-700">
                          يُنصح بتغيير كلمة المرور بشكل دوري لحماية حسابك
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الحالية</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <button className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">
                      تحديث كلمة المرور
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
