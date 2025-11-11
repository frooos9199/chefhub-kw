// ============================================
// ChefHub - Type Definitions
// ============================================

export type UserRole = 'customer' | 'chef' | 'admin';

export type OrderStatus = 
  | 'pending'       // في الانتظار
  | 'accepted'      // تم القبول
  | 'preparing'     // قيد التحضير
  | 'ready'         // جاهز
  | 'delivered'     // تم التسليم
  | 'cancelled';    // ملغي

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export type ChefStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// ============================================
// المحافظات الكويتية
// ============================================
export const KUWAIT_GOVERNORATES = [
  { id: 'capital', nameEn: 'Al Asimah', nameAr: 'محافظة العاصمة' },
  { id: 'hawalli', nameEn: 'Hawalli', nameAr: 'محافظة حولي' },
  { id: 'farwaniya', nameEn: 'Al Farwaniya', nameAr: 'محافظة الفروانية' },
  { id: 'ahmadi', nameEn: 'Al Ahmadi', nameAr: 'محافظة الأحمدي' },
  { id: 'jahra', nameEn: 'Al Jahra', nameAr: 'محافظة الجهراء' },
  { id: 'mubarak', nameEn: 'Mubarak Al-Kabeer', nameAr: 'محافظة مبارك الكبير' }
] as const;

export type GovernorateId = typeof KUWAIT_GOVERNORATES[number]['id'];

// ============================================
// User Types
// ============================================
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Customer extends User {
  role: 'customer';
  addresses: Address[];
  totalOrders: number;
}

// ============================================
// Chef Types
// ============================================
export interface Chef extends User {
  role: 'chef';
  status: ChefStatus;
  businessName: string;
  specialty: string[];
  bio: string;
  profileImage?: string;
  coverImage?: string;
  kitchenImages: string[];
  license?: string;
  
  // التوصيل
  deliveryGovernorates: GovernorateId[];
  deliveryFees: Record<GovernorateId, number>;
  
  // ساعات العمل
  workingHours?: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  
  // التواصل والإشعارات
  whatsappNumber: string; // رقم الواتساب للطلبات (+965xxxxxxxx)
  receiveEmailNotifications: boolean; // استقبال إشعارات الإيميل
  receiveWhatsAppNotifications: boolean; // استقبال إشعارات الواتساب
  notificationPreferences: {
    newOrder: boolean; // طلب جديد
    orderAccepted: boolean; // تم قبول الطلب
    orderReady: boolean; // الطلب جاهز
    orderDelivered: boolean; // تم التسليم
    orderCancelled: boolean; // الطلب ملغي
    newReview: boolean; // تقييم جديد
    dailySummary: boolean; // ملخص يومي
  };
  
  // الإحصائيات
  rating: number;
  totalRatings: number;
  totalOrders: number;
  totalRevenue: number;
  commission: number; // نسبة العمولة (%)
  
  createdAt: Date;
  approvedAt?: Date;
}

// ============================================
// Dish Types
// ============================================
export interface Dish {
  id: string;
  chefId: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  images: string[];
  category: string;
  isAvailable: boolean;
  preparationTime: number; // بالدقائق
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Special Order Types
// ============================================
export interface SpecialOrder {
  id: string;
  chefId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  images: string[];
  
  // الحد والتوقيت
  maxOrders: number;
  currentOrders: number;
  startDate: Date;
  endDate: Date;
  deliveryDate?: Date;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Order Types
// ============================================
export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Address {
  governorate: GovernorateId;
  area: string;
  block?: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  additionalInfo?: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  
  // الأطراف
  customerId: string;
  customerName: string;
  chefId: string;
  chefName: string;
  
  // العناصر
  items: OrderItem[];
  isSpecialOrder: boolean;
  specialOrderId?: string;
  
  // الأسعار
  subtotal: number;
  deliveryFee: number;
  total: number;
  commission: number;
  chefEarnings: number;
  
  // العنوان
  deliveryAddress: Address;
  
  // الحالة
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  
  // التواريخ
  createdAt: Date;
  acceptedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  // ملاحظات
  customerNotes?: string;
  chefNotes?: string;
  cancellationReason?: string;
}

// ============================================
// Review Types
// ============================================
export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  chefId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  isHidden: boolean;
}

// ============================================
// Invoice Types
// ============================================
export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  pdfUrl?: string;
}

// ============================================
// Notification Types
// ============================================
export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'payment' | 'review' | 'system';
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

// ============================================
// WhatsApp Notification Types
// ============================================
export interface WhatsAppNotification {
  id: string;
  recipientPhone: string; // رقم المستلم (+965xxxxxxxx)
  recipientName: string;
  recipientRole: 'chef' | 'customer' | 'admin';
  
  notificationType: 
    | 'new_order'           // طلب جديد
    | 'order_accepted'      // تم قبول الطلب
    | 'order_preparing'     // قيد التحضير
    | 'order_ready'         // الطلب جاهز
    | 'order_delivered'     // تم التسليم
    | 'order_cancelled'     // الطلب ملغي
    | 'payment_received'    // تم استلام الدفع
    | 'new_review'          // تقييم جديد
    | 'chef_approved'       // تم الموافقة على الشيف
    | 'daily_summary';      // ملخص يومي
  
  orderId?: string;
  orderNumber?: string;
  
  message: string; // الرسالة بالعربي
  messageEn?: string; // الرسالة بالإنجليزي
  
  // بيانات إضافية
  metadata?: {
    chefName?: string;
    customerName?: string;
    totalAmount?: number;
    itemsCount?: number;
    deliveryAddress?: string;
    rating?: number;
  };
  
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  
  createdAt: Date;
}

// ============================================
// Email Notification Types
// ============================================
export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: 'chef' | 'customer' | 'admin';
  
  emailType:
    | 'order_confirmation'     // تأكيد الطلب
    | 'order_status_update'    // تحديث حالة الطلب
    | 'invoice'                // الفاتورة
    | 'chef_registration'      // تسجيل شيف
    | 'chef_approved'          // موافقة على الشيف
    | 'payment_receipt'        // إيصال الدفع
    | 'review_notification'    // إشعار بتقييم
    | 'daily_summary'          // ملخص يومي
    | 'weekly_report';         // تقرير أسبوعي
  
  subject: string;
  htmlContent: string;
  attachments?: {
    filename: string;
    content: string;
    type: string;
  }[];
  
  orderId?: string;
  invoiceId?: string;
  
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  errorMessage?: string;
  
  createdAt: Date;
}

// ============================================
// Analytics Types
// ============================================
export interface ChefAnalytics {
  chefId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalOrders: number;
  totalRevenue: number;
  totalEarnings: number;
  averageRating: number;
  topDishes: { dishId: string; dishName: string; orders: number }[];
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: { date: string; revenue: number }[];
}

export interface PlatformAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  activeChefs: number;
  activeCustomers: number;
  topChefs: { chefId: string; chefName: string; orders: number; revenue: number }[];
  ordersByGovernorate: Record<GovernorateId, number>;
}
