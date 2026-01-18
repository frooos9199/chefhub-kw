// ============================================
// ChefHub - Check Data Script
// ============================================
// This script checks the current data in Firestore
// Run: node scripts/check-data.js

const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkData() {
  try {
    console.log('🔍 جاري فحص البيانات في Firestore...\n');

    // Check chefs
    const chefsSnapshot = await db.collection('chef').get();
    console.log(`📊 الشيفات: ${chefsSnapshot.size} شيف`);
    
    let activeChefs = 0;
    chefsSnapshot.forEach(doc => {
      const chef = doc.data();
      if (chef.status === 'active') {
        activeChefs++;
        console.log(`  ✅ ${chef.name} - ${chef.status}`);
      } else {
        console.log(`  ⏸️  ${chef.name} - ${chef.status}`);
      }
    });
    console.log(`  → نشطين: ${activeChefs}\n`);

    // Check dishes
    const dishesSnapshot = await db.collection('dishes').get();
    console.log(`📊 الأصناف: ${dishesSnapshot.size} صنف`);
    
    const dishesByChef = {};
    let availableDishes = 0;
    
    dishesSnapshot.forEach(doc => {
      const dish = doc.data();
      if (!dishesByChef[dish.chefId]) {
        dishesByChef[dish.chefId] = [];
      }
      dishesByChef[dish.chefId].push(dish.nameAr);
      
      if (dish.isAvailable) {
        availableDishes++;
      }
    });
    
    console.log(`  → متاحة: ${availableDishes}`);
    console.log('\n📋 الأصناف حسب الشيف:');
    Object.entries(dishesByChef).forEach(([chefId, dishes]) => {
      console.log(`  ${chefId}: ${dishes.length} صنف`);
      dishes.slice(0, 3).forEach(name => console.log(`    - ${name}`));
      if (dishes.length > 3) console.log(`    ... و ${dishes.length - 3} أخرى`);
    });

    console.log('\n✨ انتهى الفحص!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }

  process.exit(0);
}

checkData();
