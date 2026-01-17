'use client';

// ============================================
// ChefHub - Cart Sidebar
// Slide-in cart panel
// ============================================

import { X, ShoppingCart, Trash2, Plus, Minus, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    itemCount,
    getUniqueChefs,
  } = useCart();

  const chefs = getUniqueChefs();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-black">سلة التسوق</h2>
                <p className="text-sm opacity-90">{itemCount} صنف</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            // Empty Cart
            <div
              className="flex-1 flex flex-col items-center justify-center p-8"
            >
              <ShoppingBag className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-4">السلة فارغة</p>
              <Link href="/" onClick={onClose}>
                <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  تصفح الأصناف
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chefs.map((chef) => (
                  <div key={chef.id} className="space-y-4">
                    {/* Chef Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                        {chef.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{chef.name}</span>
                    </div>

                    {/* Chef Items */}
                    {chef.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.dishImage ? (
                            <Image
                              src={item.dishImage}
                              alt={item.dishName || 'صورة المنتج'}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🍽️</span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{item.dishName}</h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.price.toFixed(3)} د.ك × {item.quantity}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-emerald-500 transition-all"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-emerald-500 transition-all"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="font-bold text-emerald-600">
                            {(item.price * item.quantity).toFixed(3)} د.ك
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer - Summary & Checkout */}
              <div className="border-t border-gray-200 p-6 bg-white space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>المجموع الفرعي</span>
                    <span className="font-bold">{subtotal.toFixed(3)} د.ك</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>رسوم التوصيل</span>
                    <span className="font-bold">
                      {deliveryFee > 0 ? `${deliveryFee.toFixed(3)} د.ك` : 'سيتم حسابه'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-lg">
                    <span className="font-black text-gray-900">الإجمالي</span>
                    <span className="font-black text-emerald-600">
                      {total.toFixed(3)} د.ك
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>إتمام الطلب</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  متابعة التسوق
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
