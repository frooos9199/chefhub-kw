# 🍽️ ChefHub - منصة الشيفات في الكويت

<div align="center">

![ChefHub Logo](https://img.shields.io/badge/ChefHub-🇰🇼_Made_in_Kuwait-emerald?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.0-orange?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?style=for-the-badge&logo=tailwind-css)

### منصة تربط الشيفات المميزين في الكويت مع العملاء 🇰🇼

[📱 عرض توضيحي](#) • [📖 التوثيق](#التوثيق) • [🚀 البدء السريع](#البدء-السريع)

</div>

---

## 📋 نظرة عامة

**ChefHub** هي منصة كويتية متكاملة تربط الشيفات المنزليين المميزين مع العملاء عبر جميع المحافظات الكويتية الست. نوفر تجربة سلسة للطلب والتوصيل مع نظام دفع آمن بالدينار الكويتي.

### ✨ المميزات الرئيسية

- 🔐 **نظام مصادقة متقدم** - تسجيل منفصل للعملاء والشيفات والإدارة
- 👨‍🍳 **إدارة الشيفات** - موافقة الإدارة على الشيفات الجدد
- 🍽️ **إدارة الأصناف** - رفع صور متعددة، تصنيفات، أسعار
- 🚀 **طلبات خاصة** - الشيف يفتح عروض محدودة الكمية
- 💳 **دفع آمن** - دعم MyFatoorah/Tap Payments بالدينار الكويتي
- 📧 **إشعارات متعددة** - Email + WhatsApp + In-App
- 🌍 **توصيل لجميع المحافظات** - العاصمة، حولي، الفروانية، الأحمدي، الجهراء، مبارك الكبير
- 📊 **لوحة تحكم شاملة** - للشيفات والأدمن بإحصائيات تفصيلية
- 🌐 **متعدد اللغات** - عربي (RTL) وإنجليزي
- 📱 **متجاوب بالكامل** - Mobile-First Design

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 16** - React Framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS with custom emerald/teal theme
- **Lucide React** - Beautiful icons

### Backend
- **Firebase Auth** - Authentication system
- **Firestore** - NoSQL database
- **Firebase Storage** - Image/file storage
- **Firebase Cloud Functions** - Serverless functions

### Integrations
- **Twilio** - WhatsApp notifications
- **SendGrid/Nodemailer** - Email notifications
- **MyFatoorah/Tap** - Payment gateway (KWD)

---

## 🚀 البدء السريع

### المتطلبات الأساسية

```bash
- Node.js 18+ 
- npm/yarn/pnpm
- حساب Firebase
- حساب Twilio (WhatsApp)
- حساب SendGrid (Email)
```

### التنصيب

1. **استنساخ المشروع**
```bash
git clone https://github.com/yourusername/chefhub.git
cd chefhub
```

2. **تنصيب المكتبات**
```bash
npm install
```

3. **إعداد Firebase**
   - أنشئ مشروع جديد في [Firebase Console](https://console.firebase.google.com)
   - فعّل Authentication (Email/Password)
   - فعّل Firestore Database
   - فعّل Storage
   - انسخ بيانات التكوين

4. **إعداد متغيرات البيئة**
```bash
cp .env.local.example .env.local
```

املأ القيم في `.env.local`:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Email
SENDGRID_API_KEY=your-sendgrid-key

# WhatsApp
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Payment
MYFATOORAH_API_KEY=your-myfatoorah-key

# Admin Secret
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=your-secret-key
```

5. **تشغيل خادم التطوير**
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 هيكل المشروع

```
chefhub/
├── app/                    # Next.js App Router
│   ├── auth/              # صفحات المصادقة
│   │   ├── login/         # تسجيل الدخول
│   │   ├── register/      # التسجيل
│   │   │   ├── customer/  # تسجيل عميل
│   │   │   └── chef/      # تسجيل شيف (3 خطوات)
│   │   └── reset-password/ # استعادة كلمة المرور
│   ├── chef/              # لوحة الشيف
│   ├── admin/             # لوحة الأدمن
│   └── page.tsx           # الصفحة الرئيسية
│
├── components/            # React Components
│   └── ProtectedRoute.tsx # حماية الصفحات
│
├── contexts/              # React Contexts
│   └── AuthContext.tsx    # Context المصادقة
│
├── lib/                   # دوال مساعدة
│   ├── auth.ts            # دوال المصادقة
│   ├── firebase.ts        # تكوين Firebase
│   ├── firestore.ts       # عمليات قاعدة البيانات
│   ├── storage.ts         # إدارة الملفات
│   ├── email.ts           # إرسال الإيميلات
│   ├── whatsapp.ts        # إرسال WhatsApp
│   ├── notifications.ts   # نظام الإشعارات
│   └── utils.ts           # دوال عامة
│
├── types/                 # TypeScript Types
│   └── index.ts           # جميع الأنواع
│
├── docs/                  # التوثيق
│   ├── DATABASE_SCHEMA.md # مخطط قاعدة البيانات
│   └── AUTHENTICATION.md  # توثيق المصادقة
│
├── messages/              # ملفات الترجمة
│   ├── ar.json            # العربية
│   └── en.json            # English
│
├── firestore.rules        # قواعد أمان Firestore
├── storage.rules          # قواعد أمان Storage
└── README.md              # هذا الملف
```

---

## 🎯 حالة التطوير

### ✅ مكتمل (3/30 مرحلة - 10%)

- [x] **المرحلة 1**: إعداد بيئة المشروع
  - Next.js 16 + TypeScript
  - Tailwind CSS + تصميم Emerald/Teal
  - هيكل المجلدات

- [x] **المرحلة 2**: Firebase وقاعدة البيانات
  - تكوين Firebase
  - 12 مجموعة في Firestore
  - دوال CRUD كاملة
  - إدارة الصور والملفات
  - نظام الإشعارات (Email + WhatsApp)

- [x] **المرحلة 3**: نظام المصادقة والتسجيل
  - تسجيل/دخول العملاء ✅
  - تسجيل الشيفات (3 خطوات) ✅
  - تسجيل الأدمن (مفتاح سري) ✅
  - حماية الصفحات (Role-based) ✅
  - إدارة الجلسات ✅
  - رسائل خطأ بالعربي ✅

### 🔄 قيد التطوير (0/27 مرحلة)

- [ ] **المرحلة 4**: تطبيق العملاء - الصفحة الرئيسية
- [ ] **المرحلة 5**: صفحات الشيف والأصناف
- [ ] **المرحلة 6**: نظام السلة والطلبات
- [ ] ... وباقي 24 مرحلة

---

## 🔐 المصادقة والأمان

### أنواع المستخدمين

| النوع | الوصف | الموافقة |
|------|------|---------|
| **عميل** | يطلب الطعام ويقيّم الشيفات | تلقائية |
| **شيف** | يدير أصنافه وطلباته | يحتاج موافقة الأدمن |
| **أدمن** | إدارة كاملة للمنصة | يحتاج مفتاح سري |

---

## 📖 التوثيق

للمزيد من التفاصيل، راجع:

- [📊 مخطط قاعدة البيانات](./docs/DATABASE_SCHEMA.md)
- [🔐 نظام المصادقة](./docs/AUTHENTICATION.md)

---

## 🚧 قريباً

- [ ] لوحة تحكم الشيف الكاملة
- [ ] لوحة تحكم الأدمن
- [ ] نظام الدفع الإلكتروني
- [ ] تطبيق الجوال (React Native)
- [ ] نظام التقييمات والمراجعات
- [ ] الإحصائيات والتقارير

---

## 👨‍💻 المطور

تم تطوير هذا المشروع بواسطة **NexDev**

🌐 [nexdev-kw.com](https://nexdev-kw.com)

---

## 📜 الترخيص

جميع الحقوق محفوظة © 2024 ChefHub Kuwait

---

<div align="center">

### صنع في الكويت بكل فخر 🇰🇼

**ChefHub** - نربط الشيفات المميزين بالعملاء

</div>
