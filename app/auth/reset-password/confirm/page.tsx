'use client';

// ============================================
// ChefHub - Confirm New Password Page
// ============================================

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, Loader2, ChefHat, CheckCircle, Eye, EyeOff } from 'lucide-react';

function ConfirmPasswordResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (!code) {
      setError('رابط إعادة التعيين غير صالح.');
    } else {
      setOobCode(code);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      setError('رابط إعادة التعيين غير صالح.');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, formData.password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error confirming password reset:', err);
      
      if (err.code === 'auth/invalid-action-code') {
        setError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
      } else if (err.code === 'auth/expired-action-code') {
        setError('رابط إعادة التعيين منتهي الصلاحية. يرجى طلب رابط جديد.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.');
      } else {
        setError('حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">تم تغيير كلمة المرور بنجاح!</h2>
          <p className="text-gray-600 mb-6">
            يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري التوجيه لصفحة تسجيل الدخول...</span>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            تسجيل الدخول الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <ChefHat className="w-10 h-10 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              ChefHub
            </span>
          </Link>
          <p className="text-gray-600 mt-2">إعادة تعيين كلمة المرور</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء كلمة مرور جديدة</h1>
            <p className="text-gray-600">أدخل كلمة المرور الجديدة لحسابك</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold mb-1">حدث خطأ</p>
                <p>{error}</p>
                {(error.includes('غير صالح') || error.includes('منتهي')) && (
                  <Link
                    href="/auth/reset-password"
                    className="text-emerald-600 hover:text-emerald-700 underline mt-2 inline-block"
                  >
                    طلب رابط جديد
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                يجب أن تكون 6 أحرف على الأقل
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div className={`h-1 flex-1 rounded ${formData.password.length >= 6 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${formData.password.length >= 8 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${formData.password.length >= 10 && /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
                <p className="text-xs text-gray-500">
                  {formData.password.length < 6 && 'ضعيفة - يجب أن تكون 6 أحرف على الأقل'}
                  {formData.password.length >= 6 && formData.password.length < 8 && 'متوسطة - استخدم 8 أحرف أو أكثر'}
                  {formData.password.length >= 8 && formData.password.length < 10 && 'جيدة'}
                  {formData.password.length >= 10 && /[A-Z]/.test(formData.password) && 'قوية جداً'}
                  {formData.password.length >= 10 && !/[A-Z]/.test(formData.password) && 'جيدة - أضف حروف كبيرة لمزيد من الأمان'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !oobCode}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التغيير...
                </>
              ) : (
                'تغيير كلمة المرور'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-emerald-600 font-medium"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPasswordResetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <ConfirmPasswordResetContent />
    </Suspense>
  );
}
