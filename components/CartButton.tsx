'use client';

// ============================================
// ChefHub - Cart Button
// Floating cart button with item count badge
// ============================================

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartButtonProps {
  onClick: () => void;
}

export function CartButton({ onClick }: CartButtonProps) {
  const { itemCount } = useCart();

  return (
    <button
      onClick={onClick}
      className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
    >
      <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
      
      {itemCount > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black border-2 border-white animate-pulse">
          {itemCount > 9 ? '9+' : itemCount}
        </div>
      )}
    </button>
  );
}
