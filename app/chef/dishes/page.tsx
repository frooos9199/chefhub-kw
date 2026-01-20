'use client';

// ============================================
// ChefHub - Chef Dishes Management Page
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Plus,
  Search,
  ChefHat,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock dishes data
const MOCK_DISHES = [
  {
    id: '1',
    name: 'مجبوس دجاج',
    nameEn: 'Chicken Majboos',
    description: 'أرز مبهر مع دجاج طري ومكسرات مقرمشة',
    category: 'رئيسي',
    price: 8.500,
    preparationTime: 45,
    image: '/dishes/majboos.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 156,
    rating: 4.8,
    ratingsCount: 42,
  },
  {
    id: '2',
    name: 'معصوب',
    nameEn: 'Maasoob',
    description: 'حلى تقليدي بالموز والعسل والقشطة',
    category: 'حلويات',
    price: 4.500,
    preparationTime: 20,
    image: '/dishes/maasoob.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 89,
    rating: 4.9,
    ratingsCount: 28,
  },
  {
    id: '3',
    name: 'هريس',
    nameEn: 'Harees',
    description: 'قمح مطحون مع لحم وسمن عربي',
    category: 'رئيسي',
    price: 12.000,
    preparationTime: 120,
    image: '/dishes/harees.jpg',
    isActive: true,
    isAvailable: false,
    totalOrders: 234,
    rating: 4.7,
    ratingsCount: 67,
  },
  {
    id: '4',
    name: 'مكبوس لحم',
    nameEn: 'Meat Makboos',
    description: 'أرز مبهر مع لحم الغنم الطري',
    category: 'رئيسي',
    price: 10.000,
    preparationTime: 60,
    image: '/dishes/makboos.jpg',
    isActive: false,
    isAvailable: false,
    totalOrders: 67,
    rating: 4.6,
    ratingsCount: 19,
  },
  // البهارات
  {
    id: '5',
    name: 'مزيج البهارات الخاص',
    nameEn: 'Special Spice Mix',
    description: 'مزيج حصري من البهارات المحمصة والمطحونة',
    category: 'البهارات',
    price: 2.500,
    preparationTime: 5,
    image: '/spices/mix.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 150,
    rating: 4.9,
    ratingsCount: 45,
  },
  {
    id: '6',
    name: 'الزعفران الفاخر',
    nameEn: 'Premium Saffron',
    description: 'زعفران إيراني عالي الجودة',
    category: 'البهارات',
    price: 8.000,
    preparationTime: 5,
    image: '/spices/saffron.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 45,
    rating: 5.0,
    ratingsCount: 18,
  },
  {
    id: '7',
    name: 'بهار الكمون والكزبرة',
    nameEn: 'Cumin & Coriander Mix',
    description: 'خليط متوازن من الكمون والكزبرة المحمصة',
    category: 'البهارات',
    price: 1.800,
    preparationTime: 5,
    image: '/spices/cumin.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 200,
    rating: 4.8,
    ratingsCount: 52,
  },
  // المنتجات
  {
    id: '8',
    name: 'عسل الشوكة الطبيعي',
    nameEn: 'Natural Wild Honey',
    description: 'عسل طبيعي 100% من مزارع محلية',
    category: 'المنتجات',
    price: 12.500,
    preparationTime: 0,
    image: '/products/honey.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 320,
    rating: 4.9,
    ratingsCount: 89,
  },
  {
    id: '9',
    name: 'مربى التمر بالجوز',
    nameEn: 'Date & Walnut Jam',
    description: 'مربى فاخرة من التمر الفاخر والجوز المحمص',
    category: 'المنتجات',
    price: 5.000,
    preparationTime: 10,
    image: '/products/jam.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 180,
    rating: 4.7,
    ratingsCount: 54,
  },
  {
    id: '10',
    name: 'زيت الزيتون البكر',
    nameEn: 'Extra Virgin Olive Oil',
    description: 'زيت زيتون بكر ممتاز عصرة أولى',
    category: 'المنتجات',
    price: 8.000,
    preparationTime: 0,
    image: '/products/olive-oil.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 210,
    rating: 4.8,
    ratingsCount: 67,
  },
  // العروض
  {
    id: '11',
    name: 'عرض وجبة العائلة',
    nameEn: 'Family Meal Deal',
    description: 'مجبوس دجاج + معصوب + سلطة (يكفي 4 أشخاص)',
    category: 'العروض',
    price: 18.000,
    preparationTime: 45,
    image: '/offers/family-meal.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 145,
    rating: 4.9,
    ratingsCount: 78,
  },
  {
    id: '12',
    name: 'عرض البهارات الخاصة',
    nameEn: 'Special Spices Bundle',
    description: 'مجموعة من 5 أنواع بهارات مختلفة - خصم 25%',
    category: 'العروض',
    price: 15.000,
    preparationTime: 5,
    image: '/offers/spices-bundle.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 92,
    rating: 4.8,
    ratingsCount: 41,
  },
  {
    id: '13',
    name: 'عرض المنتجات الطبيعية',
    nameEn: 'Natural Products Bundle',
    description: 'عسل + زيت زيتون + مربى التمر',
    category: 'العروض',
    price: 22.000,
    preparationTime: 0,
    image: '/offers/natural-bundle.jpg',
    isActive: true,
    isAvailable: true,
    totalOrders: 167,
    rating: 5.0,
    ratingsCount: 95,
  },
];

export default function ChefDishesPage() {
  const { userData, loading: authLoading } = useAuth();
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (userData?.uid) {
      fetchDishes();
    } else if (!authLoading) {
      // إذا انتهى تحميل Auth ولا يوجد userData، أوقف loading
      setLoading(false);
    }
  }, [userData, authLoading]);

  const fetchDishes = async () => {
    const chefId = userData?.chefId || userData?.uid;

    if (!chefId) {
      console.error('❌ chefId/uid is missing in userData');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 Fetching dishes for chefId:', chefId);
      const dishesRef = collection(db, 'dishes');
      const q = query(
        dishesRef,
        where('chefId', '==', chefId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const dishesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDishes(dishesData);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      // في حالة عدم وجود index، استخدم Mock data
      setDishes(MOCK_DISHES);
    } finally {
      setLoading(false);
    }
  };

  const toggleDishStatus = async (dishId: string, currentStatus: boolean) => {
    try {
      const dishRef = doc(db, 'dishes', dishId);
      await updateDoc(dishRef, {
        isActive: !currentStatus
      });
      await fetchDishes();
    } catch (error) {
      console.error('Error toggling dish status:', error);
      alert('حدث خطأ أثناء تحديث حالة الطبق');
    }
  };

  const toggleDishAvailability = async (dishId: string, currentAvailability: boolean) => {
    try {
      const dishRef = doc(db, 'dishes', dishId);
      await updateDoc(dishRef, {
        isAvailable: !currentAvailability
      });
      await fetchDishes();
    } catch (error) {
      console.error('Error toggling dish availability:', error);
      alert('حدث خطأ أثناء تحديث توفر الطبق');
    }
  };

  const deleteDish = async (dishId: string, dishName: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${dishName}"؟\n\nلن تتمكن من استعادة الطبق بعد الحذف.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'dishes', dishId));
      await fetchDishes();
      alert('تم حذف الطبق بنجاح ✅');
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('حدث خطأ أثناء حذف الطبق');
    }
  };

  const categories = ['all', 'رئيسي', 'حلويات', 'مقبلات', 'مشروبات'];

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      searchQuery === '' ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dish.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && dish.isActive) ||
      (filterStatus === 'inactive' && !dish.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: dishes.length,
    active: dishes.filter((d) => d.isActive).length,
    inactive: dishes.filter((d) => !d.isActive).length,
    available: dishes.filter((d) => d.isAvailable).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الأصناف...</p>
        </div>
      </div>
    );
  }

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
                  إدارة الأصناف
                </h1>
                <span className="text-xs text-gray-500">{userData?.name || 'الشيف'}</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/chef/dishes/new"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">إضافة صنف جديد</span>
              </Link>

              <Link
                href="/chef/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">أصنافي 🍽️</h2>
          <p className="text-gray-600">إدارة وتحديث قائمة الأطباق</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">إجمالي الأصناف</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
            <div className="text-3xl font-black text-emerald-600">{stats.active}</div>
            <div className="text-sm text-gray-600">نشط</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="text-3xl font-black text-gray-500">{stats.inactive}</div>
            <div className="text-sm text-gray-600">غير نشط</div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <div className="text-3xl font-black text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">متاح الآن</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن صنف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'كل الفئات' : cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all font-semibold"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط فقط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl overflow-hidden border-2 transition-all hover:shadow-xl ${
                dish.isActive ? 'border-gray-100 hover:border-emerald-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
                {dish.images && dish.images.length > 0 && dish.images[0] ? (
                  <Image
                    src={dish.images[0]}
                    alt={dish.name || dish.nameAr || 'صورة الصنف'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-16 h-16 text-emerald-600 opacity-20" />
                  </div>
                )}
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {dish.isActive ? (
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      نشط
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                      متوقف
                    </span>
                  )}
                  {!dish.isAvailable && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      غير متاح
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-lg font-black text-gray-900 mb-1">{dish.name}</h3>
                  <p className="text-xs text-gray-500">{dish.nameEn}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{dish.description}</p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                    {dish.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {dish.preparationTime} دقيقة
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-sm font-black text-emerald-600">{dish.price.toFixed(3)}</div>
                    <div className="text-xs text-gray-500">د.ك</div>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <div className="text-sm font-black text-gray-900">{dish.totalOrders}</div>
                    <div className="text-xs text-gray-500">طلب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-amber-500 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {dish.rating}
                    </div>
                    <div className="text-xs text-gray-500">{dish.ratingsCount}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-2">
                  <Link
                    href={`/chef/dishes/${dish.id}/edit`}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل</span>
                  </Link>
                  <button 
                    onClick={() => toggleDishStatus(dish.id, dish.isActive)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    title={dish.isActive ? 'إيقاف الطبق' : 'تفعيل الطبق'}
                  >
                    {dish.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => deleteDish(dish.id, dish.name)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    title="حذف الطبق"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Toggle Availability */}
                <button
                  onClick={() => toggleDishAvailability(dish.id, dish.isAvailable)}
                  className={`w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    dish.isAvailable
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{dish.isAvailable ? 'متاح للطلب' : 'غير متاح للطلب'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد أصناف</h3>
            <p className="text-gray-600 mb-6">جرب البحث بكلمات مختلفة أو اختر فلتر آخر</p>
            <Link
              href="/chef/dishes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة صنف جديد</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
