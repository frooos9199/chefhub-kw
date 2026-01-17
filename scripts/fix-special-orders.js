const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixSpecialOrders() {
  try {
    console.log('🔍 جاري البحث عن العروض الخاصة...');
    
    const specialOrdersSnapshot = await db.collection('special_orders').get();
    
    console.log(`📦 تم العثور على ${specialOrdersSnapshot.size} عرض خاص`);
    
    let fixed = 0;
    let alreadyOk = 0;
    
    for (const doc of specialOrdersSnapshot.docs) {
      const data = doc.data();
      
      // Check if maxOrders or currentOrders are missing
      if (data.maxOrders === undefined || data.currentOrders === undefined) {
        console.log(`\n⚠️ عرض ناقص: ${data.title || doc.id}`);
        console.log(`   maxOrders: ${data.maxOrders}`);
        console.log(`   currentOrders: ${data.currentOrders}`);
        
        // Update with default values
        const updates = {};
        if (data.maxOrders === undefined) {
          updates.maxOrders = 10; // Default value
          console.log('   ✅ إضافة maxOrders = 10');
        }
        if (data.currentOrders === undefined) {
          updates.currentOrders = 0; // Default value
          console.log('   ✅ إضافة currentOrders = 0');
        }
        
        await doc.ref.update(updates);
        fixed++;
      } else {
        alreadyOk++;
      }
    }
    
    console.log('\n📊 النتائج:');
    console.log(`   ✅ تم إصلاح: ${fixed} عرض`);
    console.log(`   ✓ سليم بالفعل: ${alreadyOk} عرض`);
    console.log('\n✨ تم الانتهاء!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

fixSpecialOrders();
