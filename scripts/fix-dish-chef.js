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

async function fixDishChefId() {
  const dishId = 'iW9f2Ex8xKzFOBtgCPN0';
  const correctChefId = 'rhuuSrhqUQcNuSKntj9jw2FhN9H3';
  
  console.log(`\n🔧 إصلاح chefId للمنتج: ${dishId}\n`);
  console.log('='.repeat(70));
  
  try {
    // Update dish
    await db.collection('dishes').doc(dishId).update({
      chefId: correctChefId
    });
    
    console.log(`✅ تم تحديث chefId للمنتج`);
    console.log(`   من: rzWJbpJAOfOQagDpVZChass8eTl2`);
    console.log(`   إلى: ${correctChefId}`);
    
    // Verify
    const dishDoc = await db.collection('dishes').doc(dishId).get();
    const dishData = dishDoc.data();
    console.log(`\n✓ التحقق: chefId الجديد = ${dishData.chefId}`);
    
    // Get chef data
    const chefDoc = await db.collection('chefs').doc(correctChefId).get();
    const chefData = chefDoc.data();
    console.log(`✓ الشيف: ${chefData.name}`);
    
  } catch (error) {
    console.error('\n❌ خطأ:', error);
  }
}

fixDishChefId().then(() => {
  console.log('\n' + '='.repeat(70));
  console.log('✅ تم الإصلاح! الآن معلومات الشيف يجب أن تظهر.');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
