# 🔧 دليل الإصلاحات السريعة - ChefHub Mobile

## ✅ الإصلاحات المطبقة تلقائياً

### 1. ✅ إضافة Alert import في HomeScreen
**الملف:** `src/screens/HomeScreen.tsx`  
**التغيير:**
```typescript
// قبل
import { ActivityIndicator, FlatList, Image, ... } from 'react-native';

// بعد
import { ActivityIndicator, Alert, FlatList, Image, ... } from 'react-native';
```
**الحالة:** ✅ تم التطبيق

---

### 2. ✅ إصلاح التنقل التلقائي في RootNavigator
**الملف:** `src/navigation/RootNavigator.tsx`  
**التغيير:** إزالة التوجيه التلقائي لجميع المستخدمين  
**الحالة:** ✅ تم التطبيق

---

## 🔴 إصلاحات يدوية مطلوبة

### 1. إصلاح أزرار التنقل في ChefDashboardScreen

**الملف:** `src/screens/ChefDashboardScreen.tsx`

**المشكلة:** زر "إدارة الأطباق" يوجه للبروفايل بدلاً من صفحة الأطباق

**الحل:**

افتح الملف `src/screens/ChefDashboardScreen.tsx` وابحث عن السطر 165 تقريباً:

```typescript
// ❌ خطأ - قبل الإصلاح
<Pressable 
  style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
  onPress={() => navigation.navigate('ChefProfile')}  // خطأ!
>
  <View style={styles.actionIcon}>
    <Text style={styles.actionEmoji}>🍽️</Text>
  </View>
  <View style={styles.actionContent}>
    <Text style={styles.actionTitle}>إدارة الأطباق</Text>
    <Text style={styles.actionDesc}>أضف أو عدّل أطباقك ({stats.dishes})</Text>
  </View>
  <Text style={styles.actionArrow}>←</Text>
</Pressable>

// ✅ صحيح - بعد الإصلاح
<Pressable 
  style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
  onPress={() => navigation.navigate('ChefManageDishes')}  // صحيح!
>
  <View style={styles.actionIcon}>
    <Text style={styles.actionEmoji}>🍽️</Text>
  </View>
  <View style={styles.actionContent}>
    <Text style={styles.actionTitle}>إدارة الأطباق</Text>
    <Text style={styles.actionDesc}>أضف أو عدّل أطباقك ({stats.dishes})</Text>
  </View>
  <Text style={styles.actionArrow}>←</Text>
</Pressable>
```

**خطوات التطبيق:**
1. افتح `src/screens/ChefDashboardScreen.tsx`
2. ابحث عن `onPress={() => navigation.navigate('ChefProfile')}`
3. تأكد أن الزر الصحيح يوجه لـ `ChefManageDishes`
4. احفظ الملف

---

### 2. إنشاء نظام الترجمة (i18n)

**الخطوة 1: تثبيت المكتبات**

```bash
cd apps/ChefHubMobile
npm install i18next react-i18next
# أو
yarn add i18next react-i18next
```

**الخطوة 2: إنشاء ملفات الترجمة**

أنشئ مجلد `src/locales/` وأضف الملفات التالية:

**`src/locales/ar.json`**
```json
{
  "common": {
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "save": "حفظ",
    "cancel": "إلغاء",
    "loading": "جاري التحميل...",
    "error": "حدث خطأ",
    "success": "تم بنجاح"
  },
  "chef": {
    "welcome": "مرحباً أيها الشيف 👨‍🍳",
    "dashboard": "لوحة الشيف",
    "manageDishes": "إدارة الأطباق",
    "manageOrders": "إدارة الطلبات",
    "settings": "الإعدادات",
    "addDish": "إضافة طبق",
    "editDish": "تعديل طبق",
    "dishName": "اسم الطبق",
    "dishDescription": "وصف الطبق",
    "price": "السعر",
    "category": "التصنيف"
  },
  "customer": {
    "welcome": "مرحباً 👋",
    "browseChefs": "تصفح الشيفات",
    "browseDishes": "تصفح الأطباق",
    "cart": "السلة",
    "orders": "طلباتي"
  },
  "auth": {
    "login": "تسجيل الدخول",
    "signup": "إنشاء حساب",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "forgotPassword": "نسيت كلمة المرور؟",
    "loginSuccess": "تم تسجيل الدخول بنجاح",
    "loginError": "خطأ في تسجيل الدخول"
  }
}
```

**`src/locales/en.json`**
```json
{
  "common": {
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading...",
    "error": "Error occurred",
    "success": "Success"
  },
  "chef": {
    "welcome": "Welcome Chef 👨‍🍳",
    "dashboard": "Chef Dashboard",
    "manageDishes": "Manage Dishes",
    "manageOrders": "Manage Orders",
    "settings": "Settings",
    "addDish": "Add Dish",
    "editDish": "Edit Dish",
    "dishName": "Dish Name",
    "dishDescription": "Dish Description",
    "price": "Price",
    "category": "Category"
  },
  "customer": {
    "welcome": "Welcome 👋",
    "browseChefs": "Browse Chefs",
    "browseDishes": "Browse Dishes",
    "cart": "Cart",
    "orders": "My Orders"
  },
  "auth": {
    "login": "Login",
    "signup": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "loginSuccess": "Login successful",
    "loginError": "Login error"
  }
}
```

**الخطوة 3: إنشاء ملف الإعداد**

**`src/locales/i18n.ts`**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar', // اللغة الافتراضية
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

**الخطوة 4: استخدام الترجمة في المكونات**

**مثال في `ChefDashboardScreen.tsx`:**

```typescript
import { useTranslation } from 'react-i18next';

export function ChefDashboardScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text style={styles.greeting}>{t('chef.welcome')}</Text>
      <Text style={styles.title}>{t('chef.dashboard')}</Text>
      
      <Pressable onPress={() => navigation.navigate('ChefManageDishes')}>
        <Text>{t('chef.manageDishes')}</Text>
      </Pressable>
    </View>
  );
}
```

**الخطوة 5: تفعيل i18n في App.tsx**

```typescript
import './src/locales/i18n'; // أضف هذا السطر في أول الملف
```

---

### 3. تحسين أزرار ChefManageDishesScreen

**الملف:** `src/screens/ChefManageDishesScreen.tsx`

**التحسينات المقترحة:**

```typescript
// أضف هذه الأنماط
const styles = StyleSheet.create({
  // ... الأنماط الموجودة
  
  // أنماط جديدة للأزرار
  actionButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 16,
  },
  
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand.emerald,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...shadows.md,
  },
  
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...shadows.md,
  },
  
  dangerActionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...shadows.md,
  },
  
  actionBtnIcon: {
    fontSize: 18,
  },
  
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

// استخدم الأنماط الجديدة
<View style={styles.actionButtonsRow}>
  <Pressable 
    onPress={() => openEditModal(item)} 
    style={({ pressed }) => [
      styles.secondaryActionBtn,
      pressed && { opacity: 0.9 }
    ]}
  >
    <Text style={styles.actionBtnIcon}>✏️</Text>
    <Text style={styles.actionBtnText}>تعديل</Text>
  </Pressable>
  
  <Pressable 
    onPress={() => removeDish(item.id)} 
    style={({ pressed }) => [
      styles.dangerActionBtn,
      pressed && { opacity: 0.9 }
    ]}
  >
    <Text style={styles.actionBtnIcon}>🗑️</Text>
    <Text style={styles.actionBtnText}>حذف</Text>
  </Pressable>
</View>
```

---

### 4. إضافة Firestore Indexes

**الملف:** `firestore.indexes.json` (في جذر المشروع)

```json
{
  "indexes": [
    {
      "collectionGroup": "custom_units",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "chefId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "dishes",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "chefId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "chefId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**نشر الـ Indexes:**
```bash
firebase deploy --only firestore:indexes
```

---

## 📝 قائمة التحقق (Checklist)

### إصلاحات فورية
- [x] إضافة Alert import في HomeScreen ✅
- [x] إصلاح التنقل التلقائي في RootNavigator ✅
- [ ] إصلاح أزرار التنقل في ChefDashboardScreen ⏳
- [ ] اختبار التطبيق بعد الإصلاحات ⏳

### تحسينات متوسطة
- [ ] إنشاء نظام الترجمة (i18n) ⏳
- [ ] تحسين أزرار ChefManageDishesScreen ⏳
- [ ] إضافة Firestore Indexes ⏳

### اختبارات
- [ ] اختبار تسجيل الدخول كشيف ⏳
- [ ] اختبار إضافة منتج جديد ⏳
- [ ] اختبار التنقل بين الصفحات ⏳
- [ ] اختبار اللغة العربية (RTL) ⏳

---

## 🚀 كيفية تطبيق الإصلاحات

### 1. تحديث الكود
```bash
cd apps/ChefHubMobile
git pull origin main
```

### 2. تثبيت المكتبات الجديدة
```bash
npm install
# أو
yarn install
```

### 3. تشغيل التطبيق
```bash
# iOS
npm run ios

# Android
npm run android
```

### 4. اختبار الإصلاحات
- سجل دخول كشيف
- اضغط على "إدارة الأطباق"
- تأكد من فتح الصفحة الصحيحة
- جرب إضافة منتج جديد

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع ملف `MOBILE_APP_ISSUES_REPORT.md`
2. تحقق من console logs
3. تأكد من تثبيت جميع المكتبات

---

**آخر تحديث:** ${new Date().toLocaleDateString('ar-KW')}
