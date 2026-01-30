# 🚀 دليل النشر - ChefHub

## 🌐 الموقع المباشر

**Production URL:** https://chefhub-kw.vercel.app

---

## ✅ تم النشر على Vercel

### معلومات النشر
- **Platform:** Vercel
- **Framework:** Next.js 16
- **Region:** Auto (Closest to Kuwait)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

---

## 🔧 إعداد متغيرات البيئة

### في Vercel Dashboard

1. اذهب إلى: https://vercel.com/your-project/settings/environment-variables
2. أضف المتغيرات التالية:

#### Firebase
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Email (SendGrid)
```
SENDGRID_API_KEY=SG.xxxxx
```

#### WhatsApp (Twilio)
```
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
```

#### Payment (MyFatoorah)
```
MYFATOORAH_API_KEY=xxxxx
```

#### Admin
```
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=your-secret-key
```

---

## 🔥 Firebase Configuration

### 1. Authorized Domains
في Firebase Console → Authentication → Settings → Authorized domains:

أضف:
- ✅ `chefhub-kw.vercel.app`
- ✅ `*.vercel.app` (للـ preview deployments)

### 2. Firestore Indexes
تأكد من نشر الـ indexes:
```bash
firebase deploy --only firestore:indexes
```

### 3. Storage CORS
إذا كنت تستخدم Firebase Storage، أضف CORS:
```json
[
  {
    "origin": ["https://chefhub-kw.vercel.app"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 📱 اختبار بعد النشر

### ✅ Checklist

- [ ] الصفحة الرئيسية تعمل
- [ ] تسجيل الدخول يعمل
- [ ] Firebase متصل
- [ ] الصور تظهر
- [ ] الطلبات تُنشأ
- [ ] الإشعارات تُرسل
- [ ] الدفع يعمل (إذا مفعّل)

### 🧪 اختبار سريع

1. افتح: https://chefhub-kw.vercel.app
2. سجل دخول كعميل
3. أضف منتج للسلة
4. أكمل الطلب
5. سجل دخول كشيف
6. تحقق من وصول الطلب

---

## 🔄 التحديثات التلقائية

### Git Push → Auto Deploy

كل push لـ `main` branch يتم نشره تلقائياً:

```bash
git add .
git commit -m "Update: feature description"
git push origin main
```

Vercel سيقوم بـ:
1. ✅ Build المشروع
2. ✅ Run Tests (إذا موجودة)
3. ✅ Deploy تلقائياً
4. ✅ إرسال إشعار

---

## 🌍 Custom Domain (اختياري)

### إضافة دومين خاص

1. في Vercel Dashboard → Domains
2. أضف: `chefhub.kw` أو `www.chefhub.kw`
3. اتبع التعليمات لتحديث DNS

#### DNS Records
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- **Speed Insights:** مفعّل تلقائياً
- **Web Vitals:** متابعة الأداء
- **Error Tracking:** تتبع الأخطاء

### Firebase Analytics
- **User Behavior:** تتبع المستخدمين
- **Conversion Tracking:** تتبع التحويلات
- **Custom Events:** أحداث مخصصة

---

## 🐛 Troubleshooting

### المشكلة: Build Failed
**الحل:**
```bash
# تأكد من أن المشروع يعمل محلياً
npm run build

# تحقق من الأخطاء
npm run lint
```

### المشكلة: Environment Variables لا تعمل
**الحل:**
1. تأكد من إضافة `NEXT_PUBLIC_` للمتغيرات العامة
2. أعد نشر المشروع بعد إضافة المتغيرات
3. تحقق من Vercel Logs

### المشكلة: Firebase لا يتصل
**الحل:**
1. تحقق من Authorized Domains في Firebase
2. تحقق من Environment Variables في Vercel
3. تحقق من Browser Console للأخطاء

---

## 📞 الدعم

- **Vercel Docs:** https://vercel.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## 🎉 تم النشر بنجاح!

**ChefHub** الآن متاح على الإنترنت 🇰🇼

🔗 https://chefhub-kw.vercel.app
