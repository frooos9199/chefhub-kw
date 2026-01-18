'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Search,
  Settings,
  ShoppingBag,
  TicketPercent,
  Users,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

function getRoleNavItems(role: 'customer' | 'chef' | 'admin' | 'guest'): NavItem[] {
  if (role === 'admin') {
    return [
      { href: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
      { href: '/admin/chef', label: 'الشيف', icon: Users },
      { href: '/admin/orders', label: 'الطلبات', icon: ClipboardList },
      { href: '/admin/banners', label: 'بنرات', icon: ImageIcon },
      { href: '/admin/reports', label: 'تقارير', icon: BarChart3 },
    ];
  }

  if (role === 'chef') {
    return [
      { href: '/chef/dashboard', label: 'لوحتي', icon: LayoutDashboard },
      { href: '/chef/dishes', label: 'أطباقي', icon: ShoppingBag },
      { href: '/chef/orders', label: 'الطلبات', icon: ClipboardList },
      { href: '/chef/special-orders', label: 'طلبات خاصة', icon: TicketPercent },
      { href: '/chef/settings', label: 'إعدادات', icon: Settings },
    ];
  }

  // customer + guest
  return [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/browse', label: 'تصفح', icon: Search },
    { href: '/customer/orders', label: 'طلباتي', icon: ClipboardList },
    { href: '/dishes', label: 'الأطباق', icon: ShoppingBag },
    { href: '/special-orders', label: 'عروض', icon: TicketPercent },
  ];
}

export function MobileBottomNav() {
  const pathname = usePathname() || '/';
  const { userData } = useAuth();

  // Avoid showing on auth and invoice flows.
  const shouldHide = pathname.startsWith('/auth') || pathname.startsWith('/invoice');
  if (shouldHide) return null;

  const role = (userData?.role as 'customer' | 'chef' | 'admin' | undefined) || 'guest';
  const items = getRoleNavItems(role);

  // Theme tint by role
  const activeClass =
    role === 'admin'
      ? 'text-purple-700'
      : role === 'chef'
      ? 'text-emerald-700'
      : 'text-emerald-700';

  const activeBgClass =
    role === 'admin'
      ? 'bg-purple-50'
      : role === 'chef'
      ? 'bg-emerald-50'
      : 'bg-emerald-50';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md sm:hidden" dir="rtl">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                'flex flex-col items-center justify-center py-2 transition-colors ' +
                (active ? `${activeClass} ${activeBgClass} font-semibold` : 'text-gray-700')
              }
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
