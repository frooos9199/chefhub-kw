// ============================================
// ChefHub - WhatsApp Notifications
// ============================================
// يستخدم WhatsApp Business API أو خدمة مثل Twilio/Vonage

import { WhatsAppNotification } from '@/types';

/**
 * إرسال رسالة واتساب
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  metadata?: WhatsAppNotification['metadata']
): Promise<boolean> {
  try {
    // التحقق من إعدادات Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      console.warn('⚠️ Twilio credentials not configured. WhatsApp not sent.');
      console.log('📱 WhatsApp (DEBUG):', { phone, message, metadata });
      return false;
    }

    // استخدام Twilio
    const client = require('twilio')(accountSid, authToken);
    
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${phone}`
    });
    
    console.log('✅ WhatsApp sent successfully to:', phone, '| SID:', result.sid);
    return result.sid ? true : false;
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    return false;
  }
}

/**
 * إرسال إشعار طلب جديد للشيف
 */
export async function sendNewOrderNotificationToChef(
  chefPhone: string,
  chefName: string,
  orderNumber: string,
  customerName: string,
  totalAmount: number,
  itemsCount: number
): Promise<boolean> {
  const message = `
🎉 *طلب جديد - ChefHub*

مرحباً ${chefName}! 👋

لديك طلب جديد:
🔢 رقم الطلب: *${orderNumber}*
👤 العميل: ${customerName}
📦 عدد الأصناف: ${itemsCount}
💰 المبلغ الإجمالي: ${totalAmount.toFixed(3)} د.ك

يرجى الدخول إلى لوحة التحكم لقبول الطلب.

---
ChefHub - مركز الشيفات 🇰🇼
  `.trim();

  return await sendWhatsAppMessage(chefPhone, message, {
    chefName,
    customerName,
    totalAmount,
    itemsCount,
  });
}

/**
 * إرسال إشعار تحديث حالة الطلب للعميل
 */
export async function sendOrderStatusUpdateToCustomer(
  customerPhone: string,
  customerName: string,
  orderNumber: string,
  status: string,
  chefName: string
): Promise<boolean> {
  const statusMessages: Record<string, string> = {
    accepted: '✅ تم قبول طلبك',
    preparing: '👨‍🍳 الشيف يحضر طلبك الآن',
    ready: '✅ طلبك جاهز للاستلام',
    delivered: '🎉 تم تسليم طلبك بنجاح',
    cancelled: '❌ تم إلغاء الطلب',
  };

  const message = `
${statusMessages[status] || 'تحديث الطلب'} - ChefHub

مرحباً ${customerName}! 👋

${statusMessages[status]}
🔢 رقم الطلب: *${orderNumber}*
👨‍🍳 الشيف: ${chefName}

---
ChefHub - مركز الشيفات 🇰🇼
  `.trim();

  return await sendWhatsAppMessage(customerPhone, message, {
    customerName,
    chefName,
  });
}

/**
 * إرسال الفاتورة عبر الواتساب
 */
export async function sendInvoiceViaWhatsApp(
  phone: string,
  recipientName: string,
  orderNumber: string,
  invoiceNumber: string,
  totalAmount: number,
  pdfUrl?: string
): Promise<boolean> {
  const message = `
🧾 *فاتورتك - ChefHub*

مرحباً ${recipientName}! 👋

تفاصيل الفاتورة:
🔢 رقم الطلب: *${orderNumber}*
📄 رقم الفاتورة: *${invoiceNumber}*
💰 المبلغ الإجمالي: ${totalAmount.toFixed(3)} د.ك

${pdfUrl ? `📥 تحميل الفاتورة: ${pdfUrl}` : ''}

شكراً لاختيارك ChefHub! 🙏

---
ChefHub - مركز الشيفات 🇰🇼
  `.trim();

  return await sendWhatsAppMessage(phone, message);
}

/**
 * إرسال ملخص يومي للشيف
 */
export async function sendDailySummaryToChef(
  chefPhone: string,
  chefName: string,
  data: {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    newReviews: number;
    avgRating: number;
  }
): Promise<boolean> {
  const message = `
📊 *ملخصك اليومي - ChefHub*

مرحباً ${chefName}! 👋

📅 ملخص اليوم:
📦 الطلبات: ${data.todayOrders}
💰 المبيعات: ${data.todayRevenue.toFixed(3)} د.ك
⏳ طلبات معلقة: ${data.pendingOrders}
⭐ تقييمات جديدة: ${data.newReviews}
📊 متوسط التقييم: ${data.avgRating.toFixed(1)}/5

استمر في العمل الرائع! 💪

---
ChefHub - مركز الشيفات 🇰🇼
  `.trim();

  return await sendWhatsAppMessage(chefPhone, message);
}

/**
 * إرسال إشعار موافقة على تسجيل الشيف
 */
export async function sendChefApprovalNotification(
  chefPhone: string,
  chefName: string
): Promise<boolean> {
  const message = `
🎉 *مبروك! تم قبولك - ChefHub*

مرحباً ${chefName}! 👋

نبارك لك! ✨
تم الموافقة على تسجيلك كشيف في ChefHub 🎊

يمكنك الآن:
✅ إضافة أصنافك
✅ استقبال الطلبات
✅ بناء قاعدة عملائك

ابدأ الآن وحقق أحلامك! 🚀

---
ChefHub - مركز الشيفات 🇰🇼
  `.trim();

  return await sendWhatsAppMessage(chefPhone, message);
}

/**
 * إرسال إشعار تقييم جديد للشيف
 */
export async function sendNewReviewNotificationToChef(
  chefPhone: string,
  chefName: string,
  customerName: string,
  rating: number,
  comment?: string
): Promise<boolean> {
  const stars = '⭐'.repeat(rating);
  
  const message = `
⭐ *تقييم جديد - ChefHub*

مرحباً ${chefName}! 👋

لديك تقييم جديد من ${customerName}:

${stars} (${rating}/5)
${comment ? `\n💬 "${comment}"` : ''}

استمر في تقديم الأفضل! 💪

---
ChefHub - مركز الشيفات 🇰🇼
  `.trim();

  return await sendWhatsAppMessage(chefPhone, message, {
    customerName,
    rating,
  });
}

/**
 * تنسيق رقم الهاتف الكويتي
 */
export function formatKuwaitPhoneForWhatsApp(phone: string): string {
  // إزالة المسافات والرموز
  let cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  // إضافة +965 إذا لم يكن موجوداً
  if (!cleaned.startsWith('+965')) {
    if (cleaned.startsWith('965')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('00965')) {
      cleaned = '+' + cleaned.substring(2);
    } else {
      cleaned = '+965' + cleaned;
    }
  }
  
  return cleaned;
}

/**
 * التحقق من صحة رقم واتساب كويتي
 */
export function isValidKuwaitWhatsApp(phone: string): boolean {
  const formatted = formatKuwaitPhoneForWhatsApp(phone);
  // الرقم الكويتي: +965 متبوعاً بـ 8 أرقام تبدأ بـ 2, 4, 5, أو 6
  const regex = /^\+965[2456]\d{7}$/;
  return regex.test(formatted);
}
