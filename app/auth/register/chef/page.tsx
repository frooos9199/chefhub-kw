'use client';

// ============================================
// ChefHub - Chef Registration Page (Multi-Step)
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerChef } from '@/lib/auth';
import { Mail, Lock, User, Phone, MessageSquare, Briefcase, MapPin, DollarSign, Loader2, ChefHat, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { KUWAIT_GOVERNORATES, GovernorateId } from '@/types';

export default function ChefRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Contact & Business
    phoneNumber: '',
    whatsappNumber: '',
    businessName: '',
    specialty: [] as string[],
    bio: '',
    
    // Step 3: Delivery Info
    deliveryGovernorates: [] as GovernorateId[],
    deliveryFees: {} as Record<GovernorateId, number>,
  });

  const specialtyOptions = [
    'مأكولات عربية',
    'مأكولات إيطالية',
    'مأكولات آسيوية',
    'حلويات شرقية',
    'حلويات غربية',
    'معجنات',
    'مخبوزات',
    'أطباق صحية',
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('يرجى ملء جميع الحقول');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('كلمتا المرور غير متطابقتين');
        return;
      }
      if (formData.password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.phoneNumber || !formData.whatsappNumber || !formData.businessName || formData.specialty.length === 0) {
        setError('يرجى ملء جميع الحقول');
        return;
      }
    }

    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const toggleGovernorate = (gov: GovernorateId) => {
    if (formData.deliveryGovernorates.includes(gov)) {
      setFormData({
        ...formData,
        deliveryGovernorates: formData.deliveryGovernorates.filter(g => g !== gov),
        deliveryFees: Object.fromEntries(
          Object.entries(formData.deliveryFees).filter(([key]) => key !== gov)
        ) as Record<GovernorateId, number>,
      });
    } else {
      setFormData({
        ...formData,
        deliveryGovernorates: [...formData.deliveryGovernorates, gov],
        deliveryFees: { ...formData.deliveryFees, [gov]: 2 }, // Default 2 KWD
      });
    }
  };

  const toggleSpecialty = (spec: string) => {
    if (formData.specialty.includes(spec)) {
      setFormData({
        ...formData,
        specialty: formData.specialty.filter(s => s !== spec),
      });
    } else {
      setFormData({
        ...formData,
        specialty: [...formData.specialty, spec],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.deliveryGovernorates.length === 0) {
      setError('يرجى اختيار محافظة واحدة على الأقل للتوصيل');
      setLoading(false);
      return;
    }

    const result = await registerChef({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      whatsappNumber: formData.whatsappNumber,
      businessName: formData.businessName,
      bio: formData.bio,
      specialty: formData.specialty,
      availableGovernorates: formData.deliveryGovernorates,
      deliveryFees: formData.deliveryFees,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 5000);
    } else {
      setError(result.error || 'حدث خطأ أثناء التسجيل');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h2>
          <p className="text-gray-600 mb-4">سيتم مراجعة طلبك من قبل الإدارة خلال 24-48 ساعة.</p>
          <p className="text-sm text-gray-500 mb-6">سنرسل لك رسالة بريد إلكتروني عند الموافقة على طلبك.</p>
          <p className="text-sm text-gray-500">جاري تحويلك لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 py-12" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <ChefHat className="w-10 h-10 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              ChefHub
            </span>
          </Link>
          <p className="text-gray-600 mt-2">انضم لشيفات ChefHub المميزين</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step < currentStep ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? 'text-emerald-600 font-medium' : 'text-gray-500'}>معلومات أساسية</span>
            <span className={currentStep >= 2 ? 'text-emerald-600 font-medium' : 'text-gray-500'}>معلومات الأعمال</span>
            <span className={currentStep >= 3 ? 'text-emerald-600 font-medium' : 'text-gray-500'}>معلومات التوصيل</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">المعلومات الأساسية</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="محمد أحمد"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="chef@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات الأعمال</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="+965 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب (لاستقبال الطلبات)</label>
                  <div className="relative">
                    <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="+965 9876 5432"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المشروع/المطبخ</label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="مطبخ الشيف محمد"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التخصصات (اختر واحدة أو أكثر)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialtyOptions.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.specialty.includes(spec)
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نبذة عنك وعن مطبخك</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="اكتب نبذة مختصرة عنك وعن تخصصك..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Delivery Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات التوصيل</h2>
                <p className="text-gray-600 mb-4">اختر المحافظات التي توصل إليها وحدد رسوم التوصيل لكل محافظة</p>
                
                <div className="space-y-3">
                  {KUWAIT_GOVERNORATES.map((gov) => (
                    <div key={gov.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          id={gov.id}
                          checked={formData.deliveryGovernorates.includes(gov.id)}
                          onChange={() => toggleGovernorate(gov.id)}
                          className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                        />
                        <label htmlFor={gov.id} className="flex-1 font-medium text-gray-900 cursor-pointer">
                          {gov.nameAr}
                        </label>
                      </div>
                      
                      {formData.deliveryGovernorates.includes(gov.id) && (
                        <div className="mr-8">
                          <label className="block text-sm text-gray-600 mb-2">رسوم التوصيل (د.ك)</label>
                          <div className="relative">
                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={formData.deliveryFees[gov.id] || 2}
                              onChange={(e) => setFormData({
                                ...formData,
                                deliveryFees: {
                                  ...formData.deliveryFees,
                                  [gov.id]: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="2.000"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  السابق
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  التالي
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال الطلب'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
