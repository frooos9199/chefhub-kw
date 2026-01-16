# 📧 دليل تفعيل الإشعارات - ChefHub

## 🎯 نظرة عامة

الإشعارات في ChefHub تعمل عبر قناتين:
1. **الإيميل** (SendGrid) - للفواتير والتأكيدات
2. **WhatsApp** (Twilio) - للإشعارات الفورية

---

## 📧 1. تفعيل إشعارات الإيميل (SendGrid)

### ✅ الحالة الحالية:
- ✅ الكود جاهز في `lib/email.ts`
- ⚠️ معطّل (TODO) - يحتاج ربط API

### 🔧 خطوات التفعيل:

#### أ) احصل على SendGrid API Key
اتبع الخطوات في [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md#3-sendgrid)

#### ب) حدّث lib/email.ts

**ابحث عن السطر 18:**
```typescript
// TODO: استخدام SendGrid أو Nodemailer
```

**استبدله بـ:**
```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: to,
  from: process.env.EMAIL_FROM || 'noreply@chefhub.com',
  subject: subject,
  html: htmlContent,
  attachments: attachments
};

await sgMail.send(msg);
return true;
```

#### ج) ثبّت المكتبة:
```bash
npm install @sendgrid/mail
```

#### د) اختبر الإرسال:
```typescript
// في أي صفحة للاختبار
import { sendEmail } from '@/lib/email';

await sendEmail(
  'your-email@example.com',
  'اختبار إيميل',
  '<h1>مرحباً من ChefHub!</h1>'
);
```

---

## 📱 2. تفعيل إشعارات WhatsApp (Twilio)

### ✅ الحالة الحالية:
- ✅ الكود جاهز في `lib/whatsapp.ts`
- ⚠️ معطّل (TODO) - يحتاج ربط API

### 🔧 خطوات التفعيل:

#### أ) احصل على Twilio Credentials
اتبع الخطوات في [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md#4-twilio-whatsapp)

#### ب) حدّث lib/whatsapp.ts

**ابحث عن السطر 17:**
```typescript
// TODO: استخدام WhatsApp Business API أو Twilio
```

**استبدله بـ:**
```typescript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !twilioWhatsAppNumber) {
  console.warn('⚠️ Twilio credentials not configured');
  return false;
}

const client = require('twilio')(accountSid, authToken);

const result = await client.messages.create({
  body: message,
  from: `whatsapp:${twilioWhatsAppNumber}`,
  to: `whatsapp:${phone}`
});

return result.sid ? true : false;
```

#### ج) ثبّت المكتبة:
```bash
npm install twilio
```

#### د) فعّل WhatsApp Sandbox (للتجربة):
1. اذهب إلى [Twilio Console](https://www.twilio.com/console/sms/whatsapp/sandbox)
2. أرسل الكود المطلوب من واتساب إلى الرقم المعروض
3. الآن يمكنك الإرسال لهذا الرقم

---

## 🔄 3. ربط الإشعارات مع نظام الطلبات

### عند إنشاء طلب جديد:

**في `app/checkout/page.tsx`** (السطر ~160):

```typescript
// بعد إنشاء الطلب بنجاح
const { orderId, orderNumber } = await createOrder({...});

// إرسال إشعار للعميل
await sendOrderConfirmationEmail(
  userData.email,
  userData.name,
  orderNumber,
  items,
  total
);

// إرسال إشعار للشيفات
for (const chef of chefs) {
  const chefData = await getChefData(chef.id);
  
  // إيميل
  if (chefData.receiveEmailNotifications) {
    await sendNewOrderNotificationToChef(
      chefData.email,
      chefData.name,
      orderNumber,
      userData.name
    );
  }
  
  // واتساب
  if (chefData.receiveWhatsAppNotifications && chefData.whatsappNumber) {
    await sendWhatsAppOrderNotification(
      chefData.whatsappNumber,
      chefData.name,
      orderNumber,
      userData.name
    );
  }
}
```

---

## 📝 4. أنواع الإشعارات المتاحة

### إشعارات الإيميل (lib/email.ts):

| الوظيفة | الوصف | الاستخدام |
|---------|-------|-----------|
| `sendOrderConfirmationEmail` | تأكيد الطلب للعميل | بعد إنشاء الطلب |
| `sendNewOrderNotificationToChef` | إشعار الشيف بطلب جديد | بعد إنشاء الطلب |
| `sendOrderStatusUpdateEmail` | تحديث حالة الطلب | عند تغيير الحالة |
| `sendOrderDeliveredEmail` | تأكيد التسليم | عند إتمام التوصيل |
| `sendChefApprovalEmail` | موافقة الشيف الجديد | من لوحة الأدمن |
| `sendWeeklySummaryEmail` | ملخص أسبوعي للشيف | كل أسبوع (Cron job) |

### إشعارات WhatsApp (lib/whatsapp.ts):

| الوظيفة | الوصف |
|---------|-------|
| `sendNewOrderNotificationToChef` | طلب جديد للشيف |
| `sendOrderStatusUpdateToCustomer` | تحديث حالة للعميل |
| `sendOrderReadyNotification` | الطلب جاهز للاستلام |
| `sendOrderDeliveredNotification` | تم التسليم |

---

## 🧪 5. اختبار الإشعارات

### اختبار الإيميل:

```typescript
// في Developer Console أو صفحة اختبار
import { sendEmail } from '@/lib/email';

// إيميل بسيط
await sendEmail(
  'test@example.com',
  'اختبار',
  '<h1>هذا اختبار</h1>'
);

// إشعار طلب كامل
import { sendOrderConfirmationEmail } from '@/lib/email';

await sendOrderConfirmationEmail(
  'customer@example.com',
  'أحمد محمد',
  'ORD-123456',
  [...items],
  45.500
);
```

### اختبار WhatsApp:

```typescript
import { sendWhatsAppMessage } from '@/lib/whatsapp';

// رسالة بسيطة
await sendWhatsAppMessage(
  '+96512345678',  // رقمك المفعّل في Twilio Sandbox
  'مرحباً من ChefHub! 🍽️'
);
```

---

## ⚙️ 6. إعدادات الشيفات للإشعارات

كل شيف يمكنه التحكم في تفضيلات الإشعارات من صفحة الإعدادات:

```typescript
// في types/index.ts - Chef interface
notificationPreferences: {
  newOrder: boolean;        // طلب جديد
  orderAccepted: boolean;   // تم قبول الطلب
  orderReady: boolean;      // الطلب جاهز
  orderDelivered: boolean;  // تم التسليم
  orderCancelled: boolean;  // الطلب ملغي
  newReview: boolean;       // تقييم جديد
  dailySummary: boolean;    // ملخص يومي
}
```

---

## 📊 7. Monitoring & Logging

### تتبع نجاح الإرسال:

```typescript
// في lib/notifications.ts (جديد)
export async function logNotification(
  type: 'email' | 'whatsapp',
  recipient: string,
  subject: string,
  success: boolean,
  error?: string
) {
  await addDoc(collection(db, 'notificationLogs'), {
    type,
    recipient,
    subject,
    success,
    error: error || null,
    timestamp: serverTimestamp(),
  });
}
```

### استخدام:

```typescript
try {
  await sendEmail(to, subject, html);
  await logNotification('email', to, subject, true);
} catch (error) {
  await logNotification('email', to, subject, false, error.message);
}
```

---

## 🔐 8. الأمان والخصوصية

### ✅ Best Practices:

1. **لا تُرسل كلمات مرور** في الإشعارات
2. **استخدم Opt-in** - اطلب موافقة المستخدم
3. **احترم التفضيلات** - لا ترسل إذا اختار المستخدم عدم الاستقبال
4. **Rate Limiting** - حدد عدد الرسائل (لتجنب الحظر)
5. **Unsubscribe Link** - أضف رابط إلغاء الاشتراك في الإيميلات

---

## 💰 9. التكاليف المتوقعة

### SendGrid:
- **Free Plan**: 100 إيميل/يوم
- **Essentials**: $19.95/شهر = 50,000 إيميل
- **Pro**: $89.95/شهر = 100,000 إيميل

### Twilio WhatsApp:
- **Sandbox**: مجاني (للتجربة)
- **Production**: ~$0.005/رسالة
  - مثال: 1000 رسالة/شهر = $5
  - 10,000 رسالة/شهر = $50

---

## ✅ Checklist للتفعيل

- [ ] SendGrid API Key مضاف في .env.local
- [ ] Twilio Credentials مضافة في .env.local
- [ ] مكتبة @sendgrid/mail مثبتة
- [ ] مكتبة twilio مثبتة
- [ ] كود TODO في lib/email.ts محدّث
- [ ] كود TODO في lib/whatsapp.ts محدّث
- [ ] اختبار إرسال إيميل ✉️
- [ ] اختبار إرسال WhatsApp 📱
- [ ] ربط الإشعارات مع نظام الطلبات
- [ ] تفعيل Notification Preferences للشيفات

---

## 🚀 Next Steps

بعد تفعيل الإشعارات:
1. إضافة Notification Center (صفحة لعرض جميع الإشعارات)
2. Push Notifications للمتصفح
3. تطبيق موبايل (Flutter/React Native)
4. إشعارات SMS (بديل للواتساب)

---

## 📞 الدعم

إذا واجهت مشاكل:
- SendGrid Docs: https://docs.sendgrid.com
- Twilio WhatsApp Docs: https://www.twilio.com/docs/whatsapp
- GitHub Issues: افتح issue في المشروع

---

**آخر تحديث:** يناير 2026
