# Troubleshooting (Demo)

## 1) الموقع يفتح لكن لا توجد بيانات
- تحقق من إعداد Firebase في `.env.local`.
- تحقق أن Firestore يحتوي بيانات (chefs/dishes).

## 2) الشيف لا يظهر في الصفحة الرئيسية أو صفحة الشيفات
- تحقق من حقول الشيف في Firestore:
  - `status`: يجب أن تكون `approved` (أو `active` في البيانات القديمة)
  - `isActive`: إذا كانت `false` سيتم إخفاؤه
- تحقق أن صفحة الشيف لديها أطباق فعّالة.

## 3) الأطباق لا تظهر أو تظهر/تختفي
- قد يكون السبب Firestore Indexes أثناء البناء.
- راجع `firestore.indexes.json` ثم انشرها عبر Firebase CLI إذا لزم.

## 4) الإيميل/واتساب لا تُرسل
- تأكد من وجود مفاتيح البيئة:
  - Email: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
  - WhatsApp: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
- بدونها النظام يدخل وضع DEBUG (لن يرسل فعلياً).
