'use client';

// ============================================
// ChefHub - Chef Registration Page (Multi-Step)
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerChef } from '@/lib/auth';
import { isValidImageType, isValidImageSize } from '@/lib/storage';
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
    customSpecialty: '', // للتخصص المخصص
    bio: '',
    
    // Step 3: Delivery Info
    deliveryGovernorates: [] as GovernorateId[],
    deliveryFees: {} as Record<GovernorateId, number>,
    
    // Step 4: Legal Agreement
    agreedToTerms: false,
    signature: '',
    signatureDate: '',
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
    'أخرى',
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
    } else if (currentStep === 3) {
      if (formData.deliveryGovernorates.length === 0) {
        setError('يرجى اختيار محافظة واحدة على الأقل للتوصيل');
        return;
      }
    }

    setError('');
    setCurrentStep(currentStep + 1);
  };

  // Profile image state for registration
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
    };
  }, [profilePreviewUrl]);

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

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!isValidImageType(file)) {
      setError('نوع الملف غير مدعوم. الرجاء اختيار صورة بصيغة JPEG أو PNG أو WEBP.');
      return;
    }

    if (!isValidImageSize(file)) {
      setError('حجم الصورة كبير جداً. الرجاء اختيار ملف أصغر من 5 ميجابايت.');
      return;
    }

    setError('');
    if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    const url = URL.createObjectURL(file);
    setProfilePreviewUrl(url);
    setSelectedProfileFile(file);
  };

  const removeSelectedProfile = () => {
    if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    setProfilePreviewUrl(null);
    setSelectedProfileFile(null);
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

    if (!formData.agreedToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      setLoading(false);
      return;
    }

    if (!formData.signature) {
      setError('يجب إدخال التوقيع الإلكتروني');
      setLoading(false);
      return;
    }

    // إذا اختار "أخرى" ولم يدخل التخصص المخصص
    if (formData.specialty.includes('أخرى') && !formData.customSpecialty.trim()) {
      setError('يرجى تحديد التخصص المخصص');
      setLoading(false);
      return;
    }

    // إعداد قائمة التخصصات النهائية
    let finalSpecialties = [...formData.specialty];
    if (formData.specialty.includes('أخرى') && formData.customSpecialty.trim()) {
      // استبدال "أخرى" بالتخصص المخصص
      finalSpecialties = finalSpecialties.filter(s => s !== 'أخرى');
      finalSpecialties.push(formData.customSpecialty.trim());
    }

    const result = await registerChef({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      whatsappNumber: formData.whatsappNumber,
      businessName: formData.businessName,
      bio: formData.bio,
      specialty: finalSpecialties,
      availableGovernorates: formData.deliveryGovernorates,
      deliveryFees: formData.deliveryFees,
      legalAgreement: {
        agreedToTerms: formData.agreedToTerms,
        signature: formData.signature,
        signatureDate: formData.signatureDate,
        ipAddress: '', // يمكن إضافته لاحقاً
      }
    ,
      profileImage: selectedProfileFile || undefined,
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
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step < currentStep ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
            <span className={currentStep >= 1 ? 'text-emerald-600 font-medium text-center' : 'text-gray-500 text-center'}>معلومات أساسية</span>
            <span className={currentStep >= 2 ? 'text-emerald-600 font-medium text-center' : 'text-gray-500 text-center'}>معلومات الأعمال</span>
            <span className={currentStep >= 3 ? 'text-emerald-600 font-medium text-center' : 'text-gray-500 text-center'}>معلومات التوصيل</span>
            <span className={currentStep >= 4 ? 'text-emerald-600 font-medium text-center' : 'text-gray-500 text-center'}>الشروط والأحكام</span>
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

                {/* Profile Avatar picker (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صورة الملف الشخصي (اختياري)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      <img
                        src={profilePreviewUrl || '/default-chef-avatar.png'}
                        alt="صورة الشيف"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileFileChange}
                          className="hidden"
                        />
                        <span className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm hover:bg-gray-50">اختر صورة</span>
                      </label>

                      {selectedProfileFile && (
                        <button
                          type="button"
                          onClick={removeSelectedProfile}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm hover:bg-red-100"
                        >
                          إزالة الصورة
                        </button>
                      )}

                      <div className="text-xs text-gray-500">مقاس مقترح 400x400px — JPG/PNG/WebP — أقل من 5MB</div>
                    </div>
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
                  
                  {/* Custom Specialty Input - يظهر فقط إذا اختار "أخرى" */}
                  {formData.specialty.includes('أخرى') && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">حدد التخصص</label>
                      <input
                        type="text"
                        value={formData.customSpecialty}
                        onChange={(e) => setFormData({ ...formData, customSpecialty: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="اكتب تخصصك هنا (مثال: مأكولات مكسيكية، نباتية، إلخ...)"
                      />
                    </div>
                  )}
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

            {/* Step 4: Legal Agreement & Signature */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">الشروط والأحكام - إقرار قانوني</h2>
                
                {/* Legal Terms Box */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-red-900 text-base mb-2">⚠️ إقرار مسؤولية قانونية</h3>
                      <p className="text-red-800">
                        بتوقيعك على هذا الإقرار، أنت تقر وتوافق على المسؤولية الكاملة عن جميع المنتجات والخدمات المقدمة من خلال منصة ChefHub.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">المادة الأولى: المسؤولية الكاملة عن المنتجات</h4>
                      <p>
                        أقر أنا <strong>{formData.fullName}</strong> بأنني المسؤول الوحيد والكامل عن:
                      </p>
                      <ul className="mr-6 mt-2 space-y-1 list-disc">
                        <li>نظافة وجودة جميع المنتجات الغذائية المقدمة</li>
                        <li>سلامة المكونات والمواد الخام المستخدمة</li>
                        <li>التعقيم والنظافة الشخصية أثناء التحضير</li>
                        <li>التخزين السليم وفقاً لمعايير الصحة والسلامة</li>
                        <li>توصيل المنتجات للعملاء في حالة جيدة وصالحة للاستهلاك</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">المادة الثانية: دور منصة ChefHub</h4>
                      <p>
                        أقر وأفهم تماماً أن منصة ChefHub هي:
                      </p>
                      <ul className="mr-6 mt-2 space-y-1 list-disc">
                        <li><strong>مجرد وسيط إلكتروني</strong> لعرض المنتجات وربط الشيفات بالعملاء</li>
                        <li><strong>ليست مسؤولة</strong> عن جودة أو نظافة أو سلامة المنتجات المقدمة</li>
                        <li><strong>ليست طرفاً</strong> في العقد بين الشيف والعميل</li>
                        <li><strong>غير ملزمة</strong> بتعويض العملاء عن أي أضرار ناتجة عن المنتجات</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">المادة الثالثة: الالتزامات المهنية والأخلاقية</h4>
                      <p>أتعهد بـ:</p>
                      <ul className="mr-6 mt-2 space-y-1 list-disc">
                        <li>الالتزام الكامل بمعايير النظافة والصحة العامة</li>
                        <li>استخدام مكونات طازجة وصالحة للاستهلاك فقط</li>
                        <li>عدم استخدام أي مواد منتهية الصلاحية أو مواد محظورة</li>
                        <li>الصدق والشفافية في وصف المنتجات والمكونات</li>
                        <li>الإفصاح عن مسببات الحساسية بشكل واضح ودقيق</li>
                        <li>احترام خصوصية العملاء وبياناتهم</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">المادة الرابعة: المساءلة القانونية</h4>
                      <p>أقر وأوافق على أن:</p>
                      <ul className="mr-6 mt-2 space-y-1 list-disc">
                        <li><strong>أتحمل المسؤولية القانونية الكاملة</strong> عن أي ضرر أو مشكلة صحية تنتج عن منتجاتي</li>
                        <li><strong>يحق للمنصة مقاضاتي قانونياً</strong> في حالة الإخلال بذمة المهنة أو التلاعب</li>
                        <li><strong>يحق للمنصة إيقاف حسابي فوراً</strong> عند ثبوت أي مخالفة</li>
                        <li><strong>أتحمل كافة التعويضات المالية</strong> الناتجة عن مطالبات العملاء ضدي</li>
                        <li><strong>أتحمل الغرامات والعقوبات</strong> المفروضة من الجهات الرقابية</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">المادة الخامسة: حالات الإخلال</h4>
                      <p>تشمل حالات الإخلال التي تستوجب المساءلة القانونية:</p>
                      <ul className="mr-6 mt-2 space-y-1 list-disc">
                        <li>التسمم الغذائي أو الضرر الصحي للعملاء</li>
                        <li>استخدام مكونات منتهية الصلاحية</li>
                        <li>عدم النظافة في التحضير أو التخزين</li>
                        <li>الغش في المكونات أو الأوزان</li>
                        <li>عدم الإفصاح عن مسببات الحساسية</li>
                        <li>انتهاك حقوق العملاء أو خصوصيتهم</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-6">
                      <h4 className="font-bold text-amber-900 mb-2">تنبيه هام</h4>
                      <p className="text-amber-800">
                        هذا الإقرار يمثل <strong>عقداً قانونياً ملزماً</strong> بينك وبين منصة ChefHub. 
                        التوقيع الإلكتروني أدناه يعادل التوقيع الرسمي ويعتبر دليلاً قانونياً في المحاكم الكويتية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      className="w-6 h-6 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 mt-1 flex-shrink-0"
                      required
                    />
                    <div className="text-sm">
                      <div className="font-bold text-emerald-900 mb-1">
                        أقر بأنني قرأت وفهمت جميع الشروط والأحكام المذكورة أعلاه
                      </div>
                      <div className="text-emerald-800">
                        وأوافق على الالتزام الكامل بها وأتحمل المسؤولية القانونية الكاملة عن منتجاتي وخدماتي
                      </div>
                    </div>
                  </label>
                </div>

                {/* Digital Signature */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    التوقيع الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    اكتب اسمك الكامل بالعربية كما هو في بطاقتك المدنية (هذا التوقيع له قيمة قانونية)
                  </p>
                  <input
                    type="text"
                    required
                    value={formData.signature}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        signature: e.target.value,
                        signatureDate: new Date().toISOString()
                      });
                    }}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-arabic text-2xl text-center"
                    placeholder="الاسم الكامل"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  />
                  {formData.signature && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-xs text-gray-600">
                        <div><strong>التوقيع:</strong> {formData.signature}</div>
                        <div><strong>التاريخ:</strong> {new Date().toLocaleDateString('ar-KW', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                        <div><strong>البريد الإلكتروني:</strong> {formData.email}</div>
                      </div>
                    </div>
                  )}
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
              
              {currentStep < 4 ? (
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
                  disabled={loading || !formData.agreedToTerms || !formData.signature}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      إرسال الطلب والتوقيع
                    </>
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
