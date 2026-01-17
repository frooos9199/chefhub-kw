const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkSpecialOrders() {
  try {
    console.log('🔍 جاري فحص العروض الخاصة...\n');
    
    const specialOrdersSnapshot = await db.collection('special_orders').get();
    
    console.log(`📦 إجمالي العروض: ${specialOrdersSnapshot.size}\n`);
    console.log('━'.repeat(60));
    
    specialOrdersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const maxOrders = data.maxOrders;
      const currentOrders = data.currentOrders;
      
      console.log(`\n${index + 1}. ${data.title || 'بدون عنوان'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   الشيف: ${data.chefName || 'غير محدد'}`);
      console.log(`   maxOrders: ${maxOrders} ${maxOrders === undefined ? '❌ ناقص!' : '✅'}`);
      console.log(`   currentOrders: ${currentOrders} ${currentOrders === undefined ? '❌ ناقص!' : '✅'}`);
      
      if (maxOrders !== undefined && currentOrders !== undefined) {
        const remaining = maxOrders - currentOrders;
        const percentage = maxOrders > 0 ? ((currentOrders / maxOrders) * 100).toFixed(1) : 0;
        console.log(`   الحالة: ${currentOrders} / ${maxOrders} (${percentage}%)`);
        console.log(`   المتبقي: ${remaining}`);
      }
      
      console.log(`   السعر: ${data.price} د.ك`);
      console.log(`   الصورة: ${data.image ? '✅' : '❌'}`);
      console.log(`   نشط: ${data.isActive ? '✅' : '❌'}`);
    });
    
    console.log('\n' + '━'.repeat(60));
    console.log('✨ انتهى الفحص!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

checkSpecialOrders();
