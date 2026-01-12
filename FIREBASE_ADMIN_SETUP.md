# Firebase Admin Setup for User Deletion

## الغرض
تمكين حذف المستخدمين من Firebase Authentication عند حذفهم من لوحة الأدمن، بحيث يمكنهم التسجيل مرة أخرى بنفس البريد الإلكتروني.

## الخطوات المطلوبة

### 1. الحصول على Private Key من Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `chefhub-kw`
3. اذهب إلى **Project Settings** ⚙️ > **Service Accounts**
4. اضغط على **Generate new private key**
5. سيتم تنزيل ملف JSON (مثال: `chefhub-kw-firebase-adminsdk-xxxxx.json`)

### 2. إضافة Private Key إلى .env.local

افتح ملف `.env.local` وأضف المتغيرات التالية:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=chefhub-kw
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-dmzxm@chefhub-kw.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
<انسخ المفتاح الخاص من الملف الذي تم تنزيله>
-----END PRIVATE KEY-----"
```

**مهم جداً:**
- يجب أن يكون المفتاح الخاص بين علامات اقتباس مزدوجة
- احتفظ بـ `\n` في السطور الجديدة (Next.js سيحولها تلقائياً)
- يمكنك نسخ المفتاح من حقل `private_key` في ملف JSON الذي تم تنزيله

### 3. مثال على الملف المحمّل

```json
{
  "type": "service_account",
  "project_id": "chefhub-kw",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...(سطور طويلة)...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-dmzxm@chefhub-kw.iam.gserviceaccount.com",
  ...
}
```

انسخ قيمة `private_key` بالكامل وضعها في متغير `FIREBASE_PRIVATE_KEY`

### 4. إعادة تشغيل السيرفر

بعد إضافة المتغيرات:
```bash
npm run dev
```

## الاستخدام

الآن عند حذف شيف من لوحة الأدمن:
- ✅ سيتم حذفه من Firebase Authentication
- ✅ سيتم حذف بياناته من Firestore (users & chefs collections)
- ✅ يمكنه التسجيل مرة أخرى بنفس البريد الإلكتروني

## الأمان

⚠️ **تحذير:** 
- لا تشارك ملف Private Key أو تضعه في Git
- ملف `.env.local` مستثنى من Git تلقائياً
- في Vercel، أضف المتغيرات في **Settings** > **Environment Variables**

## استكشاف الأخطاء

### خطأ: "Error initializing Firebase Admin"
- تأكد من صحة قيمة `FIREBASE_PRIVATE_KEY`
- تأكد من وجود `\n` في السطور الجديدة
- تأكد من وجود علامات الاقتباس المزدوجة

### خطأ: "auth/user-not-found"
- هذا طبيعي إذا كان المستخدم محذوفاً مسبقاً من Auth
- النظام سيتجاهل هذا الخطأ ويكمل الحذف من Firestore

### خطأ: "Unauthorized: Admin access required"
- تأكد أن المستخدم الذي يحذف لديه `role: 'admin'` في Firestore
