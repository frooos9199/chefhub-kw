#!/usr/bin/env node

/**
 * التحقق من الحسابات التجريبية وإنشائها إذا لزم الأمر
 * الحسابات:
 * - customer@chif.com / 123123
 * - chef@chif.com / 123123
 * - admin@chif.com / 123123
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

const testAccounts = [
  {
    email: 'customer@chif.com',
    password: '123123',
    role: 'customer',
    displayName: 'Test Customer',
    userData: {
      email: 'customer@chif.com',
      name: 'عميل تجريبي',
      role: 'customer',
      phone: '+96550000010',
      isActive: true,
    }
  },
  {
    email: 'chef@chif.com',
    password: '123123',
    role: 'chef',
    displayName: 'Test Chef',
    userData: {
      email: 'chef@chif.com',
      name: 'شيف تجريبي',
      role: 'chef',
      phone: '+96550000011',
      isActive: true,
    }
  },
  {
    email: 'admin@chif.com',
    password: '123123',
    role: 'admin',
    displayName: 'Test Admin',
    userData: {
      email: 'admin@chif.com',
      name: 'أدمن تجريبي',
      role: 'admin',
      phone: '+96550000012',
      isActive: true,
    }
  }
];

async function checkAndCreateAccount(account) {
  try {
    // التحقق من Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(account.email);
      console.log(`✅ Auth: ${account.email} موجود (UID: ${userRecord.uid})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️  Auth: ${account.email} غير موجود - جاري الإنشاء...`);
        userRecord = await auth.createUser({
          email: account.email,
          password: account.password,
          displayName: account.displayName,
          emailVerified: true
        });
        console.log(`✅ تم إنشاء: ${account.email} في Auth (UID: ${userRecord.uid})`);
      } else {
        throw error;
      }
    }

    // التحقق من Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      console.log(`⚠️  Firestore: بيانات ${account.email} غير موجودة - جاري الإنشاء...`);
      await db.collection('users').doc(userRecord.uid).set({
        ...account.userData,
        uid: userRecord.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ تم إنشاء بيانات ${account.email} في Firestore`);
    } else {
      console.log(`✅ Firestore: بيانات ${account.email} موجودة`);
      
      // تحديث البيانات إذا كانت ناقصة
      const data = userDoc.data();
      if (!data.role || data.role !== account.role) {
        await db.collection('users').doc(userRecord.uid).update({
          role: account.role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ تم تحديث دور ${account.email} إلى ${account.role}`);
      }
    }

    return {
      email: account.email,
      uid: userRecord.uid,
      status: 'active'
    };

  } catch (error) {
    console.error(`❌ خطأ في معالجة ${account.email}:`, error.message);
    return {
      email: account.email,
      status: 'error',
      error: error.message
    };
  }
}

async function verifyTestAccounts() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 التحقق من الحسابات التجريبية');
  console.log('='.repeat(60) + '\n');

  const results = [];

  for (const account of testAccounts) {
    console.log(`\n📋 فحص: ${account.email}`);
    console.log('─'.repeat(50));
    
    const result = await checkAndCreateAccount(account);
    results.push(result);
    
    console.log('─'.repeat(50));
  }

  // عرض التقرير النهائي
  console.log('\n' + '='.repeat(60));
  console.log('📊 التقرير النهائي');
  console.log('='.repeat(60) + '\n');

  const activeCount = results.filter(r => r.status === 'active').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log(`✅ حسابات فعالة: ${activeCount}/${testAccounts.length}`);
  console.log(`❌ حسابات بها مشاكل: ${errorCount}/${testAccounts.length}\n`);

  if (activeCount === testAccounts.length) {
    console.log('🎉 جميع الحسابات التجريبية فعالة وجاهزة للاستخدام!\n');
    console.log('معلومات الدخول:');
    console.log('─'.repeat(60));
    console.log('عميل:  customer@chif.com / 123123');
    console.log('شيف:   chef@chif.com     / 123123');
    console.log('أدمن:  admin@chif.com    / 123123');
    console.log('─'.repeat(60) + '\n');
  } else {
    console.log('⚠️  بعض الحسابات تحتاج إلى انتباه!\n');
    results.forEach(r => {
      if (r.status === 'error') {
        console.log(`❌ ${r.email}: ${r.error}`);
      }
    });
  }

  // اختبار تسجيل الدخول
  console.log('\n' + '='.repeat(60));
  console.log('🧪 اختبار تسجيل الدخول');
  console.log('='.repeat(60) + '\n');

  for (const account of testAccounts) {
    try {
      const userRecord = await auth.getUserByEmail(account.email);
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log(`✅ ${account.email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   الدور: ${userData.role}`);
        console.log(`   الحالة: ${userData.isActive ? 'فعال' : 'معطل'}`);
      } else {
        console.log(`⚠️  ${account.email} - البيانات غير موجودة في Firestore`);
      }
    } catch (error) {
      console.log(`❌ ${account.email} - خطأ: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// تشغيل السكريبت
verifyTestAccounts()
  .then(() => {
    console.log('✅ اكتمل الفحص بنجاح\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل السكريبت:', error);
    process.exit(1);
  });
