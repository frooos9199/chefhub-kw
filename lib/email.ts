// ============================================
// ChefHub - Email Notifications
// ============================================
// يستخدم SendGrid أو Nodemailer

import { EmailNotification } from '@/types';
import { auth } from '@/lib/firebase';

type SendGridClient = {
  setApiKey: (key: string) => void;
  send: (msg: unknown) => Promise<unknown>;
};

type SendGridModule = SendGridClient & {
  default?: SendGridClient;
};

/**
 * إرسال إيميل
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: EmailNotification['attachments']
): Promise<boolean> {
  try {
    // Client-side: send via API route (server will use SendGrid)
    if (typeof window !== 'undefined') {
      const idToken = await auth.currentUser?.getIdToken().catch(() => undefined);

      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(idToken ? { authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ to, subject, htmlContent, attachments }),
      });

      if (!response.ok) {
        const details = await response.text().catch(() => '');
        console.warn('⚠️ Email API call failed:', response.status, details);
        return false;
      }

      const data = (await response.json().catch(() => ({}))) as unknown;
      if (!data || typeof data !== 'object') return false;
      const record = data as Record<string, unknown>;
      return Boolean(record.sent);
    }

    // Server-side: send via SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.log('\n📧 ============ EMAIL NOTIFICATION (DEBUG MODE) ============');
      console.log('📬 To:', to);
      console.log('📌 Subject:', subject);
      console.log('📝 Content Preview:', htmlContent.substring(0, 100) + '...');
      console.log('⏸️  Status: NOT SENT - SENDGRID_API_KEY not configured');
      console.log('============================================================\n');
      return false;
    }

    const sgMailMod = (await import('@sendgrid/mail')) as unknown as SendGridModule;
    const sgMail = sgMailMod.default ?? sgMailMod;
    sgMail.setApiKey(apiKey);

    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@chefhub.com',
      subject,
      html: htmlContent,
      attachments,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * قالب HTML للإيميلات
 */
function getEmailTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f0fdf4;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
      color: #1f2937;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: bold;
    }
    .info-box {
      background-color: #f0fdf4;
      border-right: 4px solid #10b981;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ ChefHub</h1>
      <p>مركز الشيف</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 ChefHub - مركز الشيف • الكويت 🇰🇼</p>
      <p>هذا الإيميل تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * إرسال إيميل تأكيد طلب للعميل
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  chefName: string,
  items: { name: string; quantity: number; price: number }[],
  totalAmount: number,
  deliveryFee: number
): Promise<boolean> {
  const itemsList = items.map(item => 
    `<li>${item.name} × ${item.quantity} - ${item.price.toFixed(3)} د.ك</li>`
  ).join('');

  const content = `
    <h2>مرحباً ${customerName}! 👋</h2>
    <p>شكراً لك على طلبك من ChefHub</p>
    
    <div class="info-box">
      <h3>📋 تفاصيل الطلب</h3>
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      <p><strong>الشيف:</strong> ${chefName}</p>
    </div>
    
    <h3>🛒 الأصناف المطلوبة:</h3>
    <ul>${itemsList}</ul>
    
    <div class="info-box">
      <p><strong>المبلغ الفرعي:</strong> ${(totalAmount - deliveryFee).toFixed(3)} د.ك</p>
      <p><strong>رسوم التوصيل:</strong> ${deliveryFee.toFixed(3)} د.ك</p>
      <h3><strong>الإجمالي:</strong> ${totalAmount.toFixed(3)} د.ك</h3>
    </div>
    
    <p>سيتم إشعارك عند تحديث حالة الطلب</p>
    <p>بالهناء والشفاء! 🍽️</p>
  `;

  const html = getEmailTemplate(content, 'تأكيد طلبك - ChefHub');
  return await sendEmail(customerEmail, `تأكيد طلبك #${orderNumber} - ChefHub`, html);
}

/**
 * إرسال إيميل طلب جديد للشيف
 */
export async function sendNewOrderEmailToChef(
  chefEmail: string,
  chefName: string,
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  items: { name: string; quantity: number }[],
  totalAmount: number,
  deliveryAddress: string
): Promise<boolean> {
  const itemsList = items.map(item => 
    `<li>${item.name} × ${item.quantity}</li>`
  ).join('');

  const content = `
    <h2>مرحباً ${chefName}! 👋</h2>
    <h3>🎉 لديك طلب جديد!</h3>
    
    <div class="info-box">
      <h3>📋 معلومات الطلب</h3>
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      <p><strong>العميل:</strong> ${customerName}</p>
      <p><strong>رقم الجوال:</strong> ${customerPhone}</p>
      <p><strong>المبلغ الإجمالي:</strong> ${totalAmount.toFixed(3)} د.ك</p>
    </div>
    
    <h3>🛒 الأصناف:</h3>
    <ul>${itemsList}</ul>
    
    <div class="info-box">
      <h3>📍 عنوان التوصيل</h3>
      <p>${deliveryAddress}</p>
    </div>
    
    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/chef/orders/${orderNumber}" class="button">
        عرض تفاصيل الطلب
      </a>
    </center>
    
    <p>يرجى الدخول إلى لوحة التحكم لقبول أو رفض الطلب</p>
  `;

  const html = getEmailTemplate(content, 'طلب جديد - ChefHub');
  return await sendEmail(chefEmail, `طلب جديد #${orderNumber} - ChefHub`, html);
}

/**
 * إرسال إيميل تحديث حالة الطلب
 */
export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  chefName: string
): Promise<boolean> {
  const statusMessages: Record<string, { title: string; emoji: string; message: string }> = {
    accepted: {
      title: 'تم قبول طلبك',
      emoji: '✅',
      message: 'الشيف قبل طلبك وبدأ في التحضير'
    },
    preparing: {
      title: 'الشيف يحضر طلبك',
      emoji: '👨‍🍳',
      message: 'طلبك الآن قيد التحضير'
    },
    ready: {
      title: 'طلبك جاهز',
      emoji: '✅',
      message: 'طلبك جاهز للاستلام أو التوصيل'
    },
    delivered: {
      title: 'تم التسليم',
      emoji: '🎉',
      message: 'تم تسليم طلبك بنجاح. بالهناء والشفاء!'
    },
    cancelled: {
      title: 'تم إلغاء الطلب',
      emoji: '❌',
      message: 'تم إلغاء طلبك. نأسف للإزعاج'
    }
  };

  const statusInfo = statusMessages[status] || statusMessages.accepted;

  const content = `
    <h2>مرحباً ${customerName}! 👋</h2>
    <h3>${statusInfo.emoji} ${statusInfo.title}</h3>
    
    <div class="info-box">
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      <p><strong>الشيف:</strong> ${chefName}</p>
      <p><strong>الحالة:</strong> ${statusInfo.message}</p>
    </div>
    
    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" class="button">
        عرض تفاصيل الطلب
      </a>
    </center>
  `;

  const html = getEmailTemplate(content, `${statusInfo.title} - ChefHub`);
  return await sendEmail(customerEmail, `${statusInfo.title} #${orderNumber} - ChefHub`, html);
}

/**
 * إرسال إيميل الفاتورة
 */
export async function sendInvoiceEmail(
  recipientEmail: string,
  recipientName: string,
  orderNumber: string,
  invoiceNumber: string,
  pdfAttachment?: { content: string; filename: string }
): Promise<boolean> {
  const content = `
    <h2>مرحباً ${recipientName}! 👋</h2>
    <h3>🧾 فاتورتك جاهزة</h3>
    
    <div class="info-box">
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      <p><strong>رقم الفاتورة:</strong> ${invoiceNumber}</p>
    </div>
    
    <p>تجد في المرفقات فاتورتك بصيغة PDF</p>
    <p>شكراً لاختيارك ChefHub! 🙏</p>
  `;

  const html = getEmailTemplate(content, 'فاتورتك - ChefHub');
  
  const attachments = pdfAttachment ? [{
    filename: pdfAttachment.filename,
    content: pdfAttachment.content,
    type: 'application/pdf'
  }] : undefined;

  return await sendEmail(recipientEmail, `فاتورة #${invoiceNumber} - ChefHub`, html, attachments);
}

/**
 * إرسال إيميل موافقة على تسجيل الشيف
 */
export async function sendChefApprovalEmail(
  chefEmail: string,
  chefName: string
): Promise<boolean> {
  const content = `
    <h2>مرحباً ${chefName}! 👋</h2>
    <h3>🎉 مبروك! تم قبولك في ChefHub</h3>
    
    <p>نبارك لك الموافقة على تسجيلك كشيف في منصة ChefHub</p>
    
    <div class="info-box">
      <h4>يمكنك الآن:</h4>
      <ul>
        <li>✅ إضافة أصنافك المميزة</li>
        <li>✅ استقبال الطلبات من العملاء</li>
        <li>✅ إدارة مطبخك الخاص</li>
        <li>✅ بناء قاعدة عملائك</li>
      </ul>
    </div>
    
    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/chef/dashboard" class="button">
        ابدأ الآن
      </a>
    </center>
    
    <p>نتمنى لك التوفيق والنجاح! 🚀</p>
  `;

  const html = getEmailTemplate(content, 'مبروك! تم قبولك - ChefHub');
  return await sendEmail(chefEmail, 'تم الموافقة على تسجيلك - ChefHub', html);
}

/**
 * إرسال ملخص يومي للشيف
 */
export async function sendDailySummaryEmail(
  chefEmail: string,
  chefName: string,
  data: {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    newReviews: number;
    avgRating: number;
  }
): Promise<boolean> {
  const content = `
    <h2>مرحباً ${chefName}! 👋</h2>
    <h3>📊 ملخصك اليومي</h3>
    
    <p><strong>التاريخ:</strong> ${data.date}</p>
    
    <div class="info-box">
      <h4>📈 الإحصائيات:</h4>
      <ul>
        <li>📦 إجمالي الطلبات: ${data.totalOrders}</li>
        <li>✅ طلبات مكتملة: ${data.completedOrders}</li>
        <li>⏳ طلبات معلقة: ${data.pendingOrders}</li>
        <li>💰 المبيعات: ${data.totalRevenue.toFixed(3)} د.ك</li>
        <li>⭐ تقييمات جديدة: ${data.newReviews}</li>
        <li>📊 متوسط التقييم: ${data.avgRating.toFixed(1)}/5</li>
      </ul>
    </div>
    
    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/chef/analytics" class="button">
        عرض التقارير التفصيلية
      </a>
    </center>
    
    <p>استمر في العمل الرائع! 💪</p>
  `;

  const html = getEmailTemplate(content, 'ملخصك اليومي - ChefHub');
  return await sendEmail(chefEmail, `ملخصك اليومي ${data.date} - ChefHub`, html);
}
