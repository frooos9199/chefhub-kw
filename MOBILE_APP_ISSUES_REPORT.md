# 📱 تقرير مشاكل تطبيق ChefHub Mobile

**تاريخ الفحص:** ${new Date().toLocaleDateString('ar-KW')}  
**الحالة:** 🔴 يحتاج إصلاحات عاجلة

---

## 🚨 المشاكل الحرجة (Critical Issues)

### 1. ❌ مشكلة التنقل - زر "إضافة منتج" يوجه للبروفايل

**الوصف:**  
عند الضغط على زر "إضافة منتج" في لوحة الشيف، يتم التوجيه إلى صفحة البروفايل بدلاً من صفحة إضافة المنتج.

**الموقع:**  
- `src/screens/ChefDashboardScreen.tsx` - السطر 165-175

**السبب:**  
```typescript
<Pressable 
  style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
  onPress={() => navigation.navigate('ChefManageDishes')}  // ✅ صحيح
>
```

**لكن في:**
```typescript
<Pressable 
  style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
  onPress={() => navigation.navigate('ChefProfile')}  // ❌ خطأ - يوجه للبروفايل
>
```

**الحل المطلوب:**
- تصحيح جميع أزرار التنقل في `ChefDashboardScreen`
- التأكد من أن كل زر يوجه للصفحة الصحيحة

---

### 2. ⚠️ مشكلة التنقل في RootNavigator

**الوصف:**  
التنقل التلقائي بعد تسجيل الدخول قد يسبب مشاكل.

**الموقع:**  
- `src/navigation/RootNavigator.tsx` - السطر 233-241

**الكود الحالي:**
```typescript
useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged((user) => {
    setIsAuthenticated(!!user);
    
    // Navigate to chef dashboard after login
    if (user && navigationRef.current) {
      setTimeout(() => {
        navigationRef.current?.navigate('Account', {
          screen: 'ChefDashboard',
        });
      }, 100);
    }
  });

  return unsubscribe;
}, []);
```

**المشكلة:**
- يتم التنقل تلقائياً لـ ChefDashboard لجميع المستخدمين (حتى العملاء!)
- لا يتحقق من نوع المستخدم (role)

**الحل المطلوب:**
```typescript
useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged(async (user) => {
    setIsAuthenticated(!!user);
    
    if (user && navigationRef.current) {
      // التحقق من نوع المستخدم أولاً
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.data()?.role;
      
      setTimeout(() => {
        if (role === 'chef') {
          navigationRef.current?.navigate('Account', { screen: 'ChefDashboard' });
        } else if (role === 'customer') {
          navigationRef.current?.navigate('Home');
        } else if (role === 'admin') {
          navigationRef.current?.navigate('Account', { screen: 'AdminDashboard' });
        }
      }, 100);
    }
  });

  return unsubscribe;
}, []);
```

---

## 🔤 مشاكل اللغة العربية (RTL Issues)

### 3. 📝 عدم وجود نظام ترجمة موحد

**الوصف:**  
التطبيق يستخدم نصوص عربية مباشرة في الكود بدون نظام i18n.

**المشاكل:**
- ❌ لا يوجد ملف `ar.json` أو `en.json` للترجمات
- ❌ النصوص مكتوبة مباشرة في الكود (Hard-coded)
- ❌ صعوبة تعديل النصوص لاحقاً
- ❌ لا يمكن التبديل بين العربية والإنجليزية

**الحل المطلوب:**
1. إنشاء مجلد `src/locales/`
2. إضافة ملفات:
   - `src/locales/ar.json`
   - `src/locales/en.json`
3. استخدام مكتبة `react-i18next` أو `react-native-localize`

**مثال:**
```typescript
// قبل
<Text>مرحباً أيها الشيف 👨‍🍳</Text>

// بعد
<Text>{t('chef.welcome')}</Text>
```

---

### 4. 🔄 مشاكل RTL في بعض المكونات

**الوصف:**  
بعض المكونات لا تدعم RTL بشكل صحيح.

**الأماكن المتأثرة:**
- `HomeScreen.tsx` - بعض العناصر تظهر من اليسار لليمين
- `ChefProfileScreen.tsx` - الأزرار والأيقونات
- `ChefManageDishesScreen.tsx` - نموذج الإضافة

**الحل المطلوب:**
```typescript
// في RootNavigator.tsx
import { I18nManager } from 'react-native';

// تفعيل RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
```

---

## 🎨 مشاكل واجهة المستخدم (UI Issues)

### 5. 🖼️ صور البروفايل في AccountScreen

**الوصف:**  
منطق رفع صور البروفايل موجود فقط في `AccountScreen` وليس في `ChefProfileScreen`.

**المشكلة:**
- الشيف لا يستطيع تعديل صورته من صفحة البروفايل الخاصة به
- الوظيفة موجودة فقط في صفحة الحساب

**الحل المطلوب:**
- نقل منطق رفع الصور إلى مكون مشترك
- إضافة زر تعديل الصورة في `ChefProfileScreen`

---

### 6. 📱 أزرار غير واضحة في ChefManageDishesScreen

**الوصف:**  
أزرار "إضافة" و"تعديل" و"حذف" تحتاج تحسين.

**المشاكل:**
- الألوان غير متناسقة
- الأيقونات مفقودة
- الحجم صغير على بعض الأجهزة

**الحل المطلوب:**
```typescript
// إضافة أيقونات
<Pressable style={styles.addBtn}>
  <Text style={styles.icon}>➕</Text>
  <Text style={styles.btnText}>إضافة منتج</Text>
</Pressable>

<Pressable style={styles.editBtn}>
  <Text style={styles.icon}>✏️</Text>
  <Text style={styles.btnText}>تعديل</Text>
</Pressable>

<Pressable style={styles.deleteBtn}>
  <Text style={styles.icon}>🗑️</Text>
  <Text style={styles.btnText}>حذف</Text>
</Pressable>
```

---

## 🔧 مشاكل وظيفية (Functional Issues)

### 7. 🔐 مشكلة المصادقة في AccountScreen

**الوصف:**  
الكود معقد جداً ويحتوي على الكثير من الحالات.

**المشاكل:**
- ❌ الملف طويل جداً (800+ سطر)
- ❌ منطق المصادقة مختلط مع UI
- ❌ صعوبة الصيانة

**الحل المطلوب:**
- فصل منطق المصادقة إلى `hooks/useAuth.ts`
- تقسيم الملف إلى مكونات أصغر:
  - `LoginForm.tsx`
  - `SignupForm.tsx`
  - `BiometricAuth.tsx`
  - `SocialAuth.tsx`

---

### 8. 📦 إدارة الحالة (State Management)

**الوصف:**  
التطبيق يستخدم `useState` و `useEffect` بكثرة.

**المشاكل:**
- تكرار الكود
- صعوبة تتبع الحالة
- مشاكل في الأداء

**الحل المطلوب:**
- استخدام Context API بشكل أفضل
- أو استخدام Zustand/Redux Toolkit
- إنشاء `ChefContext` و `DishesContext`

---

## 🐛 أخطاء برمجية (Bugs)

### 9. ⚠️ Missing Alert import في HomeScreen

**الموقع:** `src/screens/HomeScreen.tsx` - السطر 186

**الكود:**
```typescript
Alert.alert('✅ تمت الإضافة', `تم إضافة ${item.titleAr} للسلة`);
```

**المشكلة:**
```typescript
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
// ❌ Alert غير مستورد!
```

**الحل:**
```typescript
import { ActivityIndicator, Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
```

---

### 10. 🔄 مشكلة في loadCustomUnits

**الموقع:** `src/data/home.ts` - السطر 485

**المشكلة:**
```typescript
export async function loadCustomUnits(chefId: string): Promise<CustomUnit[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const snapshot = await getDocs(query(collection(db, 'chefs', chefId, 'custom_units'), orderBy('createdAt', 'desc')));
    // ❌ قد يفشل إذا لم يكن هناك index في Firestore
```

**الحل:**
- إضافة Firestore Index:
```json
{
  "collectionGroup": "custom_units",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

## 📋 قائمة المهام المطلوبة (Action Items)

### 🔴 عاجل (High Priority)

- [ ] **إصلاح مشكلة التنقل في ChefDashboardScreen**
  - تصحيح جميع أزرار `onPress`
  - اختبار التنقل بين الصفحات
  
- [ ] **إصلاح التنقل التلقائي في RootNavigator**
  - إضافة التحقق من نوع المستخدم
  - التوجيه حسب الدور (role)

- [ ] **إضافة Alert import في HomeScreen**
  - استيراد Alert من react-native

### 🟡 متوسط (Medium Priority)

- [ ] **إنشاء نظام ترجمة موحد**
  - إنشاء مجلد locales
  - إضافة ملفات ar.json و en.json
  - استخدام i18next

- [ ] **تحسين أزرار ChefManageDishesScreen**
  - إضافة أيقونات
  - تحسين الألوان والأحجام

- [ ] **فصل منطق المصادقة**
  - إنشاء useAuth hook
  - تقسيم AccountScreen

### 🟢 منخفض (Low Priority)

- [ ] **تحسين إدارة الحالة**
  - استخدام Context API أو Zustand
  - تقليل استخدام useState

- [ ] **إضافة Firestore Indexes**
  - إنشاء ملف firestore.indexes.json
  - نشر الـ indexes

---

## 📊 ملخص الإحصائيات

| الفئة | العدد | الحالة |
|------|------|--------|
| مشاكل حرجة | 2 | 🔴 |
| مشاكل اللغة | 2 | 🟡 |
| مشاكل UI | 2 | 🟡 |
| مشاكل وظيفية | 2 | 🟡 |
| أخطاء برمجية | 2 | 🔴 |
| **المجموع** | **10** | - |

---

## 🎯 الخطوات التالية

### المرحلة 1: إصلاحات عاجلة (1-2 يوم)
1. إصلاح مشكلة التنقل في ChefDashboardScreen
2. إصلاح التنقل التلقائي في RootNavigator
3. إضافة Alert import

### المرحلة 2: تحسينات متوسطة (3-5 أيام)
1. إنشاء نظام الترجمة
2. تحسين الأزرار والواجهة
3. فصل منطق المصادقة

### المرحلة 3: تحسينات طويلة المدى (1-2 أسبوع)
1. تحسين إدارة الحالة
2. إضافة اختبارات
3. تحسين الأداء

---

## 📝 ملاحظات إضافية

### نقاط قوة التطبيق ✅
- تصميم جميل ومتناسق
- استخدام TypeScript
- مكونات قابلة لإعادة الاستخدام
- دعم Firebase

### نقاط تحتاج تحسين ⚠️
- التنقل بين الصفحات
- نظام الترجمة
- إدارة الحالة
- الاختبارات

---

**تم إعداد التقرير بواسطة:** Amazon Q  
**التاريخ:** ${new Date().toLocaleDateString('ar-KW')}  
**الإصدار:** 1.0
