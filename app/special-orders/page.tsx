'use client';

// ============================================
// ChefHub - Special Orders Page
// Customer view of all active special orders
// ============================================

import { useState } from 'react';
import { TrendingUp, Sparkles, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import { SpecialOrderCard } from '@/components/SpecialOrderCard';
import { CartButton } from '@/components/CartButton';
import { CartSidebar } from '@/components/CartSidebar';

// Mock data - will be replaced with Firebase
const MOCK_SPECIAL_ORDERS = [
  {
    id: 'so1',
    title: 'كنافة رمضانية خاصة',
    description: 'كنافة فاخرة محضرة خصيصاً لشهر رمضان المبارك بمكونات مميزة وحشوة الفستق الحلبي',
    price: 12.500,
    image: '',
    chefId: '1',
    chefName: 'فاطمة أحمد',
    chefImage: '',
    maxQuantity: 50,
    currentOrders: 38,
    startDate: '2025-11-15',
    endDate: '2025-11-25',
    deliveryGovernorates: ['العاصمة', 'حولي', 'الفروانية'],
    category: 'حلويات شرقية',
    prepTime: 45,
  },
  {
    id: 'so2',
    title: 'مجبوس سمك فاخر',
    description: 'مجبوس سمك طازج مع البهارات الكويتية الأصيلة - عرض خاص لعطلة نهاية الأسبوع',
    price: 15.000,
    image: '',
    chefId: '2',
    chefName: 'محمد علي',
    chefImage: '',
    maxQuantity: 30,
    currentOrders: 12,
    startDate: '2025-11-12',
    endDate: '2025-11-14',
    deliveryGovernorates: ['العاصمة', 'حولي', 'الأحمدي', 'مبارك الكبير'],
    category: 'مأكولات بحرية',
    prepTime: 60,
  },
  {
    id: 'so3',
    title: 'حلى الأوريو الفاخر',
    description: 'حلى بارد بطبقات الأوريو والكريمة - مثالي للحفلات والمناسبات',
    price: 8.000,
    image: '',
    chefId: '1',
    chefName: 'فاطمة أحمد',
    chefImage: '',
    maxQuantity: 40,
    currentOrders: 35,
    startDate: '2025-11-10',
    endDate: '2025-11-20',
    deliveryGovernorates: ['العاصمة', 'حولي'],
    category: 'حلويات',
    prepTime: 30,
  },
  {
    id: 'so4',
    title: 'باستا بالمأكولات البحرية',
    description: 'باستا إيطالية فاخرة مع الروبيان والسالمون - عرض محدود',
    price: 18.500,
    image: '',
    chefId: '2',
    chefName: 'محمد علي',
    chefImage: '',
    maxQuantity: 20,
    currentOrders: 20,
    startDate: '2025-11-08',
    endDate: '2025-11-12',
    deliveryGovernorates: ['العاصمة', 'حولي', 'الفروانية', 'الأحمدي'],
    category: 'إيطالي',
    prepTime: 40,
  },
];

const CATEGORIES = ['الكل', 'حلويات شرقية', 'حلويات', 'مأكولات بحرية', 'إيطالي', 'مأكولات عربية'];

export default function SpecialOrdersPage() {
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState<'newest' | 'ending-soon' | 'almost-full'>('newest');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter and sort orders
  let filteredOrders = MOCK_SPECIAL_ORDERS.filter((order) => {
    if (selectedCategory === 'الكل') return true;
    return order.category === selectedCategory;
  });

  // Sort
  filteredOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'ending-soon') {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    } else if (sortBy === 'almost-full') {
      const aPercentage = (a.currentOrders / a.maxQuantity) * 100;
      const bPercentage = (b.currentOrders / b.maxQuantity) * 100;
      return bPercentage - aPercentage;
    }
    return 0; // newest (default order)
  });

  const activeOrders = filteredOrders.filter((order) => order.currentOrders < order.maxQuantity);
  const soldOutOrders = filteredOrders.filter((order) => order.currentOrders >= order.maxQuantity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ChefHub
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                href="/browse"
                className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
              >
                الأصناف العادية
              </Link>
              <CartButton onClick={() => setIsCartOpen(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">عروض خاصة ومحدودة</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            الطلبات الخاصة ⭐
          </h1>
          
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            اطلب الآن من الأصناف المميزة والعروض المحدودة من أفضل الشيفات
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Category Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-700">الفئة:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-700">الترتيب:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">الأحدث</option>
                <option value="ending-soon">ينتهي قريباً</option>
                <option value="almost-full">الأكثر طلباً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-black text-gray-900">
                الطلبات المتاحة ({activeOrders.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => (
                <SpecialOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Sold Out Orders */}
        {soldOutOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl">🔒</div>
              <h2 className="text-2xl font-black text-gray-500">
                نفذت الكمية ({soldOutOrders.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {soldOutOrders.map((order) => (
                <SpecialOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              لا توجد طلبات خاصة في هذه الفئة
            </h3>
            <p className="text-gray-600 mb-6">جرب فئة أخرى أو تصفح الأصناف العادية</p>
            <Link
              href="/browse"
              className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              تصفح الأصناف العادية
            </Link>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
