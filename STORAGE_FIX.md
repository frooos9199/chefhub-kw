# 🔧 إصلاح مشكلة Firebase Storage

## المشكلة
```
Preflight response is not successful. Status code: 404
XMLHttpRequest cannot load https://firebasestorage.googleapis.com/v0/b/chefhub-kw.appspot.com/o
```

### السبب الرئيسي
**Firebase Storage غير مُفعّل في Firebase Console** ❌

---

## ✅ الحل - خطوة بخطوة

### 1. تفعيل Firebase Storage

#### أ. افتح Firebase Console
1. اذهب إلى: https://console.firebase.google.com/
2. اختر مشروع **chefhub-kw**

#### ب. فعّل Storage
1. من القائمة اليسرى → **Build** → **Storage**
2. اضغط على **"Get Started"** أو **"البدء"**
3. اختر **"Start in production mode"** (مؤقتاً)
4. اضغط **"Next"**
5. اختر الموقع: **us-central1** (أو أقرب موقع)
6. اضغط **"Done"**

#### ج. تحديث القواعد
بعد تفعيل Storage، اذهب إلى تبويب **"Rules"** والصق هذه القواعد:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isValidImage() {
      return request.resource.size < 5 * 1024 * 1024 // 5MB
        && request.resource.contentType.matches('image/.*');
    }
    
    // رفع صور الأطباق
    match /dishes/{chefId}/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn() 
        && request.auth.uid == chefId
        && isValidImage();
    }
    
    // صور البروفايل
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn() 
        && request.auth.uid == userId 
        && isValidImage();
    }
  }
}
```

ثم اضغط **"Publish"**

---

### 2. التحقق من `.env.local` (تم بالفعل ✅)

```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chefhub-kw.appspot.com
```

---

### 3. إعادة تشغيل التطبيق
```bash
# إيقاف السيرفر
pkill -f "next dev"

# تشغيل السيرفر من جديد
npm run dev
```

---

## 🧪 اختبار

بعد تفعيل Storage:

1. افتح: http://localhost:3000/chef/dishes/new
2. املأ النموذج
3. اختر صورة
4. اضغط "حفظ الصنف"
5. يجب أن يتم الحفظ بنجاح ✅

### إذا نجح الرفع ستظهر هذه الرسائل في Console:

```
✅ Successfully uploaded 2 images
📎 Download URL: https://firebasestorage.googleapis.com/...
✅ Dish added successfully!
```

---

## 🎬 فيديو توضيحي

إذا واجهت صعوبة، شاهد هذا الفيديو:
https://firebase.google.com/docs/storage/web/start

---

## ❓ أسئلة شائعة

### س: لماذا 404 بعد تصحيح `.env.local`؟
**ج:** لأن Firebase Storage نفسه غير مُفعّل في Console. يجب تفعيله أولاً.

### س: هل يمكن استخدام `.firebasestorage.app`؟
**ج:** نعم، لكن يحتاج تفعيل خاص في Console. استخدم `.appspot.com` للتبسيط.

### س: Storage Rules آمنة؟
**ج:** نعم، القواعد تسمح فقط للمستخدم المسجل برفع صوره الخاصة.

---

## 📝 ملاحظات مهمة

### حجم الصور
- **الحد الأقصى:** 5MB لكل صورة
- **المُوصى به:** 800x800 بكسل للأطباق
- **التنسيق:** JPG, PNG, WEBP

### Firebase Storage Pricing
- **Free tier:** 5GB تخزين + 1GB نقل بيانات شهرياً
- **كافٍ لـ:** ~5000 صورة (متوسط 1MB)

---

## ✅ Checklist

- [ ] **الخطوة 1:** فتح Firebase Console
- [ ] **الخطوة 2:** اختيار مشروع chefhub-kw
- [ ] **الخطوة 3:** الذهاب إلى Build → Storage
- [ ] **الخطوة 4:** الضغط على "Get Started"
- [ ] **الخطوة 5:** اختيار "Production mode"
- [ ] **الخطوة 6:** اختيار الموقع (us-central1)
- [ ] **الخطوة 7:** نسخ ولصق Storage Rules
- [ ] **الخطوة 8:** الضغط على "Publish"
- [ ] **الخطوة 9:** إعادة تشغيل npm run dev
- [ ] **الخطوة 10:** اختبار رفع صورة

---

**تم التحديث:** 2026-01-16 | **الحالة:** يحتاج تفعيل Storage في Console
