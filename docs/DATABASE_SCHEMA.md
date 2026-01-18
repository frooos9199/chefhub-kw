# 🔥 ChefHub - Firebase Database Schema

## 📊 Collections Structure

### 1️⃣ **users** - المستخدمون
```typescript
{
  id: string (UID من Firebase Auth)
  email: string
  phone: string (+965xxxxxxxx)
  name: string
  role: 'customer' | 'chef' | 'admin'
  createdAt: timestamp
  updatedAt: timestamp
  isActive: boolean
}
```

### 2️⃣ **chefs** - الشيفات
```typescript
{
  id: string (نفس UID المستخدم)
  userId: string (مرجع للمستخدم)
  
  // المعلومات الأساسية
  businessName: string
  specialty: string[] // ['عربي', 'إيطالي', 'حلويات']
  bio: string
  profileImage: string (URL)
  coverImage: string (URL)
  kitchenImages: string[] (URLs)
  license: string (URL - رخصة العمل)
  
  // الحالة
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  approvedAt: timestamp
  approvedBy: string (Admin ID)
  
  // التوصيل
  deliveryGovernorates: string[] // ['capital', 'hawalli']
  deliveryFees: {
    capital: number,
    hawalli: number,
    farwaniya: number,
    ahmadi: number,
    jahra: number,
    mubarak: number
  }
  
  // ساعات العمل
  workingHours: {
    sunday: { open: '09:00', close: '22:00', isOpen: true },
    monday: { open: '09:00', close: '22:00', isOpen: true },
    // ... باقي الأيام
  }
  
  // التواصل والإشعارات
  whatsappNumber: string (+965xxxxxxxx)
  receiveEmailNotifications: boolean
  receiveWhatsAppNotifications: boolean
  notificationPreferences: {
    newOrder: boolean,
    orderAccepted: boolean,
    orderReady: boolean,
    orderDelivered: boolean,
    orderCancelled: boolean,
    newReview: boolean,
    dailySummary: boolean
  }
  
  // الإحصائيات
  rating: number (0-5)
  totalRatings: number
  totalOrders: number
  totalRevenue: number (KWD)
  commission: number (%) // نسبة العمولة
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3️⃣ **dishes** - الأصناف
```typescript
{
  id: string (auto-generated)
  chefId: string (مرجع للشيف)
  
  // المعلومات
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  price: number (KWD - 3 decimal places)
  images: string[] (URLs)
  category: string // 'main', 'appetizer', 'dessert', 'drinks'
  
  // الحالة
  isAvailable: boolean
  preparationTime: number (minutes)
  
  // الإحصائيات
  totalOrders: number
  viewCount: number
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4️⃣ **special_orders** - الطلبات الخاصة
```typescript
{
  id: string (auto-generated)
  chefId: string
  
  // المعلومات
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  price: number (KWD)
  images: string[]
  
  // الحد والتوقيت
  maxOrders: number // الحد الأقصى
  currentOrders: number // العدد الحالي
  startDate: timestamp
  endDate: timestamp
  deliveryDate: timestamp (optional)
  
  // الحالة
  isActive: boolean // الشيف يفتح/يقفل
  isFull: boolean // نفذت الكمية
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 5️⃣ **orders** - الطلبات
```typescript
{
  id: string (auto-generated)
  orderNumber: string (CH-12345678-001)
  
  // الأطراف
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  
  chefId: string
  chefName: string
  chefEmail: string
  chefWhatsApp: string
  
  // العناصر
  items: [{
    dishId: string,
    dishName: string,
    quantity: number,
    price: number,
    specialInstructions: string (optional)
  }]
  
  isSpecialOrder: boolean
  specialOrderId: string (optional)
  
  // الأسعار (KWD)
  subtotal: number
  deliveryFee: number
  total: number
  commission: number // عمولة المنصة
  chefEarnings: number // أرباح الشيف
  
  // العنوان
  deliveryAddress: {
    governorate: string,
    area: string,
    block: string,
    street: string,
    building: string,
    floor: string,
    apartment: string,
    additionalInfo: string,
    phone: string
  }
  
  // الحالة
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentMethod: string // 'knet', 'credit_card', 'cash'
  
  // التواريخ
  createdAt: timestamp
  acceptedAt: timestamp (optional)
  preparingAt: timestamp (optional)
  readyAt: timestamp (optional)
  deliveredAt: timestamp (optional)
  cancelledAt: timestamp (optional)
  
  // ملاحظات
  customerNotes: string (optional)
  chefNotes: string (optional)
  cancellationReason: string (optional)
}
```

### 6️⃣ **reviews** - التقييمات
```typescript
{
  id: string (auto-generated)
  orderId: string
  customerId: string
  customerName: string
  chefId: string
  
  rating: number (1-5)
  comment: string (optional)
  
  isHidden: boolean // الأدمن يخفي التقييمات غير المناسبة
  hiddenBy: string (Admin ID - optional)
  hiddenReason: string (optional)
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 7️⃣ **invoices** - الفواتير
```typescript
{
  id: string (auto-generated)
  orderId: string
  invoiceNumber: string (INV-12345678-001)
  
  items: [{
    dishName: string,
    quantity: number,
    price: number
  }]
  
  subtotal: number
  deliveryFee: number
  total: number
  
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  
  pdfUrl: string (optional)
  
  createdAt: timestamp
}
```

### 8️⃣ **notifications** - الإشعارات (داخل التطبيق)
```typescript
{
  id: string (auto-generated)
  userId: string
  type: 'order' | 'payment' | 'review' | 'system'
  
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  
  isRead: boolean
  link: string (optional) // رابط للانتقال
  
  createdAt: timestamp
}
```

### 9️⃣ **whatsapp_notifications** - إشعارات الواتساب
```typescript
{
  id: string (auto-generated)
  recipientPhone: string
  recipientName: string
  recipientRole: 'chef' | 'customer' | 'admin'
  
  notificationType: 'new_order' | 'order_accepted' | 'order_preparing' | ...
  orderId: string (optional)
  orderNumber: string (optional)
  
  message: string (Arabic)
  messageEn: string (optional)
  
  metadata: object (optional)
  
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt: timestamp (optional)
  deliveredAt: timestamp (optional)
  errorMessage: string (optional)
  
  createdAt: timestamp
}
```

### 🔟 **email_notifications** - إشعارات الإيميل
```typescript
{
  id: string (auto-generated)
  recipientEmail: string
  recipientName: string
  recipientRole: 'chef' | 'customer' | 'admin'
  
  emailType: 'order_confirmation' | 'order_status_update' | 'invoice' | ...
  subject: string
  htmlContent: string
  
  attachments: [{
    filename: string,
    content: string,
    type: string
  }] (optional)
  
  orderId: string (optional)
  invoiceId: string (optional)
  
  status: 'pending' | 'sent' | 'failed'
  sentAt: timestamp (optional)
  errorMessage: string (optional)
  
  createdAt: timestamp
}
```

### 1️⃣1️⃣ **audit_logs** - سجل التعديلات
```typescript
{
  id: string (auto-generated)
  userId: string
  userName: string
  userRole: 'chef' | 'admin'
  
  action: string // 'create', 'update', 'delete', 'approve', 'reject'
  entity: string // 'chef', 'dish', 'order', 'review'
  entityId: string
  
  changes: object // البيانات القديمة والجديدة
  
  ipAddress: string
  userAgent: string
  
  createdAt: timestamp
}
```

### 1️⃣2️⃣ **settings** - إعدادات النظام
```typescript
{
  id: 'system_settings' (single document)
  
  // العمولة
  defaultCommission: number (%) // النسبة الافتراضية
  
  // المحافظات
  governorates: [{
    id: string,
    nameEn: string,
    nameAr: string,
    isActive: boolean,
    areas: string[]
  }]
  
  // الإعدادات العامة
  maintenanceMode: boolean
  allowNewRegistrations: boolean
  allowNewOrders: boolean
  
  updatedAt: timestamp
  updatedBy: string (Admin ID)
}
```

---

## 🔐 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isChef() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'chef';
    }
    
    function isAdmin() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users Collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Chefs Collection
    match /chef/{chefId} {
      allow read: if true; // الكل يقدر يشوف الشيفات
      allow create: if isOwner(chefId);
      allow update: if isOwner(chefId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Dishes Collection
    match /dishes/{dishId} {
      allow read: if true; // الكل يقدر يشوف الأصناف
      allow create: if isChef();
      allow update: if isChef() && resource.data.chefId == request.auth.uid;
      allow delete: if (isChef() && resource.data.chefId == request.auth.uid) || isAdmin();
    }
    
    // Orders Collection
    match /orders/{orderId} {
      allow read: if isSignedIn() && (
        resource.data.customerId == request.auth.uid ||
        resource.data.chefId == request.auth.uid ||
        isAdmin()
      );
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (
        resource.data.chefId == request.auth.uid ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }
    
    // Reviews Collection
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.customerId;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Admin only collections
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    match /settings/{settingId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

---

## 📝 ملاحظات مهمة

1. **الأسعار**: جميع الأسعار بالدينار الكويتي (KWD) مع 3 خانات عشرية (0.000)
2. **أرقام الجوال**: يجب أن تبدأ بـ +965
3. **الصور**: تُخزن في Firebase Storage والـ URLs في Firestore
4. **الإشعارات**: نظام متعدد القنوات (داخل التطبيق + إيميل + واتساب)
5. **Audit Log**: تسجيل جميع التعديلات الحساسة
6. **Real-time**: استخدام Firestore Realtime Listeners للإحصائيات والإشعارات

---

**تم التوثيق بواسطة:** NexDev ✨
