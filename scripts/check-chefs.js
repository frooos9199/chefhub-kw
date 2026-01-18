// ============================================
// Check Chefs Data in Firestore
// ============================================

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkChefs() {
  try {
    console.log('🔍 جاري فحص بيانات الشيفات...\n');
    
    const chefsSnapshot = await db.collection('chef').get();
    
    console.log(`✅ تم العثور على ${chefsSnapshot.size} شيف\n`);
    
    if (chefsSnapshot.empty) {
      console.log('❌ لا توجد بيانات شيفات في قاعدة البيانات');
      return;
    }
    
    chefsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`========== الشيف ${index + 1} ==========`);
      console.log(`ID: ${doc.id}`);
      console.log(`الاسم: ${data.name || 'غير محدد'}`);
      console.log(`اسم المطعم: ${data.businessName || 'غير محدد'}`);
      console.log(`الحالة: ${data.status || 'غير محدد'}`);
      console.log(`مفعل: ${data.isActive ? 'نعم' : 'لا'}`);
      console.log(`البريد: ${data.email || 'غير محدد'}`);
      console.log(`الهاتف: ${data.phone || 'غير محدد'}`);
      console.log(`المحافظة: ${data.governorate || 'غير محدد'}`);
      console.log(`المنطقة: ${data.area || 'غير محدد'}`);
      console.log(`التقييم: ${data.rating || 0} (${data.totalRatings || 0} تقييم)`);
      console.log(`الطلبات: ${data.totalOrders || 0}`);
      console.log('');
    });
    
    // فحص مجموعة users
    console.log('\n🔍 جاري فحص مجموعة المستخدمين...\n');
    const usersSnapshot = await db.collection('users').where('role', '==', 'chef').get();
    console.log(`✅ تم العثور على ${usersSnapshot.size} شيف في مجموعة users\n`);
    
    usersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`========== المستخدم ${index + 1} ==========`);
      console.log(`ID: ${doc.id}`);
      console.log(`الاسم: ${data.name || 'غير محدد'}`);
      console.log(`البريد: ${data.email || 'غير محدد'}`);
      console.log(`الدور: ${data.role || 'غير محدد'}`);
      console.log(`الحالة: ${data.status || 'غير محدد'}`);
      console.log(`مفعل: ${data.isActive ? 'نعم' : 'لا'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

checkChefs();
