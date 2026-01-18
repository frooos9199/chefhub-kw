# ChefHub — Company Demo Kit

هذا المجلد مخصص لتجهيز عرض احترافي للمشروع أمام الشركة.

## 1) المتطلبات
- Node.js (يفضل 18+ أو 20)
- npm
- مشروع Firebase/Firestore جاهز (أو استخدام مشروعكم الحالي)

## 2) تشغيل الموقع محلياً (Local)
1. تثبيت الحزم:
   - `npm install`
2. تجهيز ملف البيئة:
   - أنشئ `.env.local` في جذر المشروع
   - راجع دليل المتغيرات: `ENV_VARIABLES_GUIDE.md` في جذر المشروع
3. تشغيل التطوير:
   - `npm run dev`
4. فتح الموقع:
   - `http://localhost:3000`

## 3) تشغيل عرض “Production-like” محلياً
- `npm run build`
- `npm start`

## 4) العرض الجاهز للشركة (Demo Flow)
ابدأ من الملف:
- `DEMO_FLOW_AR.md`
ثم راجع:
- `ROLES_AND_PERMISSIONS_AR.md`
- `DEMO_CHECKLIST.md`

## 5) حسابات الديمو
يفضل إنشاء 3 حسابات ديمو (عميل/شيف/أدمن) قبل العرض.
- لأسباب أمنية: لا تضع كلمات مرور حقيقية داخل المستودع.
- استخدم ملف `DEMO_ACCOUNTS_TEMPLATE.md` لتوثيقها داخلياً (بدون رفعه).

## 6) ملاحظات مهمة
- المشروع يعتمد على Firestore Indexes. إذا ظهر خطأ “requires an index”، راجع `firestore.indexes.json` وخطوات النشر.
- عند ربط الإيميل/واتساب فعلياً: يجب توفر مفاتيح SendGrid/Twilio في `.env.local`.

## 7) المطور
- Website: https://www.q8nexdev.com
