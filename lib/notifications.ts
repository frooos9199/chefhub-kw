// ============================================
// ChefHub - Notification Service
// ============================================
// خدمة موحدة لإرسال الإشعارات عبر قنوات متعددة

import { 
  sendNewOrderNotificationToChef,
  sendOrderStatusUpdateToCustomer,
  sendInvoiceViaWhatsApp,
  sendDailySummaryToChef as sendDailySummaryWhatsApp,
  sendChefApprovalNotification,
  sendNewReviewNotificationToChef
} from './whatsapp';

import {
  sendOrderConfirmationEmail,
  sendNewOrderEmailToChef,
  sendOrderStatusUpdateEmail,
  sendInvoiceEmail,
  sendChefApprovalEmail,
  sendDailySummaryEmail
} from './email';

import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

/**
 * إرسال إشعارات عند طلب جديد
 */
export async function notifyNewOrder(params: {
  // بيانات الشيف
  chefId: string;
  chefName: string;
  chefEmail: string;
  chefWhatsApp: string;
  chefPreferences: {
    receiveEmailNotifications: boolean;
    receiveWhatsAppNotifications: boolean;
    newOrder: boolean;
  };
  
  // بيانات الطلب
  orderId: string;
  orderNumber: string;
  
  // بيانات العميل
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // تفاصيل الطلب
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: string;
}) {
  const { 
    chefEmail, chefWhatsApp, chefName, chefPreferences,
    customerName, customerEmail, customerPhone,
    orderNumber, items, totalAmount, deliveryFee, deliveryAddress
  } = params;

  const promises: Promise<any>[] = [];

  // إشعار الشيف
  if (chefPreferences.newOrder) {
    // واتساب
    if (chefPreferences.receiveWhatsAppNotifications && chefWhatsApp) {
      promises.push(
        sendNewOrderNotificationToChef(
          chefWhatsApp,
          chefName,
          orderNumber,
          customerName,
          totalAmount,
          items.length
        )
      );
    }

    // إيميل
    if (chefPreferences.receiveEmailNotifications && chefEmail) {
      promises.push(
        sendNewOrderEmailToChef(
          chefEmail,
          chefName,
          orderNumber,
          customerName,
          customerPhone,
          items.map(i => ({ name: i.name, quantity: i.quantity })),
          totalAmount,
          deliveryAddress
        )
      );
    }
  }

  // إشعار العميل (تأكيد الطلب)
  promises.push(
    sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      orderNumber,
      chefName,
      items,
      totalAmount,
      deliveryFee
    )
  );

  // حفظ في قاعدة البيانات
  promises.push(
    addDoc(collection(db, 'notifications'), {
      userId: params.chefId,
      type: 'order',
      titleAr: 'طلب جديد',
      titleEn: 'New Order',
      messageAr: `لديك طلب جديد من ${customerName}`,
      messageEn: `You have a new order from ${customerName}`,
      isRead: false,
      link: `/chef/orders/${orderNumber}`,
      createdAt: new Date()
    })
  );

  await Promise.allSettled(promises);
}

/**
 * إرسال إشعارات عند تحديث حالة الطلب
 */
export async function notifyOrderStatusUpdate(params: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  orderNumber: string;
  status: string;
  
  chefName: string;
}) {
  const { customerEmail, customerPhone, customerName, orderNumber, status, chefName } = params;

  const promises: Promise<any>[] = [];

  // إيميل للعميل
  promises.push(
    sendOrderStatusUpdateEmail(
      customerEmail,
      customerName,
      orderNumber,
      status,
      chefName
    )
  );

  // واتساب للعميل
  promises.push(
    sendOrderStatusUpdateToCustomer(
      customerPhone,
      customerName,
      orderNumber,
      status,
      chefName
    )
  );

  // حفظ في قاعدة البيانات
  promises.push(
    addDoc(collection(db, 'notifications'), {
      userId: params.customerId,
      type: 'order',
      titleAr: 'تحديث حالة الطلب',
      titleEn: 'Order Status Update',
      messageAr: `تم تحديث حالة طلبك #${orderNumber}`,
      messageEn: `Your order #${orderNumber} status has been updated`,
      isRead: false,
      link: `/orders/${orderNumber}`,
      createdAt: new Date()
    })
  );

  await Promise.allSettled(promises);
}

/**
 * إرسال الفاتورة
 */
export async function notifySendInvoice(params: {
  recipientEmail: string;
  recipientPhone: string;
  recipientName: string;
  
  orderNumber: string;
  invoiceNumber: string;
  totalAmount: number;
  
  pdfUrl?: string;
  pdfAttachment?: { content: string; filename: string };
}) {
  const { 
    recipientEmail, recipientPhone, recipientName,
    orderNumber, invoiceNumber, totalAmount,
    pdfUrl, pdfAttachment
  } = params;

  const promises: Promise<any>[] = [];

  // إيميل
  promises.push(
    sendInvoiceEmail(
      recipientEmail,
      recipientName,
      orderNumber,
      invoiceNumber,
      pdfAttachment
    )
  );

  // واتساب
  promises.push(
    sendInvoiceViaWhatsApp(
      recipientPhone,
      recipientName,
      orderNumber,
      invoiceNumber,
      totalAmount,
      pdfUrl
    )
  );

  await Promise.allSettled(promises);
}

/**
 * إرسال إشعار موافقة على الشيف
 */
export async function notifyChefApproval(params: {
  chefId: string;
  chefName: string;
  chefEmail: string;
  chefWhatsApp: string;
}) {
  const { chefId, chefName, chefEmail, chefWhatsApp } = params;

  const promises: Promise<any>[] = [];

  // إيميل
  promises.push(sendChefApprovalEmail(chefEmail, chefName));

  // واتساب
  if (chefWhatsApp) {
    promises.push(sendChefApprovalNotification(chefWhatsApp, chefName));
  }

  // حفظ في قاعدة البيانات
  promises.push(
    addDoc(collection(db, 'notifications'), {
      userId: chefId,
      type: 'system',
      titleAr: 'تم قبولك!',
      titleEn: 'You\'re Approved!',
      messageAr: 'مبروك! تم الموافقة على تسجيلك كشيف في ChefHub',
      messageEn: 'Congratulations! Your chef registration has been approved',
      isRead: false,
      link: '/chef/dashboard',
      createdAt: new Date()
    })
  );

  await Promise.allSettled(promises);
}

/**
 * إرسال إشعار تقييم جديد للشيف
 */
export async function notifyNewReview(params: {
  chefId: string;
  chefName: string;
  chefEmail: string;
  chefWhatsApp: string;
  chefPreferences: {
    receiveEmailNotifications: boolean;
    receiveWhatsAppNotifications: boolean;
    newReview: boolean;
  };
  
  customerName: string;
  rating: number;
  comment?: string;
}) {
  const { 
    chefId, chefName, chefWhatsApp, chefPreferences,
    customerName, rating, comment
  } = params;

  if (!chefPreferences.newReview) return;

  const promises: Promise<any>[] = [];

  // واتساب
  if (chefPreferences.receiveWhatsAppNotifications && chefWhatsApp) {
    promises.push(
      sendNewReviewNotificationToChef(
        chefWhatsApp,
        chefName,
        customerName,
        rating,
        comment
      )
    );
  }

  // حفظ في قاعدة البيانات
  const stars = '⭐'.repeat(rating);
  promises.push(
    addDoc(collection(db, 'notifications'), {
      userId: chefId,
      type: 'review',
      titleAr: 'تقييم جديد',
      titleEn: 'New Review',
      messageAr: `${customerName} قيّمك بـ ${stars}`,
      messageEn: `${customerName} rated you ${stars}`,
      isRead: false,
      link: '/chef/reviews',
      createdAt: new Date()
    })
  );

  await Promise.allSettled(promises);
}

/**
 * إرسال ملخص يومي للشيف
 */
export async function notifyDailySummary(params: {
  chefName: string;
  chefEmail: string;
  chefWhatsApp: string;
  chefPreferences: {
    receiveEmailNotifications: boolean;
    receiveWhatsAppNotifications: boolean;
    dailySummary: boolean;
  };
  
  data: {
    date: string;
    totalOrders: number;
    todayOrders: number;
    todayRevenue: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    newReviews: number;
    avgRating: number;
  };
}) {
  const { chefName, chefEmail, chefWhatsApp, chefPreferences, data } = params;

  if (!chefPreferences.dailySummary) return;

  const promises: Promise<any>[] = [];

  // واتساب
  if (chefPreferences.receiveWhatsAppNotifications && chefWhatsApp) {
    promises.push(
      sendDailySummaryWhatsApp(chefWhatsApp, chefName, {
        todayOrders: data.todayOrders,
        todayRevenue: data.todayRevenue,
        pendingOrders: data.pendingOrders,
        newReviews: data.newReviews,
        avgRating: data.avgRating
      })
    );
  }

  // إيميل
  if (chefPreferences.receiveEmailNotifications && chefEmail) {
    promises.push(
      sendDailySummaryEmail(chefEmail, chefName, data)
    );
  }

  await Promise.allSettled(promises);
}
