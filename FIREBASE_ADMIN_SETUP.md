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
- ✅ سيتم حذف بياناته من Firestore (users & chef collections)
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

### خطأ: "DECODER routines::unsupported" (في Vercel)
**السبب:** تنسيق `FIREBASE_PRIVATE_KEY` غير صحيح في Vercel Environment Variables

**الحل:**
1. اذهب إلى Vercel Dashboard → Settings → Environment Variables
2. احذف `FIREBASE_PRIVATE_KEY` الحالي
3. أضف واحد جديد بهذه الطريقة:
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSk...
   (المحتوى كاملاً بدون \n)
   -----END PRIVATE KEY-----
   ```
4. **مهم:** انسخ المفتاح من ملف JSON مع أسطر جديدة فعلية (اضغط Enter)
5. **لا تكتب** `\n` كـ text، اتركها كأسطر جديدة
6. احفظ وأعد نشر الموقع (Redeploy)

**تحقق:**
- في Vercel، عند عرض المتغير، يجب أن ترى عدة أسطر، ليس سطر واحد طويل

### خطأ: "UNAUTHENTICATED: Request had invalid authentication credentials"
**السبب:** المفتاح الخاص (Private Key) غير صحيح أو تالف أو منتهي الصلاحية

**الحل:**

#### الخطوة 1: توليد مفتاح جديد من Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع **chefhub-kw**
3. اذهب إلى **Project Settings** ⚙️ → **Service Accounts**
4. اضغط على **Generate new private key**
5. احفظ ملف JSON الجديد

#### الخطوة 2: نسخ البيانات الصحيحة
من ملف JSON المحمّل، انسخ:
```json
{
  "project_id": "chefhub-kw",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@chefhub-kw.iam.gserviceaccount.com"
}
```

#### الخطوة 3: تحديث Vercel Environment Variables
1. اذهب إلى **Vercel Dashboard** → **Settings** → **Environment Variables**
2. احذف المتغيرات الثلاثة القديمة:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
3. أضف المتغيرات الجديدة:

**FIREBASE_PROJECT_ID:**
```
chefhub-kw
```

**FIREBASE_CLIENT_EMAIL:**
```
firebase-adminsdk-xxxxx@chefhub-kw.iam.gserviceaccount.com
```
*(انسخها من ملف JSON)*

**FIREBASE_PRIVATE_KEY:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
(عدة أسطر)
-----END PRIVATE KEY-----
```

**⚠️ مهم جداً:**
- انسخ المفتاح **بالكامل** من ملف JSON
- استخدم محرر نصوص (Notepad++, VS Code) لفتح ملف JSON
- انسخ قيمة `private_key` بدون علامات التنصيص
- استبدل `\n` بأسطر جديدة فعلية:
  - ابحث عن `\n` واستبدلها بضغطة Enter
  - يجب أن يصبح المفتاح على عدة أسطر

#### الخطوة 4: احفظ وأعد النشر
1. احفظ المتغيرات الجديدة
2. اذهب إلى **Deployments**
3. اضغط على آخر deployment → **Redeploy**
4. انتظر حتى ينتهي النشر

#### الخطوة 5: التحقق
بعد إعادة النشر، جرب حذف شيف مرة أخرى. يجب أن يعمل بنجاح.

**تحقق من Logs:**
- في Vercel، اذهب إلى **Functions** logs
- يجب أن ترى: `✅ Firebase Admin initialized successfully`
- إذا رأيت: `⚠️ Firebase Admin credentials not configured`، فهذا يعني أن المتغيرات غير محملة
