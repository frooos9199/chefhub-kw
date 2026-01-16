# إصلاح خطأ Firestore Index المفقود

## 🔴 المشكلة
```
FirebaseError: The query requires an index
```

## ✅ الحل السريع (طريقة 1 - موصى بها)

استخدم الرابط الذي قدمه Firebase مباشرة:
```
https://console.firebase.google.com/v1/r/project/chefhub-kw/firestore/indexes?create_composite=Cklwcm9qZWN0cy9jaGVmaHViLWt3L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9kaXNoZXMvaW5kZXhlcy9fEAEaCgoGY2hlZklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

**الخطوات:**
1. افتح الرابط في المتصفح
2. اضغط **Create Index**
3. انتظر حتى يكتمل بناء الـ Index (قد يستغرق دقائق معدودة)
4. أعد تحميل الصفحة

---

## 📝 الحل اليدوي (طريقة 2)

إذا لم يعمل الرابط، قم بإنشاء الـ Index يدوياً:

### 1. افتح Firebase Console
https://console.firebase.google.com/project/chefhub-kw/firestore/indexes

### 2. اضغط على "Create Index"

### 3. املأ التفاصيل:
- **Collection ID**: `dishes`
- **Query scope**: `Collection`

### 4. أضف الحقول بالترتيب:
| Field Path | Order |
|------------|-------|
| chefId     | Ascending |
| createdAt  | Descending |

### 5. اضغط **Create**

---

## 🚀 استخدام Firebase CLI (طريقة 3)

### 1. تأكد من تسجيل الدخول:
```bash
firebase login
```

### 2. نشر الـ Indexes:
```bash
cd /Users/mac/Documents/GitHub/chif
firebase deploy --only firestore:indexes
```

### 3. انتظر حتى يكتمل النشر:
```
✔  Deploy complete!
```

---

## 📊 الـ Indexes المطلوبة

تم تحديث `firestore.indexes.json` ليشمل:

### Index جديد تم إضافته:
```json
{
  "collectionGroup": "dishes",
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "chefId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

### الـ Indexes الحالية:
1. ✅ `dishes`: `isAvailable + createdAt`
2. ✅ `dishes`: `chefId + createdAt` **(الجديد)**
3. ✅ `dishes`: `chefId + isAvailable + createdAt`
4. ✅ `chefs`: `status + createdAt`
5. ✅ `chefs`: `status + rating`
6. ✅ `orders`: `chefId + createdAt`
7. ✅ `orders`: `customerId + createdAt`
8. ✅ `orders`: `status + createdAt`
9. ✅ `reviews`: `chefId + createdAt`
10. ✅ `banners`: `isActive + order`

---

## 🔍 التحقق من الـ Indexes

### في Firebase Console:
1. افتح: https://console.firebase.google.com/project/chefhub-kw/firestore/indexes
2. تأكد من أن الـ Index الجديد موجود
3. تأكد من حالته: **Enabled** (أخضر)

### في الكود:
```bash
# أعد تحميل الصفحة التي تسببت بالخطأ
# يجب أن تعمل بدون مشاكل
```

---

## ⚠️ ملاحظات مهمة

1. **وقت البناء**: قد يستغرق بناء الـ Index من دقيقة إلى عدة دقائق حسب حجم البيانات
2. **الحالة**: تحقق من أن الـ Index في حالة **Enabled** وليس **Building**
3. **Cache**: قد تحتاج لمسح Cache المتصفح أو الانتظار قليلاً
4. **الأخطاء المشابهة**: إذا ظهرت أخطاء مشابهة، استخدم الرابط الذي يقدمه Firebase مباشرة

---

## 🆘 استكشاف الأخطاء

### الخطأ ما زال يظهر؟
1. ✅ تأكد من اكتمال بناء الـ Index (قد يستغرق وقت)
2. ✅ أعد تحميل الصفحة بـ Hard Reload: `Cmd + Shift + R`
3. ✅ امسح Cache المتصفح
4. ✅ تحقق من أنك في المشروع الصحيح: `chefhub-kw`

### Firebase CLI لا تعمل؟
```bash
# أعد تثبيت firebase-tools
npm install -g firebase-tools

# أعد تسجيل الدخول
firebase logout
firebase login
```

---

## 📚 مصادر إضافية

- [Firebase Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Composite Indexes](https://firebase.google.com/docs/firestore/query-data/index-overview#composite_indexes)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
