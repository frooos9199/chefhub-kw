// ============================================
// ChefHub - Firebase-Specific Type Definitions
// ============================================

import { Timestamp } from 'firebase/firestore';

// ============================================
// Firestore Document with Timestamp
// ============================================

export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Chef Firebase Document
// ============================================

export interface ChefFirestore extends FirestoreDocument {
  userId: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  coverImage?: string;
  bio: string;
  specialty: string;
  governorate: string;
  area: string;
  address: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  isVerified: boolean;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  commission: number;
  
  documents: {
    civilId?: string;
    healthCertificate?: string;
    businessLicense?: string;
  };
  
  settings: {
    notifications: {
      email: boolean;
      whatsapp: boolean;
      newOrder: boolean;
      orderUpdate: boolean;
    };
    delivery: {
      governorates: string[];
      fees: Record<string, number>;
      estimatedTime: number;
    };
    workingHours: {
      [key: string]: {
        enabled: boolean;
        open: string;
        close: string;
      };
    };
  };
  
  approvedAt?: Timestamp;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
}

// ============================================
// Dish Firebase Document
// ============================================

export interface DishFirestore extends FirestoreDocument {
  chefId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  price: number;
  images: string[];
  preparationTime: number;
  servings: number;
  allergens: string[];
  isActive: boolean;
  isAvailable: boolean;
  rating: number;
  totalOrders: number;
  totalReviews: number;
}

// ============================================
// Order Firebase Document
// ============================================

export interface OrderFirestore extends FirestoreDocument {
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  chefId: string;
  chefName: string;
  
  items: {
    dishId: string;
    dishName: string;
    dishNameEn: string;
    dishImage: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  
  subtotal: number;
  deliveryFee: number;
  commission: number;
  commissionRate: number;
  total: number;
  
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'knet';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  
  governorate: string;
  area: string;
  address: string;
  block?: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  
  customerNotes?: string;
  chefNotes?: string;
  
  statusHistory: {
    status: string;
    timestamp: Timestamp;
    note?: string;
  }[];
  
  estimatedDeliveryTime?: Timestamp;
  actualDeliveryTime?: Timestamp;
  
  invoiceUrl?: string;
  receiptUrl?: string;
  
  cancelledAt?: Timestamp;
  cancellationReason?: string;
}

// ============================================
// Special Order Firebase Document
// ============================================

export interface SpecialOrderFirestore extends FirestoreDocument {
  chefId: string;
  chefName: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;
  status: 'active' | 'sold_out' | 'expired' | 'cancelled';
  startDate: Timestamp;
  endDate: Timestamp;
}

// ============================================
// Review Firebase Document
// ============================================

export interface ReviewFirestore extends FirestoreDocument {
  orderId: string;
  customerId: string;
  customerName: string;
  chefId: string;
  dishId?: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  response?: {
    text: string;
    createdAt: Timestamp;
  };
}

// ============================================
// User Firebase Document
// ============================================

export interface UserFirestore extends FirestoreDocument {
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'chef' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  profileImage?: string;
  
  // Customer-specific fields
  addresses?: {
    id: string;
    governorate: string;
    area: string;
    address: string;
    block?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    isDefault: boolean;
  }[];
  
  // Preferences
  preferredLanguage?: 'ar' | 'en';
  notificationsEnabled?: boolean;
}

// ============================================
// Notification Firebase Document
// ============================================

export interface NotificationFirestore extends FirestoreDocument {
  userId: string;
  type: 'new_order' | 'order_update' | 'chef_approved' | 'chef_rejected' | 'new_review' | 'payment_received';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
}

// ============================================
// Helper Type Converters
// ============================================

/**
 * Convert Firestore Timestamp to ISO string
 */
export function timestampToString(timestamp: Timestamp | undefined): string {
  if (!timestamp) return new Date().toISOString();
  return timestamp.toDate().toISOString();
}

/**
 * Convert ISO string to Firestore Timestamp
 */
export function stringToTimestamp(dateString: string): Timestamp {
  return Timestamp.fromDate(new Date(dateString));
}
