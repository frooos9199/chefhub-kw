#!/usr/bin/env node

/**
 * سكريبت اختبار Firebase - التحقق من الاتصال والصلاحيات
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log('🔥 اختبار اتصال Firebase...\n');

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
  console.log('✅ تم تهيئة Firebase Admin بنجاح');
} catch (error) {
  console.error('❌ فشل تهيئة Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function testFirebase() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 فحص الإعدادات');
  console.log('='.repeat(60));
  
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Storage Bucket:', bucket.name);
  console.log();

  // Test 1: Firestore Write
  console.log('🧪 اختبار 1: كتابة في Firestore...');
  try {
    const testDoc = await db.collection('_test').add({
      message: 'Test from script',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ نجح! Document ID:', testDoc.id);
    
    // Delete test document
    await testDoc.delete();
    console.log('🗑️  تم حذف المستند التجريبي');
  } catch (error) {
    console.error('❌ فشل:', error.message);
  }

  // Test 2: Check dishes collection
  console.log('\n🧪 اختبار 2: قراءة الأطباق من Firestore...');
  try {
    const dishesSnapshot = await db.collection('dishes').limit(5).get();
    console.log(`✅ نجح! عدد الأطباق: ${dishesSnapshot.size}`);
    
    if (dishesSnapshot.size > 0) {
      console.log('\nآخر الأطباق:');
      dishesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.nameAr || data.name} (ID: ${doc.id})`);
      });
    } else {
      console.log('⚠️  لا توجد أطباق في قاعدة البيانات');
    }
  } catch (error) {
    console.error('❌ فشل:', error.message);
  }

  // Test 3: Storage Access
  console.log('\n🧪 اختبار 3: الوصول إلى Storage...');
  try {
    const [files] = await bucket.getFiles({ maxResults: 5 });
    console.log(`✅ نجح! عدد الملفات: ${files.length}`);
    
    if (files.length > 0) {
      console.log('\nأحدث الملفات:');
      files.forEach(file => {
        console.log(`  - ${file.name} (${(file.metadata.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('⚠️  لا توجد ملفات في Storage');
    }
  } catch (error) {
    console.error('❌ فشل:', error.message);
    console.log('💡 تأكد من تفعيل Firebase Storage في Console');
  }

  // Test 4: Check Storage Rules
  console.log('\n🧪 اختبار 4: فحص قواعد Storage...');
  try {
    const [metadata] = await bucket.getMetadata();
    console.log('✅ Storage متاح');
    console.log('Location:', metadata.location);
    console.log('Storage Class:', metadata.storageClass);
  } catch (error) {
    console.error('❌ فشل:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ اكتمل الفحص!');
  console.log('='.repeat(60) + '\n');
  
  console.log('💡 النصائح:');
  console.log('   1. إذا فشل اختبار Firestore - تحقق من Firestore Rules');
  console.log('   2. إذا فشل اختبار Storage - تأكد من تفعيل Storage في Console');
  console.log('   3. إذا نجحت كل الاختبارات - المشكلة في الكود Frontend');
  console.log();
}

testFirebase()
  .then(() => {
    console.log('🎉 انتهى الاختبار بنجاح!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل الاختبار:', error);
    process.exit(1);
  });
