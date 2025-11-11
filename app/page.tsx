// ============================================
// ChefHub - الصفحة الرئيسية
// ============================================

'use client';

import { ChefHat, Package, TrendingUp, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ChefHat className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ChefHub</h1>
                <span className="text-xs text-emerald-600 font-medium">مركز الشيفات</span>
              </div>
            </div>
            <div className="flex gap-3">
              {!loading && user && userData ? (
                <>
                  <span className="px-4 py-2.5 text-sm text-gray-700">
                    مرحباً، <span className="font-bold text-emerald-600">{userData.name}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl border-2 border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="rounded-xl border-2 border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all">
                    تسجيل الدخول
                  </Link>
                  <Link href="/auth/register/customer" className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 transition-all">
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="mb-6 inline-block rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-2">
            <span className="text-emerald-700 font-semibold text-sm">🇰🇼 صنع في الكويت بكل فخر</span>
          </div>
          
          <h2 className="mb-6 text-6xl font-black text-gray-900 leading-tight">
            مرحباً بك في{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              ChefHub
            </span>
          </h2>
          <p className="mb-4 text-2xl font-bold text-gray-700">
            منصة تربط الشيفات في الكويت مع العملاء 🇰🇼
          </p>
          <p className="mb-16 text-lg text-gray-500 max-w-2xl mx-auto">
            اطلب أطعمة لذيذة مطبوخة بحب من مطابخ خاصة 🍽️ • توصيل سريع لجميع المحافظات 🚗
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              href="/browse"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-2xl shadow-emerald-200 hover:shadow-emerald-300 transition-all transform hover:scale-105"
            >
              تصفح الشيفات والأصناف 🍽️
            </Link>
            {!user && (
              <Link
                href="/auth/register/chef"
                className="px-8 py-4 border-2 border-emerald-600 text-emerald-700 text-lg font-bold rounded-xl hover:bg-emerald-50 transition-all transform hover:scale-105"
              >
                انضم كشيف 👨‍🍳
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="group rounded-3xl border-2 border-emerald-100 bg-white p-8 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 hover:border-emerald-200 transition-all duration-300">
              <div className="mb-4 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm font-semibold text-gray-600 mt-2">شيف مسجل</div>
            </div>
            
            <div className="group rounded-3xl border-2 border-teal-100 bg-white p-8 shadow-lg shadow-teal-100/50 hover:shadow-xl hover:shadow-teal-200/50 hover:border-teal-200 transition-all duration-300">
              <div className="mb-4 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm font-semibold text-gray-600 mt-2">صنف متوفر</div>
            </div>
            
            <div className="group rounded-3xl border-2 border-cyan-100 bg-white p-8 shadow-lg shadow-cyan-100/50 hover:shadow-xl hover:shadow-cyan-200/50 hover:border-cyan-200 transition-all duration-300">
              <div className="mb-4 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm font-semibold text-gray-600 mt-2">طلب مكتمل</div>
            </div>
            
            <div className="group rounded-3xl border-2 border-purple-100 bg-white p-8 shadow-lg shadow-purple-100/50 hover:shadow-xl hover:shadow-purple-200/50 hover:border-purple-200 transition-all duration-300">
              <div className="mb-4 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">6</div>
              <div className="text-sm font-semibold text-gray-600 mt-2">محافظة كويتية</div>
            </div>
          </div>

          {/* Status */}
          <div className="relative rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 shadow-xl shadow-emerald-100/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-block mb-4 rounded-2xl bg-white/80 backdrop-blur-sm px-6 py-3 shadow-lg">
                <span className="text-4xl">🚧</span>
              </div>
              
              <h3 className="mb-4 text-3xl font-black text-gray-900">
                المشروع قيد الإنشاء
              </h3>
              <p className="mb-8 text-lg text-gray-700 font-medium">
                نعمل حالياً على بناء ChefHub بكل حب وشغف ❤️
              </p>
              
              <div className="mb-6 h-3 overflow-hidden rounded-full bg-white/80 backdrop-blur-sm shadow-inner">
                <div className="h-full w-[10%] rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-lg animate-pulse"></div>
              </div>
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm px-4 py-2 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-sm font-bold text-emerald-700">المرحلة 1: إعداد البنية الأساسية ✅</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm px-4 py-2 shadow-lg ml-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                  <p className="text-sm font-bold text-teal-700">المرحلة 2: إعداد Firebase وقاعدة البيانات 🔄</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 shadow-lg">
              <ChefHat className="h-5 w-5 text-emerald-600" />
              <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ChefHub</span>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-gray-600 font-medium mb-2">© 2025 ChefHub - مركز الشيفات • الكويت 🇰🇼</p>
            <p className="text-sm text-gray-500">Made with <span className="text-red-500 animate-pulse">❤️</span> by ChefHub Team</p>
          </div>
          
          {/* Developer Credit */}
          <div className="flex justify-center">
            <a 
              href="https://nexdev-portfolio-one.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-white px-6 py-3 shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Developed by</span>
              </div>
              <span className="font-black text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:via-teal-700 group-hover:to-cyan-700">
                NexDev
              </span>
              <svg className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
