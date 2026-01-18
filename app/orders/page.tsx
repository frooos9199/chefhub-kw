'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function OrdersAliasPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (userData?.role === 'admin') {
      router.replace('/admin/orders');
      return;
    }

    if (userData?.role === 'chef') {
      router.replace('/chef/orders');
      return;
    }

    router.replace('/customer/orders');
  }, [loading, user, userData?.role, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-semibold">جاري تحويلك...</p>
      </div>
    </div>
  );
}
