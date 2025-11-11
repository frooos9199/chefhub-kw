'use client';

// ============================================
// ChefHub - Cart Context
// Global state management for shopping cart
// ============================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================
// Types
// ============================================

export interface CartItem {
  id: string;
  dishId: string;
  dishName: string;
  dishImage: string;
  price: number;
  quantity: number;
  chefId: string;
  chefName: string;
  prepTime: number;
  notes?: string;
}

export interface DeliveryAddress {
  governorate: string;
  area: string;
  block?: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  additionalInfo?: string;
  phoneNumber: string;
}

interface CartContextType {
  items: CartItem[];
  deliveryAddress: DeliveryAddress | null;
  
  // Cart operations
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  
  // Delivery
  setDeliveryAddress: (address: DeliveryAddress) => void;
  
  // Calculations
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  
  // Helpers
  getChefItems: (chefId: string) => CartItem[];
  getUniqueChefs: () => { id: string; name: string; items: CartItem[] }[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================
// Local Storage Keys
// ============================================

const CART_STORAGE_KEY = 'chefhub_cart';
const ADDRESS_STORAGE_KEY = 'chefhub_delivery_address';

// ============================================
// Delivery Fee Calculator
// ============================================

const DELIVERY_FEES: Record<string, number> = {
  'العاصمة': 1.500,
  'حولي': 1.500,
  'الفروانية': 2.000,
  'الأحمدي': 2.500,
  'الجهراء': 3.000,
  'مبارك الكبير': 2.000,
};

function calculateDeliveryFee(governorate: string | undefined): number {
  if (!governorate) return 0;
  return DELIVERY_FEES[governorate] || 2.000;
}

// ============================================
// Provider Component
// ============================================

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddressState] = useState<DeliveryAddress | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY);
      
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      
      if (savedAddress) {
        setDeliveryAddressState(JSON.parse(savedAddress));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isLoaded]);

  // Save address to localStorage
  useEffect(() => {
    if (isLoaded && deliveryAddress) {
      try {
        localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(deliveryAddress));
      } catch (error) {
        console.error('Error saving address to localStorage:', error);
      }
    }
  }, [deliveryAddress, isLoaded]);

  // ============================================
  // Cart Operations
  // ============================================

  const addItem = (item: Omit<CartItem, 'id'>) => {
    setItems((prevItems) => {
      // Check if item already exists
      const existingItem = prevItems.find(
        (i) => i.dishId === item.dishId && i.chefId === item.chefId
      );

      if (existingItem) {
        // Update quantity
        return prevItems.map((i) =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.dishId}-${Date.now()}`,
      };

      return [...prevItems, newItem];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateNotes = (itemId: string, notes: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setDeliveryAddressState(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(ADDRESS_STORAGE_KEY);
  };

  const setDeliveryAddress = (address: DeliveryAddress) => {
    setDeliveryAddressState(address);
  };

  // ============================================
  // Calculations
  // ============================================

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const deliveryFee = calculateDeliveryFee(deliveryAddress?.governorate);
  
  const total = subtotal + deliveryFee;
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // ============================================
  // Helpers
  // ============================================

  const getChefItems = (chefId: string) => {
    return items.filter((item) => item.chefId === chefId);
  };

  const getUniqueChefs = () => {
    const chefMap = new Map<string, { id: string; name: string; items: CartItem[] }>();

    items.forEach((item) => {
      if (!chefMap.has(item.chefId)) {
        chefMap.set(item.chefId, {
          id: item.chefId,
          name: item.chefName,
          items: [],
        });
      }
      chefMap.get(item.chefId)!.items.push(item);
    });

    return Array.from(chefMap.values());
  };

  // ============================================
  // Context Value
  // ============================================

  const value: CartContextType = {
    items,
    deliveryAddress,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    setDeliveryAddress,
    subtotal,
    deliveryFee,
    total,
    itemCount,
    getChefItems,
    getUniqueChefs,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}
