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

async function checkDishChef() {
  const dishId = 'iW9f2Ex8xKzFOBtgCPN0';
  
  console.log(`\n🔍 فحص المنتج: ${dishId}\n`);
  console.log('='.repeat(70));
  
  try {
    // Get dish
    const dishDoc = await db.collection('dishes').doc(dishId).get();
    
    if (!dishDoc.exists) {
      console.log('❌ المنتج غير موجود!');
      return;
    }
    
    const dishData = dishDoc.data();
    console.log('\n📦 بيانات المنتج:');
    console.log(`   الاسم: ${dishData.nameAr || dishData.name || 'غير محدد'}`);
    console.log(`   chefId: ${dishData.chefId || '❌ غير موجود'}`);
    console.log(`   الحالة: ${dishData.status || 'غير محدد'}`);
    console.log(`   متاح: ${dishData.isAvailable ? '✅' : '❌'}`);
    
    if (!dishData.chefId) {
      console.log('\n⚠️ المشكلة: المنتج ليس له chefId!');
      return;
    }
    
    // Get chef
    console.log(`\n👨‍🍳 جلب بيانات الشيف من collection "chefs"...`);
    const chefDoc = await db.collection('chefs').doc(dishData.chefId).get();
    
    if (!chefDoc.exists) {
      console.log(`\n❌ الشيف غير موجود في chefs collection!`);
      console.log(`   chefId المطلوب: ${dishData.chefId}`);
      
      // Check if chef exists in users collection
      const userDoc = await db.collection('users').doc(dishData.chefId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log(`\n⚠️ الشيف موجود في users collection:`);
        console.log(`   الاسم: ${userData.name}`);
        console.log(`   الدور: ${userData.role}`);
        console.log(`\n💡 الحل: يجب نسخ البيانات من users إلى chefs collection`);
      } else {
        console.log(`\n❌ الشيف غير موجود في users collection أيضاً!`);
      }
      return;
    }
    
    const chefData = chefDoc.data();
    console.log(`\n✅ بيانات الشيف:`);
    console.log(`   الاسم: ${chefData.name}`);
    console.log(`   اسم العمل: ${chefData.businessName || 'غير محدد'}`);
    console.log(`   التقييم: ${chefData.rating || 0}`);
    console.log(`   الطلبات: ${chefData.totalOrders || 0}`);
    console.log(`   الصورة: ${chefData.profileImage ? '✅ موجودة' : '❌ غير موجودة'}`);
    console.log(`   الحالة: ${chefData.status || 'غير محدد'}`);
    
    console.log('\n✅ كل شيء يبدو صحيحاً! معلومات الشيف يجب أن تظهر.');
    
  } catch (error) {
    console.error('\n❌ خطأ:', error);
  }
}

checkDishChef().then(() => {
  console.log('\n' + '='.repeat(70));
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
