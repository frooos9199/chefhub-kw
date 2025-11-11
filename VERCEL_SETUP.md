# 🔧 Vercel Environment Variables Setup

## ⚠️ مهم جداً!

لازم تضيف هذه المتغيرات في Vercel Dashboard حتى يشتغل المشروع:

## 📍 الخطوات:

1. اذهب إلى: https://vercel.com/frooos9199/chefhub-kw/settings/environment-variables

2. أضف كل متغير من القائمة أدناه:

---

## 🔑 Environment Variables المطلوبة:

### Firebase Configuration (إلزامي)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsseQvbkThQSzaQZ5ctKaZyxbFVDj1v8E
```

```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chefhub-kw.firebaseapp.com
```

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chefhub-kw
```

```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chefhub-kw.firebasestorage.app
```

```env
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=589679887037
```

```env
NEXT_PUBLIC_FIREBASE_APP_ID=1:589679887037:web:910460e00ed5aff7abedd4
```

```env
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-8H4XYT5GMB
```

### App Configuration (إلزامي)

```env
NEXT_PUBLIC_APP_URL=https://chefhub-kw.vercel.app
```

```env
NEXT_PUBLIC_DEFAULT_COMMISSION=10
```

```env
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=your-super-secret-admin-key-change-this
```

---

## 📝 ملاحظات:

1. **كل متغير** يُضاف في سطر منفصل
2. اختر **Production** و **Preview** و **Development** لكل متغير
3. بعد الإضافة، اضغط **"Redeploy"** في صفحة Deployments

---

## 🚀 بعد الإضافة:

1. اذهب إلى: https://vercel.com/frooos9199/chefhub-kw/deployments
2. اضغط على آخر deployment
3. اضغط **"Redeploy"**
4. انتظر حتى ينتهي البناء

---

## ✅ تأكيد نجاح الإعداد:

افتح الموقع: https://chefhub-kw.vercel.app

يجب أن ترى:
- ✅ الصفحة الرئيسية تعمل
- ✅ صور الشيفات والأصناف تظهر
- ✅ لا توجد أخطاء في Console

---

## 🆘 إذا استمرت المشكلة:

تحقق من:
1. **Build Logs** في Vercel
2. **Runtime Logs** في Vercel
3. **Browser Console** (F12)

أو تواصل معي للمساعدة! 💪
