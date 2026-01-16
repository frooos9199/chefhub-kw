# 🔐 دليل متغيرات البيئة - ChefHub

هذا الدليل يوضح كيفية الحصول على جميع المفاتيح السرية المطلوبة للمشروع.

---

## 📋 جدول المحتويات

1. [Firebase Configuration](#1-firebase-configuration)
2. [Firebase Admin SDK](#2-firebase-admin-sdk)
3. [SendGrid (إرسال الإيميلات)](#3-sendgrid)
4. [Twilio (إشعارات WhatsApp)](#4-twilio-whatsapp)
5. [MyFatoorah (بوابة الدفع)](#5-myfatoorah)
6. [إعدادات التطبيق](#6-app-configuration)

---

## 1. Firebase Configuration

### الخطوات:

1. **افتح [Firebase Console](https://console.firebase.google.com/)**

2. **اختر مشروعك** (أو أنشئ مشروع جديد)

3. **اذهب إلى Project Settings** (⚙️ أيقونة الترس)

4. **في قسم "Your apps"، اختر Web app** (أو أنشئ تطبيق ويب جديد)

5. **انسخ Firebase Config:**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // ← انسخ هذا إلى NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc",
  measurementId: "G-XXXXXX"
};
```

### في .env.local:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chefhub-kw.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chefhub-kw
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chefhub-kw.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=589679887037
NEXT_PUBLIC_FIREBASE_APP_ID=1:589679887037:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-8H4XYT5GMB
```

---

## 2. Firebase Admin SDK

**مطلوب لحذف المستخدمين من Authentication (Server-side)**

### الخطوات:

1. **في Firebase Console → Project Settings**

2. **اختر تبويب "Service accounts"**

3. **اضغط "Generate new private key"**

4. **سيتم تنزيل ملف JSON**

5. **افتح الملف وانسخ القيم:**

```json
{
  "project_id": "chefhub-kw",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@chefhub-kw.iam.gserviceaccount.com"
}
```

### في .env.local:

```env
FIREBASE_PROJECT_ID=chefhub-kw
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chefhub-kw.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Full-Key-Here\n-----END PRIVATE KEY-----\n"
```

⚠️ **مهم:** احتفظ بـ `\n` في المفتاح الخاص!

---

## 3. SendGrid

**لإرسال الإيميلات (إشعارات الطلبات، الفواتير، إلخ)**

### الخطوات:

1. **سجل في [SendGrid.com](https://signup.sendgrid.com/)**

2. **بعد التسجيل، اذهب إلى Settings → API Keys**

3. **اضغط "Create API Key"**

4. **اختر "Full Access" أو "Restricted Access"**
   - إذا اخترت Restricted، فعّل:
     - Mail Send: Full Access
     - Template Engine: Read Access

5. **انسخ الـ API Key** (يظهر مرة واحدة فقط!)

### في .env.local:

```env
EMAIL_FROM=noreply@chefhub.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### التحقق من البريد الإلكتروني:

- في SendGrid → Settings → Sender Authentication
- أضف وتحقق من إيميلك (أو Domain إذا كان لديك)

---

## 4. Twilio (WhatsApp)

**لإرسال إشعارات WhatsApp للشيفات والعملاء**

### الخيار 1: Twilio Sandbox (للتجربة مجاناً)

1. **سجل في [Twilio.com](https://www.twilio.com/try-twilio)**

2. **اذهب إلى Console → Messaging → Try it out → Send a WhatsApp message**

3. **اتبع الخطوات:**
   - أرسل رمز التفعيل إلى رقم Twilio من واتساب
   - سيصبح لديك إمكانية الإرسال

4. **احصل على البيانات:**
   - Account SID: من Dashboard الرئيسي
   - Auth Token: من Dashboard (اضغط "Show" بجانبه)
   - WhatsApp Number: `+14155238886` (للـ Sandbox)

### الخيار 2: Twilio Production (للإنتاج)

- يحتاج تقديم طلب لـ WhatsApp Business API
- التكلفة: حوالي 0.005$ لكل رسالة

### في .env.local:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## 5. MyFatoorah

**بوابة الدفع الكويتية (KNET, Visa, Mastercard)**

### الخطوات:

1. **تواصل مع MyFatoorah:**
   - الموقع: [https://myfatoorah.com](https://myfatoorah.com)
   - البريد: [sales@myfatoorah.com](mailto:sales@myfatoorah.com)
   - الهاتف: +965 22060110

2. **املأ نموذج التسجيل:**
   - معلومات الشركة
   - السجل التجاري
   - بيانات البنك

3. **بعد الموافقة، ستحصل على:**
   - Test API Key (للتجربة)
   - Live API Key (للإنتاج)

4. **اذهب إلى [MyFatoorah Portal](https://portal.myfatoorah.com)**
   - Settings → API Keys
   - انسخ الـ API Key

### في .env.local:

```env
MYFATOORAH_API_KEY=your-api-key-here
MYFATOORAH_MODE=test
```

⚠️ للإنتاج: غيّر إلى `MYFATOORAH_MODE=live`

### بدائل MyFatoorah:

- **Tap Payments**: [https://www.tap.company](https://www.tap.company)
- **PayTabs**: [https://www.paytabs.com](https://www.paytabs.com)

---

## 6. App Configuration

### إعدادات عامة:

```env
# رابط التطبيق
NEXT_PUBLIC_APP_URL=http://localhost:3000
# للإنتاج: https://chefhub-kw.vercel.app

# نسبة العمولة الافتراضية (%)
NEXT_PUBLIC_DEFAULT_COMMISSION=10

# مفتاح تسجيل الأدمن (غيّره لمفتاح عشوائي آمن!)
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=your-super-secret-admin-key-12345
```

### توليد مفتاح آمن للأدمن:

```bash
# في Terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 ملف .env.local النهائي

```env
# ============================================
# Firebase Configuration
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chefhub-kw.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chefhub-kw
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chefhub-kw.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=589679887037
NEXT_PUBLIC_FIREBASE_APP_ID=1:589679887037:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-8H4XYT5GMB

# ============================================
# Firebase Admin (Server-side)
# ============================================
FIREBASE_PROJECT_ID=chefhub-kw
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chefhub-kw.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ============================================
# Email Configuration (SendGrid)
# ============================================
EMAIL_FROM=noreply@chefhub.com
SENDGRID_API_KEY=SG.xxx...

# ============================================
# WhatsApp Configuration (Twilio)
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886

# ============================================
# Payment Gateway (MyFatoorah)
# ============================================
MYFATOORAH_API_KEY=your-api-key-here
MYFATOORAH_MODE=test

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_COMMISSION=10
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=change-this-to-secure-random-key
```

---

## ✅ Checklist للتحقق

- [ ] Firebase Config مضاف
- [ ] Firebase Admin SDK مضاف
- [ ] SendGrid API Key مضاف والبريد متحقق منه
- [ ] Twilio WhatsApp مفعّل (على الأقل Sandbox)
- [ ] MyFatoorah API Key (اختياري - يمكن تركه معلق)
- [ ] App URL محدث
- [ ] Admin Key تم تغييره لمفتاح آمن

---

## 🔒 ملاحظات أمنية

1. ⚠️ **لا تشارك ملف .env.local أبداً**
2. ⚠️ **لا ترفع .env.local على Git** (محمي بالفعل في .gitignore)
3. ⚠️ **في الإنتاج**: استخدم Vercel Environment Variables
4. ⚠️ **غيّر ADMIN_REGISTRATION_KEY** لمفتاح عشوائي طويل
5. ⚠️ **احتفظ بنسخة احتياطية** من المفاتيح في مكان آمن

---

## 🚀 للنشر على Vercel

1. اذهب إلى Vercel Dashboard → Project Settings → Environment Variables
2. أضف كل المتغيرات واحداً تلو الآخر
3. تأكد من اختيار البيئة المناسبة (Production/Preview/Development)
4. أعد نشر المشروع لتطبيق التغييرات

---

## 📞 المساعدة

إذا واجهت مشاكل:
- Firebase: [Firebase Support](https://firebase.google.com/support)
- SendGrid: [SendGrid Support](https://support.sendgrid.com)
- Twilio: [Twilio Support](https://www.twilio.com/help/contact)
- MyFatoorah: +965 22060110

---

**آخر تحديث:** يناير 2026
