// ============================================
// ChefHub - Add Test Chefs Script
// ============================================

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin (check if already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const testChefs = [
  {
    name: 'الشيف فاطمة أحمد',
    email: 'fatima@chefhub.test',
    phone: '+96550000001',
    businessName: 'مطبخ فاطمة للحلويات',
  profileImage: '/default-chef-avatar.png',
    specialty: ['حلويات شرقية', 'معجنات', 'كيك'],
    bio: 'خبرة 15 سنة في تحضير الحلويات الشرقية والغربية. متخصصة في الكنافة والبقلاوة والكيك.',
    rating: 4.9,
    totalOrders: 342,
    totalReviews: 128,
    status: 'approved',
    governorates: ['العاصمة', 'حولي', 'الفروانية'],
    deliveryFee: 2.000,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'الشيف محمد الخالد',
    email: 'mohammed@chefhub.test',
    phone: '+96550000002',
    businessName: 'مشاوي الخالد',
  profileImage: '/default-chef-avatar.png',
    specialty: ['مشاوي', 'مأكولات كويتية', 'مقبلات'],
    bio: 'متخصص في المشاوي والمأكولات الكويتية التقليدية. جودة عالية وطعم أصيل.',
    rating: 4.7,
    totalOrders: 256,
    totalReviews: 95,
    status: 'approved',
    governorates: ['العاصمة', 'حولي', 'الأحمدي'],
    deliveryFee: 2.500,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'الشيف نورة السالم',
    email: 'noura@chefhub.test',
    phone: '+96550000003',
    businessName: 'معجنات نورة',
  profileImage: '/default-chef-avatar.png',
    specialty: ['معجنات', 'فطائر', 'مخبوزات'],
    bio: 'معجنات طازجة يومياً. فطائر بالسبانخ والجبنة واللحمة. خبز طازج.',
    rating: 4.6,
    totalOrders: 189,
    totalReviews: 80,
    status: 'approved',
    governorates: ['حولي', 'الفروانية', 'مبارك الكبير'],
    deliveryFee: 1.500,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'الشيف عبدالله العتيبي',
    email: 'abdullah@chefhub.test',
    phone: '+96550000004',
    businessName: 'مطبخ العتيبي الإيطالي',
  profileImage: '/default-chef-avatar.png',
    specialty: ['مأكولات إيطالية', 'باستا', 'بيتزا'],
    bio: 'مأكولات إيطالية أصيلة. باستا طازجة وبيتزا من الفرن الحجري.',
    rating: 4.8,
    totalOrders: 298,
    totalReviews: 110,
    status: 'approved',
    governorates: ['العاصمة', 'حولي', 'الجهراء'],
    deliveryFee: 2.000,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'الشيف مريم الرشيد',
    email: 'maryam@chefhub.test',
    phone: '+96550000005',
    businessName: 'حلويات مريم الفاخرة',
  profileImage: '/default-chef-avatar.png',
    specialty: ['حلويات غربية', 'كيك', 'تشيز كيك'],
    bio: 'حلويات غربية فاخرة. كيك مميز لجميع المناسبات. تشيز كيك بنكهات متنوعة.',
    rating: 4.9,
    totalOrders: 412,
    totalReviews: 165,
    status: 'approved',
    governorates: ['العاصمة', 'حولي', 'الفروانية', 'الأحمدي'],
    deliveryFee: 2.500,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'الشيف خالد المطيري',
    email: 'khaled@chefhub.test',
    phone: '+96550000006',
    businessName: 'مطبخ المطيري الآسيوي',
  profileImage: '/default-chef-avatar.png',
    specialty: ['مأكولات آسيوية', 'سوشي', 'نودلز'],
    bio: 'مأكولات آسيوية متنوعة. سوشي طازج ونودلز صيني وتايلندي.',
    rating: 4.7,
    totalOrders: 234,
    totalReviews: 98,
    status: 'approved',
    governorates: ['العاصمة', 'حولي'],
    deliveryFee: 3.000,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'الشيف هند الدوسري',
    email: 'hind@chefhub.test',
    phone: '+96550000007',
    businessName: 'مطبخ هند الصحي',
  profileImage: '/default-chef-avatar.png',
    specialty: ['سلطات صحية', 'وجبات لايت', 'عصائر'],
    bio: 'وجبات صحية ومتوازنة. سلطات طازجة وعصائر طبيعية 100%.',
    rating: 4.8,
    totalOrders: 167,
    totalReviews: 72,
    status: 'approved',
    governorates: ['حولي', 'الفروانية', 'مبارك الكبير'],
    deliveryFee: 1.500,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'الشيف سعود القحطاني',
    email: 'saud@chefhub.test',
    phone: '+96550000008',
    businessName: 'مطبخ القحطاني الخليجي',
  profileImage: '/default-chef-avatar.png',
    specialty: ['مأكولات خليجية', 'كبسة', 'مجبوس'],
    bio: 'مأكولات خليجية أصيلة. كبسة ومجبوس بنكهة منزلية.',
    rating: 4.9,
    totalOrders: 389,
    totalReviews: 145,
    status: 'approved',
    governorates: ['العاصمة', 'حولي', 'الأحمدي', 'الجهراء'],
    deliveryFee: 2.000,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addTestChefs() {
  try {
    console.log('🔄 بدء إضافة الشيفات التجريبية...\n');
    
    const batch = db.batch();
    
    for (const chef of testChefs) {
      const chefRef = db.collection('chef').doc();
      batch.set(chefRef, chef);
      console.log(`✅ تمت إضافة: ${chef.name} (${chef.businessName})`);
    }
    
    await batch.commit();
    
    console.log('\n✨ تم إضافة جميع الشيفات بنجاح!');
    console.log(`📊 العدد الإجمالي: ${testChefs.length} شيف`);
    
    // Verify
    const chefsSnapshot = await db.collection('chef').where('status', '==', 'approved').get();
    console.log(`\n🔍 التحقق: ${chefsSnapshot.size} شيف معتمد في قاعدة البيانات`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إضافة الشيفات:', error);
    process.exit(1);
  }
}

addTestChefs();
