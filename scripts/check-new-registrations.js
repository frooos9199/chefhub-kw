#!/usr/bin/env node

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'chefhub-kw.firebasestorage.app'
  });
}

const db = admin.firestore();

async function checkRegistrations() {
  console.log('\n🔍 فحص التسجيلات الجديدة...\n');
  
  try {
    // Get all users with role 'chef'
    console.log('1️⃣ المستخدمون في users collection:');
    console.log('='.repeat(70));
    const usersSnapshot = await db.collection('users').where('role', '==', 'chef').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ لا يوجد مستخدمون بدور "chef" في users collection');
    } else {
      console.log(`✅ عدد المستخدمين: ${usersSnapshot.size}\n`);
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'بدون اسم'}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   البريد: ${data.email}`);
        console.log(`   الهاتف: ${data.phone || 'غير محدد'}`);
        console.log(`   الحالة: ${data.isActive ? '✅ نشط' : '❌ غير نشط'}`);
        console.log(`   التاريخ: ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString('ar-KW') : 'غير محدد'}`);
        console.log('');
      });
    }

    // Get all chefs
    console.log('\n2️⃣ الشيفات في chefs collection:');
    console.log('='.repeat(70));
    const chefsSnapshot = await db.collection('chef').get();
    
    if (chefsSnapshot.empty) {
      console.log('❌ لا يوجد شيفات في chefs collection');
    } else {
      console.log(`✅ عدد الشيفات: ${chefsSnapshot.size}\n`);
      chefsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'بدون اسم'}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   البريد: ${data.email}`);
        console.log(`   اسم العمل: ${data.businessName || 'غير محدد'}`);
        console.log(`   الحالة: ${data.status || 'غير محدد'}`);
        console.log(`   نشط: ${data.isActive ? '✅' : '❌'}`);
        console.log(`   الاقرار القانوني: ${data.legalAgreement ? '✅ موقع' : '❌ غير موقع'}`);
        if (data.legalAgreement) {
          console.log(`   التوقيع: ${data.legalAgreement.signature || 'لا يوجد'}`);
          console.log(`   تاريخ التوقيع: ${data.legalAgreement.signatureDate || 'لا يوجد'}`);
        }
        console.log(`   التاريخ: ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString('ar-KW') : 'غير محدد'}`);
        console.log('');
      });
    }

    // Compare
    console.log('\n3️⃣ المقارنة:');
    console.log('='.repeat(70));
    console.log(`عدد المستخدمين (role=chef): ${usersSnapshot.size}`);
    console.log(`عدد الشيفات في chefs collection: ${chefsSnapshot.size}`);
    
    if (usersSnapshot.size > chefsSnapshot.size) {
      console.log('\n⚠️ تحذير: يوجد مستخدمون بدور chef لكن ليس لديهم وثيقة في chefs collection!');
      
      const chefIds = new Set();
      chefsSnapshot.forEach(doc => chefIds.add(doc.id));
      
      console.log('\nالمستخدمون الناقصون:');
      usersSnapshot.forEach(doc => {
        if (!chefIds.has(doc.id)) {
          const data = doc.data();
          console.log(`- ${data.name} (${doc.id})`);
        }
      });
    } else if (usersSnapshot.size < chefsSnapshot.size) {
      console.log('\n⚠️ تحذير: يوجد شيفات في chefs collection لكن ليس لديهم حساب في users collection!');
    } else {
      console.log('\n✅ التطابق صحيح!');
    }

    // Check recent registrations (last 7 days)
    console.log('\n4️⃣ التسجيلات الحديثة (آخر 7 أيام):');
    console.log('='.repeat(70));
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentChefs = await db.collection('chef')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
      .get();
    
    if (recentChefs.empty) {
      console.log('❌ لا يوجد تسجيلات جديدة في آخر 7 أيام');
    } else {
      console.log(`✅ عدد التسجيلات الجديدة: ${recentChefs.size}\n`);
      recentChefs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'بدون اسم'}`);
        console.log(`   البريد: ${data.email}`);
        console.log(`   الحالة: ${data.status}`);
        console.log(`   التاريخ: ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString('ar-KW') : 'غير محدد'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

checkRegistrations().then(() => {
  console.log('\n✅ انتهى الفحص');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
