const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listChefs() {
  try {
    const chefsSnapshot = await db.collection('chef').get();
    
    console.log('\n📊 إجمالي عدد الشيفات:', chefsSnapshot.size);
    console.log('='.repeat(60));
    
    if (chefsSnapshot.empty) {
      console.log('❌ لا يوجد شيفات في قاعدة البيانات');
      console.log('\n💡 استخدم: node seed-users.js لإضافة شيفات تجريبيين');
      return;
    }
    
    chefsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ${data.name || 'بدون اسم'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   الحالة: ${data.status || 'غير محدد'} | نشط: ${data.isActive ? '✅' : '❌'}`);
      console.log(`   البريد: ${data.email || 'غير محدد'}`);
      console.log(`   التقييم: ${data.rating || 0} ⭐ | الطلبات: ${data.totalOrders || 0}`);
      console.log(`   التخصص: ${data.specialty?.join(', ') || 'غير محدد'}`);
    });
    
    const activeChefs = chefsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'active' && data.isActive === true;
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ الشيفات النشطين: ${activeChefs.length}`);
    console.log(`⏸️  الشيفات غير النشطين: ${chefsSnapshot.size - activeChefs.length}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    process.exit(0);
  }
}

listChefs();
