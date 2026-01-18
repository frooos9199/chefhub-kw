'use client';

// ============================================
// ChefHub - Special Orders Page
// Customer view of all active special orders
// ============================================

import { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Filter, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SpecialOrderCard } from '@/components/SpecialOrderCard';
import { CartButton } from '@/components/CartButton';
import { CartSidebar } from '@/components/CartSidebar';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CATEGORIES = ['الكل', 'حلويات شرقية', 'حلويات', 'مأكولات بحرية', 'إيطالي', 'مأكولات عربية', 'مخبوزات', 'وجبات رئيسية'];

export default function SpecialOrdersPage() {
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState<'newest' | 'ending-soon' | 'almost-full'>('newest');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialOrders, setSpecialOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpecialOrders();
  }, []);

  async function loadSpecialOrders() {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get special orders that haven't ended yet
      const q = query(
        collection(db, 'special_orders'),
        where('isActive', '==', true),
        where('endDate', '>=', Timestamp.fromDate(today))
      );
      
      const snapshot = await getDocs(q);
      const orders: any[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Get chef info
        const chefDoc = await getDocs(
          query(collection(db, 'chefs'), where('__name__', '==', data.chefId))
        );
        
        const chefData = chefDoc.docs[0]?.data();
        
        orders.push({
          id: doc.id,
          ...data,
          chefName: chefData?.businessName || chefData?.name || 'شيف',
          chefImage: chefData?.profileImage || '',
          startDate: data.startDate?.toDate?.()?.toISOString().split('T')[0] || '',
          endDate: data.endDate?.toDate?.()?.toISOString().split('T')[0] || ''
        });
      }
      
      setSpecialOrders(orders);
      console.log('✅ Special orders loaded in page:', orders.length, orders);
    } catch (error) {
      console.error('❌ Error loading special orders:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort orders
  let filteredOrders = specialOrders.filter((order) => {
    if (selectedCategory === 'الكل') return true;
    return order.category === selectedCategory;
  });

  // Sort
  filteredOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'ending-soon') {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    } else if (sortBy === 'almost-full') {
      const aPercentage = ((a.currentOrders || 0) / a.maxOrders) * 100;
      const bPercentage = ((b.currentOrders || 0) / b.maxOrders) * 100;
      return bPercentage - aPercentage;
    }
    return 0; // newest (default order)
  });

  const activeOrders = filteredOrders.filter((order) => (order.currentOrders || 0) < order.maxOrders);
  const soldOutOrders = filteredOrders.filter((order) => (order.currentOrders || 0) >= order.maxOrders);

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
                href="/"
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
            اطلب الآن من الأصناف المميزة والعروض المحدودة من أفضل الشيف
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
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
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 opacity-60">
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
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              تصفح الأصناف العادية
            </Link>
          </div>
        )}
          </>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
