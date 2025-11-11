'use client';

// ============================================
// ChefHub - Customer Login Page
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Mail, Lock, Loader2, ChefHat } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(formData.email, formData.password);

    if (result.success && result.userData) {
      // Redirect based on role
      if (result.userData.role === 'customer') {
        router.push('/');
      } else if (result.userData.role === 'chef') {
        router.push('/chef/dashboard');
      } else if (result.userData.role === 'admin') {
        router.push('/admin/dashboard');
      }
    } else {
      setError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
      setLoading(false);
    }
  };

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
          <p className="text-gray-600 mt-2">منصة الشيفات في الكويت</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-600 mb-6">مرحباً بك في ChefHub</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="example@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link 
                href="/auth/reset-password" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Register Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <p className="text-center text-sm text-gray-600">ليس لديك حساب؟</p>
            <div className="flex gap-3">
              <Link
                href="/auth/register/customer"
                className="flex-1 text-center py-2 px-4 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all font-medium"
              >
                تسجيل كعميل
              </Link>
              <Link
                href="/auth/register/chef"
                className="flex-1 text-center py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium"
              >
                تسجيل كشيف
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
