'use client';

// ============================================
// ChefHub - Customer Browse Page (Chefs & Dishes)
// ============================================

import { useState, useMemo } from 'react';
import { ChefHat, LogOut, Loader2, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ChefCard } from '@/components/ChefCard';
import { DishCard } from '@/components/DishCard';
import { CartButton } from '@/components/CartButton';
import { CartSidebar } from '@/components/CartSidebar';
import { useActiveChefs, useActiveDishes } from '@/lib/firebase/hooks';

export default function BrowsePage() {
  const { user, userData, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chefs' | 'dishes'>('chefs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('الكل');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // جلب البيانات من Firebase
  const { data: allChefs, loading: chefsLoading } = useActiveChefs();
  const { data: allDishes, loading: dishesLoading } = useActiveDishes();

  const loading = chefsLoading || dishesLoading;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  // Filter chefs
  const filteredChefs = useMemo(() => {
    if (!allChefs) return [];
    
    return allChefs.filter((chef: any) => {
      const matchesSearch = 
        searchQuery === '' ||
        chef.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.specialty?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGovernorate = 
        selectedGovernorate === 'all' || 
        chef.deliveryGovernorates?.includes(selectedGovernorate);
      
      const matchesSpecialty = 
        selectedSpecialty === 'الكل' || 
        chef.specialty?.includes(selectedSpecialty);
      
      return matchesSearch && matchesGovernorate && matchesSpecialty;
    });
  }, [allChefs, searchQuery, selectedGovernorate, selectedSpecialty]);

  // Filter dishes
  const filteredDishes = useMemo(() => {
    if (!allDishes) return [];
    
    return allDishes.filter((dish: any) => {
      const matchesSearch = 
        searchQuery === '' ||
        dish.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.descriptionAr?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedSpecialty === 'الكل' || 
        dish.category === selectedSpecialty;
      
      return matchesSearch && matchesCategory;
    });
  }, [allDishes, searchQuery, selectedSpecialty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ChefHub
                </h1>
                <span className="text-xs text-emerald-600 font-medium">تصفح الشيفات</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <CartButton onClick={() => setIsCartOpen(true)} />
              
              {user && userData ? (
                <>
                  {userData.role === 'chef' && (
                    <Link
                      href="/chef/dashboard"
                      className="px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      لوحة التحكم
                    </Link>
                  )}
                  {userData.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="px-4 py-2 text-sm font-semibold text-purple-700 hover:text-purple-800 transition-colors"
                    >
                      لوحة الأدمن
                    </Link>
                  )}
                  <span className="px-3 py-2 text-sm text-gray-700">
                    مرحباً، <span className="font-bold text-emerald-600">{userData.name}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-xl border-2 border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/auth/register/customer"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white hover:from-emerald-700 hover:to-teal-700 transition-all"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">تصفح الشيفات والأصناف 🍽️</h2>
          <p className="text-gray-600">اكتشف أفضل الشيفات والأطباق في الكويت</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 bg-white rounded-2xl p-6 border-2 border-gray-100">
          <input
            type="text"
            placeholder="ابحث عن شيف أو صنف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all mb-4"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
            >
              <option value="all">كل المحافظات</option>
              <option value="capital">العاصمة</option>
              <option value="hawalli">حولي</option>
              <option value="farwaniya">الفروانية</option>
              <option value="ahmadi">الأحمدي</option>
              <option value="jahra">الجهراء</option>
              <option value="mubarak">مبارك الكبير</option>
            </select>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
            >
              <option value="الكل">كل التخصصات</option>
              <option value="مأكولات عربية">مأكولات عربية</option>
              <option value="حلويات شرقية">حلويات شرقية</option>
              <option value="معجنات">معجنات</option>
              <option value="مأكولات خليجية">مأكولات خليجية</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('chefs')}
            className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === 'chefs'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              <span>الشيفات ({filteredChefs.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('dishes')}
            className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === 'dishes'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>الأصناف ({filteredDishes.length})</span>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        )}

        {/* Chefs Grid */}
        {!loading && activeTab === 'chefs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChefs.map((chef: any) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
            {filteredChefs.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">👨‍🍳</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد شيفات</h3>
                <p className="text-gray-600">جرب تغيير معايير البحث</p>
              </div>
            )}
          </div>
        )}

        {/* Dishes Grid */}
        {!loading && activeTab === 'dishes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish: any) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
            {filteredDishes.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد أصناف</h3>
                <p className="text-gray-600">جرب تغيير معايير البحث</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
