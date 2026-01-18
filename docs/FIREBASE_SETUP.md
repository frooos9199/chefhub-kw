# 🔥 Firebase Setup Guide - ChefHub

## 📋 Overview
This guide will help you set up Firebase for the ChefHub project.

## 🚀 Quick Start

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Name your project: `chefhub-kw`
4. Enable Google Analytics (optional)
5. Create the project

### 2. Enable Firebase Services

#### Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable:
   - ✅ Email/Password
   - ✅ Google (optional)
3. Click **Save**

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Test mode** (we'll apply rules later)
4. Select location: `us-central1` or closest to Kuwait
5. Click **Enable**

#### Storage
1. Go to **Storage**
2. Click **Get Started**
3. Start in **Test mode**
4. Click **Next** → **Done**

### 3. Get Firebase Configuration

1. Go to **Project Settings** (⚙️ icon)
2. Scroll down to **Your apps**
3. Click **Web** (</>) icon
4. Register app name: `ChefHub Web`
5. Copy the `firebaseConfig` object

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Paste your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chefhub-kw.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=chefhub-kw
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chefhub-kw.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
   ```

### 5. Deploy Security Rules

#### Firestore Rules

1. Copy the contents of `firestore.rules`
2. Go to **Firestore Database** → **Rules** tab
3. Paste the rules
4. Click **Publish**

Or use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

#### Storage Rules

1. Copy the contents of `storage.rules`
2. Go to **Storage** → **Rules** tab
3. Paste the rules
4. Click **Publish**

Or use Firebase CLI:
```bash
firebase deploy --only storage:rules
```

### 6. Create Firestore Collections

The app will automatically create collections when you first use them. But you can create them manually:

1. Go to **Firestore Database** → **Data** tab
2. Click **Start collection**
3. Create these collections:
   - `users`
   - `chefs`
   - `dishes`
   - `orders`
   - `specialOrders`
   - `reviews`
   - `notifications`
   - `invoices`

### 7. Create First Admin User

1. Go to **Authentication** → **Users** tab
2. Click **Add User**
3. Enter email: `admin@chefhub.kw`
4. Enter password: (choose a strong password)
5. Click **Add User**
6. Copy the **User UID**

7. Go to **Firestore Database**
8. Click **Start collection** → `users`
9. Document ID: (paste the User UID)
10. Add fields:
    ```json
    {
      "email": "admin@chefhub.kw",
      "name": "Admin",
      "phone": "+965 2222 2222",
      "role": "admin",
      "status": "active",
      "createdAt": (Click: Insert field → Timestamp),
      "updatedAt": (Click: Insert field → Timestamp)
    }
    ```

## 📦 Firebase SDK Files Created

```
lib/firebase/
├── config.ts        # Firebase initialization
├── firestore.ts     # Firestore CRUD operations
├── storage.ts       # Storage upload/delete operations
├── hooks.ts         # React hooks for real-time data
```

## 🔧 Usage Examples

### Reading Data
```typescript
import { useActiveChefs } from '@/lib/firebase/hooks';

function ChefsPage() {
  const { data: chefs, loading, error } = useActiveChefs();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {chefs.map(chef => (
        <div key={chef.id}>{chef.name}</div>
      ))}
    </div>
  );
}
```

### Creating Data
```typescript
import { chef } from '@/lib/firebase/firestore';

async function createChef(data) {
  try {
    const newChef = await chefs.create(data, userId);
    console.log('Chef created:', newChef);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Uploading Images
```typescript
import { uploadImageWithCompression } from '@/lib/firebase/storage';

async function uploadProfileImage(file: File, chefId: string) {
  try {
    const url = await uploadImageWithCompression(
      file,
      `chefs/${chefId}/profile/${file.name}`,
      1200,
      0.8,
      (progress) => console.log(`Upload: ${progress}%`)
    );
    console.log('Image URL:', url);
  } catch (error) {
    console.error('Upload error:', error);
  }
}
```

## 🔐 Security Rules Overview

### Firestore Rules
- **Users**: Can create/read/update their own profile
- **Chefs**: Can create/update their own profile, everyone can read active chefs
- **Dishes**: Chefs can manage their dishes, everyone can read active dishes
- **Orders**: Customers/chef can read their orders, only chef can update status
- **Reviews**: Anyone can read, customers can create
- **Admins**: Full access to everything

### Storage Rules
- **Images**: Max 5MB per file
- **Documents**: Max 10MB per file (PDF or images)
- **Chefs**: Can upload to their own folders
- **Public**: Can read all uploaded files

## 🛠️ Testing

### Local Development
```bash
npm run dev
```

### Test with Firebase Emulators (Optional)
```bash
# Install emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

Update `lib/firebase/config.ts` to use emulators:
```typescript
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## 📊 Firestore Data Structure

```
users/
  {userId}/
    - email
    - name
    - phone
    - role (customer|chef|admin)
    - status
    - createdAt
    - updatedAt

chefs/
  {chefId}/
    - name
    - bio
    - specialty
    - governorate
    - status (pending|active|suspended)
    - rating
    - totalOrders
    - documents/
    - settings/

dishes/
  {dishId}/
    - chefId
    - nameAr
    - nameEn
    - price
    - images[]
    - isActive
    - createdAt

orders/
  {orderId}/
    - orderNumber
    - customerId
    - chefId
    - items[]
    - total
    - status
    - createdAt
```

## 🚨 Important Notes

1. **Never commit `.env.local`** - Contains sensitive API keys
2. **Test Security Rules** - Always test rules before deploying
3. **Enable Billing** - Required for Cloud Functions and some features
4. **Backup Data** - Set up daily backups in Firebase Console
5. **Monitor Usage** - Check Firebase Console for usage quotas

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Pricing](https://firebase.google.com/pricing)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Security Rules](https://firebase.google.com/docs/rules)

## ✅ Checklist

- [ ] Created Firebase project
- [ ] Enabled Authentication
- [ ] Enabled Firestore Database
- [ ] Enabled Storage
- [ ] Got Firebase configuration
- [ ] Created `.env.local`
- [ ] Deployed Firestore rules
- [ ] Deployed Storage rules
- [ ] Created first admin user
- [ ] Tested authentication
- [ ] Tested data read/write

---

**Need help?** Check the [Firebase Console](https://console.firebase.google.com/) or contact the development team.
