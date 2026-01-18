'use client';

import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Chef {
  id: string;
  name: string;
  profileImage?: string;
  specialty: string[];
  rating: number;
  totalOrders: number;
}

export default function ChefsPage() {
  const { user, userData } = useAuth();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const chefsRef = collection(db, 'chefs');
        const chefsQuery = query(
          chefsRef,
          where('status', '==', 'active'),
          where('isActive', '==', true)
        );
        const chefsSnapshot = await getDocs(chefsQuery);
        const chefsData = chefsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chef[];
        
        // Sort by rating in frontend
        const sortedChefs = chefsData.sort((a, b) => b.rating - a.rating);
        setChefs(sortedChefs);
      } catch (error) {
        console.error('Error fetching chefs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChefs();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-6">
            <ArrowRight className="w-5 h-5" />
            الرجوع للصفحة الرئيسية
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">جميع الشيف</h1>
            <p className="text-gray-600">اختر الشيف المفضل لديك واطلب الآن</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-bold">جاري التحميل...</p>
            </div>
          )}

          {/* Chefs Grid */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {chefs.map((chef) => (
                <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                      {chef.profileImage ? (
                        <img 
                          src={chef.profileImage} 
                          alt={chef.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                          <span className="text-6xl">👨‍🍳</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-gray-900 text-base md:text-lg mb-2 line-clamp-1">{chef.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500 mb-3 line-clamp-2 h-8">{chef.specialty.join(' • ')}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900">{chef.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-semibold">
                          {chef.totalOrders} طلب
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && chefs.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد شيفات حالياً</h3>
              <p className="text-gray-600">جاري إضافة شيفات جدد قريباً</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
