# 🔧 تفعيل Firebase Storage عبر Command Line

## المشكلة
عند محاولة تفعيل Storage من Console، تظهر رسالة:
```
An unknown error occurred. Please refresh the page and try again.
```

---

## ✅ الحلول المتاحة

### 1️⃣ تنظيف Cache المتصفح
```
- اضغط Cmd + Shift + R (Mac) أو Ctrl + Shift + R (Windows)
- أو افتح Firebase Console في نافذة Incognito
```

### 2️⃣ تفعيل Blaze Plan (الأهم!)

Firebase Storage يحتاج **Blaze Plan** (Pay as you go):

1. في Firebase Console → ⚙️ Settings
2. Usage and billing
3. Modify plan
4. اختر **Blaze plan**
5. أدخل بطاقة الدفع

**Free tier limits:**
- 5GB Storage
- 1GB Downloads شهرياً
- 50,000 Writes
- 50,000 Reads

معظم المشاريع تبقى مجانية! ✅

### 3️⃣ تفعيل عبر gcloud CLI

إذا استمرت المشكلة، يمكن التفعيل عبر Terminal:

#### أ. تثبيت gcloud CLI
```bash
# على macOS
brew install --cask google-cloud-sdk

# أو حمّل من:
# https://cloud.google.com/sdk/docs/install
```

#### ب. تسجيل الدخول
```bash
gcloud auth login
gcloud config set project chefhub-kw
```

#### ج. تفعيل Storage API
```bash
# تفعيل Storage API
gcloud services enable storage-api.googleapis.com

# تفعيل Firebase Storage
gcloud services enable firebasestorage.googleapis.com

# إنشاء bucket
gsutil mb -p chefhub-kw -c STANDARD -l us-central1 gs://chefhub-kw.firebasestorage.app/
```

#### د. تحديث CORS settings
```bash
# إنشاء ملف cors.json
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# تطبيق CORS
gsutil cors set cors.json gs://chefhub-kw.firebasestorage.app
```

### 4️⃣ استخدام Server-side Upload (الحل المؤقت الحالي)

الكود الحالي يستخدم server-side upload عبر `/api/upload`، وهذا يعمل **بدون** تفعيل Storage من Console!

**ما دام عندك:**
- ✅ Firebase Admin SDK configured
- ✅ Service Account Key
- ✅ `/app/api/upload/route.ts` موجود

**يجب أن يعمل رفع الصور بدون مشاكل!**

---

## 🧪 اختبار الوضع الحالي

شغّل هذا الأمر:
```bash
cd /Users/mac/Documents/GitHub/chif
npm run dev
```

ثم جرّب رفع صورة من:
http://localhost:3000/chef/dishes/new

إذا اشتغل، **مبروك!** server-side upload يعمل بدون تفعيل Console!

---

## 📝 الخلاصة

**للاستخدام المؤقت:**
- استخدم server-side upload (الحل الحالي) ✅

**للحل النهائي:**
1. فعّل Blaze Plan في Firebase
2. جرّب تفعيل Storage مرة أخرى من Console
3. إذا فشل، استخدم gcloud CLI
4. أو استمر مع server-side upload (يعمل 100%)

---

**تم إنشاؤه:** 2026-01-16
