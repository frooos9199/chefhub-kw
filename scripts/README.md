# Firebase Seed Scripts

هذا المجلد يحتوي على سكريبتات لإضافة بيانات تجريبية إلى Firebase.

## إعداد السكريبت

### 1. تنصيب Firebase Admin SDK

```bash
npm install --save-dev firebase-admin
```

### 2. تحميل Service Account Key

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك
3. اذهب إلى **Project Settings** > **Service Accounts**
4. اضغط على **Generate New Private Key**
5. احفظ الملف باسم `serviceAccountKey.json` في مجلد `scripts`

⚠️ **تحذير**: لا ترفع ملف `serviceAccountKey.json` إلى Git! الملف موجود في `.gitignore`

### 3. تشغيل السكريبت

```bash
node scripts/seed-users.js
```

## المستخدمين التجريبيين

السكريبت سينشئ 3 حسابات:

| الدور | البريد الإلكتروني | كلمة المرور |
|------|-------------------|--------------|
| Admin | admin@chif.com | 123123 |
| Chef | chef@chif.com | 123123 |
| Customer | user@chif.com | 123123 |

## حساب الشيف التجريبي

حساب الشيف يأتي مع:
- ✅ ملف شخصي كامل
- ✅ تخصص: مأكولات كويتية
- ✅ تقييم: 4.8 (42 تقييم)
- ✅ 150 طلب مكتمل
- ✅ حالة: نشط ومعتمد
- ✅ مناطق التوصيل محددة
- ✅ ساعات العمل محددة
- ✅ معلومات بنكية

## إضافة أصناف للشيف

بعد إنشاء المستخدمين، يمكنك استخدام سكريبت آخر لإضافة أصناف تجريبية:

```bash
node scripts/seed-dishes.js
```

## حذف المستخدمين التجريبيين

إذا أردت حذف المستخدمين التجريبيين:

```bash
node scripts/delete-test-users.js
```

## ملاحظات

- السكريبتات تستخدم Firebase Admin SDK
- تأكد من إعداد Service Account Key أولاً
- البيانات التجريبية مناسبة للتطوير فقط
- لا تستخدم كلمات مرور بسيطة في الإنتاج
