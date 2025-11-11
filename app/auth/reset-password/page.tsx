'use client';

// ============================================
// ChefHub - Reset Password Page
// ============================================

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth';
import { Mail, Loader2, ChefHat, CheckCircle, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'حدث خطأ أثناء إرسال البريد');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إرسال البريد بنجاح</h2>
          <p className="text-gray-600 mb-6">تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowRight className="w-5 h-5" />
            العودة لتسجيل الدخول
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-gray-600 mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="example@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال رابط إعادة التعيين'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
