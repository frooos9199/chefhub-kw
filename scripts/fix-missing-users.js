#!/usr/bin/env node

/**
 * Script لإصلاح المستخدمين المفقودين في Firestore
 * يقوم بالبحث عن مستخدمين في Firebase Auth وإنشاء بياناتهم في Firestore
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const auth = admin.auth();
const db = admin.firestore();

async function fixMissingUsers() {
  console.log('🔍 جاري البحث عن المستخدمين المفقودين...\n');

  try {
    // Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;

    console.log(`✅ تم العثور على ${authUsers.length} مستخدم في Firebase Auth\n`);

    let fixedCount = 0;
    let existingCount = 0;

    for (const authUser of authUsers) {
      try {
        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(authUser.uid).get();

        if (!userDoc.exists) {
          console.log(`⚠️  المستخدم مفقود: ${authUser.email}`);
          
          // Create default user data
          const userData = {
            email: authUser.email,
            name: authUser.displayName || authUser.email.split('@')[0],
            phone: authUser.phoneNumber || '',
            role: 'customer', // افتراضياً customer
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          // Create user document in Firestore
          await db.collection('users').doc(authUser.uid).set(userData);
          
          console.log(`✅ تم إنشاء بيانات المستخدم: ${authUser.email}\n`);
          fixedCount++;
        } else {
          existingCount++;
        }
      } catch (error) {
        console.error(`❌ خطأ في معالجة المستخدم ${authUser.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 النتائج:');
    console.log(`   ✅ موجودين بالفعل: ${existingCount}`);
    console.log(`   🔧 تم إصلاحهم: ${fixedCount}`);
    console.log(`   📊 الإجمالي: ${authUsers.length}`);
    console.log('='.repeat(50) + '\n');

    if (fixedCount > 0) {
      console.log('✨ تم إصلاح جميع المستخدمين المفقودين بنجاح!');
    } else {
      console.log('✅ جميع المستخدمين موجودين في Firestore');
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }

  process.exit(0);
}

// تشغيل السكريبت
fixMissingUsers();
