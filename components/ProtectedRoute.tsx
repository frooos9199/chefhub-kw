'use client';

// ============================================
// ChefHub - Protected Route Component
// ============================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user || !userData) {
        router.push(redirectTo);
        return;
      }

      // Check if user role is allowed
      if (allowedRoles && !allowedRoles.includes(userData.role)) {
        router.push('/unauthorized');
        return;
      }

      // Check if user is active
      if (!userData.isActive) {
        router.push('/account-inactive');
        return;
      }
    }
  }, [user, userData, loading, allowedRoles, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or not allowed
  if (!user || !userData || (allowedRoles && !allowedRoles.includes(userData.role))) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
