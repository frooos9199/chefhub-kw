// ============================================
// ChefHub - Seed Test Users Script
// ============================================
// This script creates test users in Firebase
// Run: node scripts/seed-users.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You need to download this from Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// Test users data
const testUsers = [
  {
    email: 'admin@chif.com',
    password: '123123',
    role: 'admin',
    displayName: 'Admin',
    userData: {
      email: 'admin@chif.com',
      name: 'مدير المنصة',
      role: 'admin',
      phone: '+96550000000',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    email: 'chef@chif.com',
    password: '123123',
    role: 'chef',
    displayName: 'Chef Test',
    userData: {
      email: 'chef@chif.com',
      name: 'الشيف أحمد',
      role: 'chef',
      phone: '+96550000001',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    chefData: {
      userId: '', // Will be filled with auth UID
      name: 'الشيف أحمد',
      nameEn: 'Chef Ahmed',
      email: 'chef@chif.com',
      phone: '+96550000001',
      specialty: 'مأكولات كويتية',
      specialtyEn: 'Kuwaiti Cuisine',
      bio: 'شيف متخصص في الأكلات الكويتية التقليدية مع لمسة عصرية',
      bioEn: 'Chef specialized in traditional Kuwaiti cuisine with a modern twist',
      governorate: 'حولي',
      area: 'السالمية',
      address: 'شارع سالم المبارك',
      profileImage: 'https://via.placeholder.com/300x300?text=Chef+Ahmed',
      rating: 4.8,
      reviewCount: 42,
      orderCount: 150,
      status: 'active',
      isApproved: true,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      deliveryAreas: ['حولي', 'السالمية', 'الجابرية', 'مشرف'],
      minOrder: 5,
      deliveryFee: 1.5,
      preparationTime: 60,
      acceptsOrders: true,
      workingHours: {
        saturday: { open: '09:00', close: '22:00', isOpen: true },
        sunday: { open: '09:00', close: '22:00', isOpen: true },
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '14:00', close: '23:00', isOpen: true }
      },
      bankDetails: {
        bankName: 'بنك الكويت الوطني',
        accountName: 'أحمد محمد',
        accountNumber: '1234567890',
        iban: 'KW81CBKU0000000000001234567890'
      },
      documents: {
        civilIdFront: '',
        civilIdBack: '',
        healthCertificate: '',
        commercialLicense: ''
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    email: 'user@chif.com',
    password: '123123',
    role: 'customer',
    displayName: 'Customer Test',
    userData: {
      email: 'user@chif.com',
      name: 'محمد العميل',
      role: 'customer',
      phone: '+96550000002',
      governorate: 'حولي',
      area: 'السالمية',
      address: 'شارع البلدية',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Starting to create test users...\n');

  for (const user of testUsers) {
    try {
      // Create authentication user
      console.log(`Creating auth user: ${user.email}...`);
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true
      });

      console.log(`✅ Auth user created: ${userRecord.uid}`);

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        ...user.userData,
        uid: userRecord.uid
      });

      console.log(`✅ User document created in Firestore`);

      // If chef, create chef document
      if (user.role === 'chef' && user.chefData) {
        user.chefData.userId = userRecord.uid;
        const chefRef = await db.collection('chefs').add(user.chefData);
        console.log(`✅ Chef document created: ${chefRef.id}`);
        
        // Update user document with chefId
        await db.collection('users').doc(userRecord.uid).update({
          chefId: chefRef.id
        });
        console.log(`✅ User updated with chefId`);
      }

      console.log(`\n✨ Successfully created ${user.role}: ${user.email}\n`);
      console.log('━'.repeat(50) + '\n');

    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User ${user.email} already exists, skipping...\n`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Test users creation complete!\n');
  console.log('Login credentials:');
  console.log('━'.repeat(50));
  console.log('Admin:    admin@chif.com / 123123');
  console.log('Chef:     chef@chif.com  / 123123');
  console.log('Customer: user@chif.com  / 123123');
  console.log('━'.repeat(50) + '\n');
}

// Run the script
createTestUsers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
