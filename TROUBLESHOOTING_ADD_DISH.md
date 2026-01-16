# دليل حل مشكلة: "حفظ منتج جديد لا يعمل"

## 🔍 الأسباب المحتملة والحلول

### 1. ⚠️ Firebase Storage غير مفعّل

**الأعراض:**
- خطأ: `storage/unauthorized`
- الصور لا ترفع

**الحل:**
```bash
# 1. افتح Firebase Console
https://console.firebase.google.com/project/chefhub-kw/storage

# 2. تأكد من تفعيل Firebase Storage
# 3. انسخ Storage Bucket URL:
# chefhub-kw.appspot.com

# 4. تحديث .env.local:
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chefhub-kw.appspot.com

# 5. نشر Storage Rules:
cd /Users/mac/Documents/GitHub/chif
firebase deploy --only storage
```

---

### 2. 🔐 مشكلة في المصادقة (userData.uid)

**الأعراض:**
- خطأ: "يجب تسجيل الدخول أولاً"
- userData = null رغم تسجيل الدخول

**الحل:**
```typescript
// تم إصلاحه في Commit السابق
// userData الآن يحتوي على uid و id
```

**التحقق:**
```javascript
// في Console المتصفح:
console.log(userData);
// يجب أن يعرض: { uid: "...", id: "...", email: "...", ... }
```

---

### 3. 📷 حجم الصورة كبير جداً

**الأعراض:**
- الصورة لا ترفع
- خطأ: `storage/quota-exceeded`

**الحل:**
```javascript
// الحجم الأقصى المسموح: 5MB
// قم بضغط الصورة قبل الرفع

// أو استخدم أداة ضغط:
https://tinypng.com/
https://squoosh.app/
```

---

### 4. 🌐 مشكلة في الاتصال بالإنترنت

**الأعراض:**
- خطأ: `storage/retry-limit-exceeded`
- الطلب يستغرق وقتاً طويلاً

**الحل:**
- تحقق من اتصال الإنترنت
- حاول مرة أخرى
- استخدم شبكة مستقرة

---

### 5. ❌ قواعد Firestore محظورة

**الأعراض:**
- خطأ: `permission-denied`
- البيانات لا تحفظ في Firestore

**الحل:**
```bash
# نشر Firestore Rules:
cd /Users/mac/Documents/GitHub/chif
firebase deploy --only firestore:rules
```

**تحقق من القواعد:**
```javascript
// في firestore.rules:
match /dishes/{dishId} {
  allow create: if request.auth != null;
  allow read: if true;
  allow update, delete: if request.auth.uid == resource.data.chefId;
}
```

---

### 6. 🔄 مشكلة في Index مفقود

**الأعراض:**
- خطأ في Console: `The query requires an index`
- رابط لإنشاء Index

**الحل:**
1. افتح الرابط المعروض في Console
2. اضغط "Create Index"
3. انتظر حتى يكتمل بناء الـ Index

---

## 🛠️ خطوات استكشاف الأخطاء

### الخطوة 1: افتح Console المتصفح
```
F12 أو Cmd + Option + I
```

### الخطوة 2: انتقل إلى تبويب Console

### الخطوة 3: ابحث عن الأخطاء
ستجد رسائل مفصلة مثل:
```javascript
❌ Error creating dish: FirebaseError: ...
Error message: Missing or insufficient permissions
Error code: permission-denied
```

### الخطوة 4: حدد نوع المشكلة

| Error Code | المشكلة | الحل |
|-----------|---------|-----|
| `storage/unauthorized` | Storage غير مفعّل | فعّل Storage في Firebase Console |
| `permission-denied` | قواعد Firestore | نشر firestore.rules |
| `storage/quota-exceeded` | حجم الصورة كبير | ضغط الصورة |
| `auth/user-not-found` | مشكلة مصادقة | تسجيل خروج ودخول مرة أخرى |
| `The query requires an index` | Index مفقود | افتح رابط الـ Index |

---

## 🧪 اختبار النموذج

### 1. تحقق من تسجيل الدخول:
```javascript
// في Console:
console.log('User:', user);
console.log('UserData:', userData);
// يجب أن يعرض بيانات المستخدم
```

### 2. تحقق من الصورة:
```javascript
// قبل الرفع:
console.log('Images:', selectedImages);
console.log('Image sizes:', selectedImages.map(f => f.size));
// يجب أن تكون أقل من 5MB لكل صورة
```

### 3. تحقق من البيانات:
```javascript
// قبل الحفظ:
console.log('Form data:', formData);
// تأكد من أن جميع الحقول المطلوبة معبأة
```

### 4. تحقق من Firebase Config:
```javascript
// في Console:
console.log('Firebase Config:', {
  apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
// يجب أن تكون جميعها true
```

---

## ✅ قائمة التحقق (Checklist)

قبل محاولة الحفظ:

- [ ] تسجيل الدخول كـ Chef
- [ ] Firebase Storage مفعّل
- [ ] Storage Rules منشورة
- [ ] Firestore Rules منشورة
- [ ] متغيرات البيئة (.env.local) محدثة
- [ ] الصور أقل من 5MB
- [ ] جميع الحقول المطلوبة معبأة (*):
  - [ ] اسم الطبق (عربي)
  - [ ] اسم الطبق (إنجليزي)
  - [ ] الوصف (عربي)
  - [ ] الوصف (إنجليزي)
  - [ ] الفئة
  - [ ] السعر
  - [ ] وقت التحضير
  - [ ] صورة واحدة على الأقل

---

## 🔥 نشر القواعد على Firebase

### Storage Rules:
```bash
cd /Users/mac/Documents/GitHub/chif
firebase deploy --only storage
```

### Firestore Rules:
```bash
firebase deploy --only firestore:rules
```

### Firestore Indexes:
```bash
firebase deploy --only firestore:indexes
```

### الكل معاً:
```bash
firebase deploy --only firestore,storage
```

---

## 📞 الدعم

إذا استمرت المشكلة:

1. **افتح Console المتصفح** وانسخ الخطأ كاملاً
2. **تحقق من Firebase Console** من عدم وجود مشاكل في المشروع
3. **أعد تشغيل السيرفر**:
   ```bash
   pkill -f "next dev"
   npm run dev
   ```
4. **امسح Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 🎯 الخطوة التالية

بعد حل المشكلة:

1. ✅ سجّل دخولك
2. ✅ اذهب إلى `/chef/dishes/new`
3. ✅ املأ الحقول المطلوبة
4. ✅ ارفع صورة
5. ✅ اضغط "حفظ الصنف"
6. ✅ تحقق من Console للرسائل
7. ✅ سيتم تحويلك لصفحة الأطباق

**إذا ظهرت رسالة "✅ تم إضافة الصنف بنجاح!" - تمت العملية بنجاح!**
