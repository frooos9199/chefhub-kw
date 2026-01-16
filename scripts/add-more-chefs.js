const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const additionalChefs = [
  {
    email: 'chef2@chif.com',
    password: '123123',
    displayName: 'Chef Sarah',
    userData: {
      email: 'chef2@chif.com',
      name: 'الشيف سارة',
      role: 'chef',
      phone: '+96550000003',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    chefData: {
      name: 'الشيف سارة',
      email: 'chef2@chif.com',
      phone: '+96550000003',
      specialty: ['حلويات غربية', 'كيك', 'معجنات'],
      bio: 'متخصصة في الحلويات الغربية والكيك المميز',
      governorate: 'الجهراء',
      area: 'الجهراء',
      profileImage: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop',
      rating: 4.9,
      totalRatings: 67,
      totalOrders: 230,
      status: 'active',
      isActive: true,
      businessName: 'حلويات سارة',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    email: 'chef3@chif.com',
    password: '123123',
    displayName: 'Chef Ali',
    userData: {
      email: 'chef3@chif.com',
      name: 'الشيف علي',
      role: 'chef',
      phone: '+96550000004',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    chefData: {
      name: 'الشيف علي',
      email: 'chef3@chif.com',
      phone: '+96550000004',
      specialty: ['مشاوي', 'مأكولات عربية', 'برياني'],
      bio: 'خبرة 15 سنة في المشاوي والمأكولات العربية الأصيلة',
      governorate: 'الأحمدي',
      area: 'الفحيحيل',
      profileImage: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop',
      rating: 4.7,
      totalRatings: 89,
      totalOrders: 340,
      status: 'active',
      isActive: true,
      businessName: 'مطبخ علي للمشاوي',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    email: 'chef4@chif.com',
    password: '123123',
    displayName: 'Chef Fatima',
    userData: {
      email: 'chef4@chif.com',
      name: 'الشيف فاطمة',
      role: 'chef',
      phone: '+96550000005',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    chefData: {
      name: 'الشيف فاطمة',
      email: 'chef4@chif.com',
      phone: '+96550000005',
      specialty: ['مأكولات صحية', 'سلطات', 'وجبات دايت'],
      bio: 'متخصصة في الأكل الصحي والوجبات المتوازنة',
      governorate: 'العاصمة',
      area: 'الشويخ',
      profileImage: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&h=400&fit=crop',
      rating: 4.6,
      totalRatings: 54,
      totalOrders: 180,
      status: 'active',
      isActive: true,
      businessName: 'مطبخ فاطمة الصحي',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    email: 'chef5@chif.com',
    password: '123123',
    displayName: 'Chef Mohammed',
    userData: {
      email: 'chef5@chif.com',
      name: 'الشيف محمد',
      role: 'chef',
      phone: '+96550000006',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    chefData: {
      name: 'الشيف محمد',
      email: 'chef5@chif.com',
      phone: '+96550000006',
      specialty: ['مأكولات إيطالية', 'باستا', 'بيتزا'],
      bio: 'خبرة واسعة في المطبخ الإيطالي الأصيل',
      governorate: 'مبارك الكبير',
      area: 'صباح السالم',
      profileImage: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=400&fit=crop',
      rating: 4.8,
      totalRatings: 76,
      totalOrders: 290,
      status: 'active',
      isActive: true,
      businessName: 'المطبخ الإيطالي',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    email: 'chef6@chif.com',
    password: '123123',
    displayName: 'Chef Noor',
    userData: {
      email: 'chef6@chif.com',
      name: 'الشيف نور',
      role: 'chef',
      phone: '+96550000007',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    chefData: {
      name: 'الشيف نور',
      email: 'chef6@chif.com',
      phone: '+96550000007',
      specialty: ['مأكولات هندية', 'كاري', 'برياني هندي'],
      bio: 'متخصصة في الأطباق الهندية الحارة والعطرية',
      governorate: 'الفروانية',
      area: 'الفروانية',
      profileImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
      rating: 4.9,
      totalRatings: 102,
      totalOrders: 420,
      status: 'active',
      isActive: true,
      businessName: 'نكهات الهند',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }
];

async function addChefs() {
  console.log('🚀 بدء إضافة الشيفات الإضافيين...\n');

  for (const chef of additionalChefs) {
    try {
      let userRecord;
      
      console.log(`إضافة ${chef.chefData.name} (${chef.email})...`);
      
      try {
        userRecord = await auth.createUser({
          email: chef.email,
          password: chef.password,
          displayName: chef.displayName,
          emailVerified: true
        });
        console.log(`✅ تم إنشاء حساب المصادقة: ${userRecord.uid}`);
      } catch (authError) {
        if (authError.code === 'auth/email-already-exists') {
          console.log(`⚠️  المستخدم موجود، جلب البيانات...`);
          userRecord = await auth.getUserByEmail(chef.email);
          console.log(`✅ تم جلب المستخدم: ${userRecord.uid}`);
        } else {
          throw authError;
        }
      }

      // إنشاء/تحديث وثيقة المستخدم
      await db.collection('users').doc(userRecord.uid).set({
        ...chef.userData,
        uid: userRecord.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // التحقق من وجود chefId
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const chefId = userDoc.data()?.chefId;
      
      chef.chefData.userId = userRecord.uid;
      
      if (chefId) {
        await db.collection('chefs').doc(chefId).set({
          ...chef.chefData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`✅ تم تحديث بيانات الشيف: ${chefId}`);
      } else {
        const chefRef = await db.collection('chefs').add(chef.chefData);
        console.log(`✅ تم إنشاء وثيقة الشيف: ${chefRef.id}`);
        
        await db.collection('users').doc(userRecord.uid).update({
          chefId: chefRef.id
        });
        console.log(`✅ تم ربط الشيف بالمستخدم`);
      }

      console.log(`✨ تم بنجاح: ${chef.chefData.name}\n`);
      console.log('━'.repeat(50) + '\n');

    } catch (error) {
      console.error(`❌ خطأ في ${chef.email}:`, error.message);
    }
  }

  console.log('\n🎉 تم الانتهاء من إضافة الشيفات!\n');
}

addChefs()
  .then(() => {
    console.log('✅ السكريبت اكتمل بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل السكريبت:', error);
    process.exit(1);
  });
