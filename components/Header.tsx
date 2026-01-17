'use client';

import { ShoppingCart, ChefHat, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CartSidebar } from './CartSidebar';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { items, itemCount } = useCart();
  const { userData, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Hide header on chef, admin, and auth pages
  const shouldHideHeader = 
    pathname?.startsWith('/chef/') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/invoice');

  if (shouldHideHeader) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
              ChefHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              الرئيسية
            </Link>
            <Link href="/chefs" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              الشيفات
            </Link>
            <Link href="/dishes" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              المنتجات
            </Link>
            <Link href="/special-orders" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              العروض الخاصة
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell (Chef & Admin only) */}
            <NotificationBell />

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {userData ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href={
                    userData.role === 'chef'
                      ? '/chef/dashboard'
                      : userData.role === 'admin'
                      ? '/admin/dashboard'
                      : '/customer/orders'
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{userData.name}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  تسجيل خروج
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  تسجيل دخول
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  تسجيل جديد
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                الرئيسية
              </Link>
              <Link
                href="/chefs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                الشيفات
              </Link>
              <Link
                href="/dishes"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                المنتجات
              </Link>
              <Link
                href="/special-orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                العروض الخاصة
              </Link>

              {userData ? (
                <>
                  <Link
                    href={
                      userData.role === 'chef'
                        ? '/chef/dashboard'
                        : userData.role === 'admin'
                        ? '/admin/dashboard'
                        : '/customer/orders'
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {userData.name}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-right"
                  >
                    تسجيل خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    تسجيل دخول
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium text-center"
                  >
                    تسجيل جديد
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
