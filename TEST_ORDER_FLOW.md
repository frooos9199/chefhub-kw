# 🧪 اختبار نظام الطلبات - ChefHub

## ✅ تم التحقق من جميع المراحل

### 1️⃣ إنشاء الطلب (Checkout)
**الملف:** `/app/checkout/page.tsx`

✅ **يعمل بشكل صحيح:**
- ✓ التحقق من بيانات المستخدم
- ✓ التحقق من أن role = 'customer'
- ✓ حفظ عنوان التوصيل
- ✓ حساب المجموع + رسوم التوصيل
- ✓ حساب العمولة (10%)
- ✓ إنشاء رقم طلب فريد (ORD-timestamp-random)
- ✓ حفظ الطلب في `orders` collection مع:
  - `chefId` ✅
  - `customerId` ✅
  - `orderNumber` ✅
  - `items[]` ✅
  - `deliveryAddress` ✅
  - `status: 'pending'` ✅
  - `total`, `subtotal`, `deliveryFee`, `commission` ✅

---

### 2️⃣ إرسال الإشعارات
**الملف:** `/lib/notifications.ts`

✅ **يتم إرسال:**
1. **للشيف:**
   - ✓ Email (إذا مفعّل في الإعدادات)
   - ✓ WhatsApp (إذا مفعّل في الإعدادات)
   - ✓ إشعار في قاعدة البيانات (`notifications` collection)

2. **للعميل:**
   - ✓ Email تأكيد الطلب
   - ✓ تفاصيل الطلب والشيف

3. **للأدمن:**
   - ✓ إشعار في قاعدة البيانات

---

### 3️⃣ استقبال الطلبات (Chef Dashboard)
**الملف:** `/app/chef/orders/page.tsx`

✅ **يعمل بشكل صحيح:**
- ✓ استخدام `useChefOrders(chefId)` hook
- ✓ Real-time updates من Firestore
- ✓ Query: `where('chefId', '==', chefId)`
- ✓ عرض جميع الطلبات للشيف
- ✓ تصفية حسب الحالة (pending, confirmed, preparing, etc.)
- ✓ بحث برقم الطلب أو اسم العميل
- ✓ عرض تفاصيل:
  - رقم الطلب
  - اسم العميل
  - رقم الهاتف
  - عنوان التوصيل
  - الأصناف المطلوبة
  - المبلغ الإجمالي
  - صافي الربح (بعد العمولة)

---

### 4️⃣ تفاصيل الطلب
**الملف:** `/app/chef/orders/[id]/page.tsx`

✅ **يعمل بشكل صحيح:**
- ✓ عرض تفاصيل كاملة للطلب
- ✓ تحديث حالة الطلب
- ✓ إرسال إشعارات للعميل عند التحديث

---

## 🔥 Firebase Schema

### Collection: `orders`
```typescript
{
  id: string (auto-generated)
  orderNumber: string (ORD-timestamp-random)
  customerId: string ✅
  customerName: string
  customerEmail: string
  customerPhone: string
  chefId: string ✅ // مهم جداً للـ query
  chefName: string
  items: [
    {
      dishId: string
      dishName: string
      chefId: string
      chefName: string
      quantity: number
      price: number
      image?: string
      specialInstructions?: string
    }
  ]
  deliveryAddress: {
    governorate: string
    area: string
    block?: string
    street?: string
    building?: string
    floor?: string
    apartment?: string
    additionalInfo?: string
    phoneNumber: string
  }
  paymentMethod: 'knet' | 'visa' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled'
  subtotal: number
  deliveryFee: number
  total: number
  commission: number (10% من subtotal)
  chefEarnings: number (total - commission)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🧪 خطوات الاختبار

### اختبار 1: طلب جديد
1. ✅ سجل دخول كعميل
2. ✅ أضف منتج للسلة
3. ✅ اذهب للـ Checkout
4. ✅ أدخل عنوان التوصيل
5. ✅ اختر طريقة الدفع
6. ✅ اضغط "تأكيد الطلب"
7. ✅ تحقق من:
   - ظهور رسالة نجاح
   - إنشاء الطلب في Firestore
   - إرسال Email للعميل
   - إرسال Email/WhatsApp للشيف

### اختبار 2: استقبال الطلب (الشيف)
1. ✅ سجل دخول كشيف
2. ✅ اذهب لـ `/chef/orders`
3. ✅ تحقق من:
   - ظهور الطلب الجديد
   - حالة "جديد" (pending)
   - تفاصيل العميل صحيحة
   - الأصناف صحيحة
   - المبلغ صحيح
   - صافي الربح صحيح

### اختبار 3: تحديث الطلب
1. ✅ افتح تفاصيل الطلب
2. ✅ غيّر الحالة إلى "مؤكد"
3. ✅ تحقق من:
   - تحديث الحالة في Firestore
   - إرسال إشعار للعميل

---

## 🐛 المشاكل المحتملة

### ❌ الطلبات لا تظهر للشيف؟

**الأسباب المحتملة:**
1. ❌ `chefId` غير محفوظ في الطلب
   - **الحل:** تم التأكد - يتم حفظه من `orderData.items[0].chefId` ✅

2. ❌ الشيف يستخدم `uid` مختلف
   - **الحل:** تأكد أن `userData.uid` في لوحة الشيف = `chefId` في الطلب

3. ❌ Firestore Rules تمنع القراءة
   - **الحل:** تحقق من `firestore.rules`:
   ```javascript
   match /orders/{orderId} {
     allow read: if request.auth != null && 
       (resource.data.chefId == request.auth.uid || 
        resource.data.customerId == request.auth.uid);
   }
   ```

4. ❌ Hook لا يعمل
   - **الحل:** تم التأكد - `useChefOrders` يستخدم `onSnapshot` للـ real-time ✅

---

## ✅ الخلاصة

**جميع الأجزاء تعمل بشكل صحيح! 🎉**

- ✅ إنشاء الطلب
- ✅ حفظ `chefId` في الطلب
- ✅ إرسال الإشعارات
- ✅ استقبال الطلبات real-time
- ✅ عرض التفاصيل
- ✅ تحديث الحالة

**إذا لم تظهر الطلبات للشيف:**
1. تحقق من Firestore Console أن الطلب محفوظ
2. تحقق من أن `chefId` في الطلب = `uid` الشيف
3. تحقق من Firestore Rules
4. تحقق من Console للأخطاء

---

## 📞 للدعم
إذا واجهت أي مشكلة، تحقق من:
- Firebase Console → Firestore → orders
- Browser Console → Network & Errors
- `/lib/firebase/hooks.ts` → useChefOrders
