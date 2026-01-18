// ============================================
// Add More Kuwaiti Dishes
// ============================================
const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// More Kuwaiti dishes
const moreDishes = [
  // المجابيس
  {
    nameAr: 'مجبوس سمك',
    nameEn: 'Fish Machboos',
    descriptionAr: 'مجبوس سمك طازج مع الأرز البسمتي والبهارات الكويتية الأصيلة',
    descriptionEn: 'Fresh fish machboos with basmati rice and authentic Kuwaiti spices',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 7.5,
    preparationTime: 50,
    servings: 4,
    images: ['https://via.placeholder.com/600x400?text=Fish+Machboos'],
    isActive: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 35,
    orderCount: 92
  },
  {
    nameAr: 'مجبوس ربيان',
    nameEn: 'Shrimp Machboos',
    descriptionAr: 'مجبوس ربيان طازج مع الأرز المبهر والخضار',
    descriptionEn: 'Fresh shrimp machboos with spiced rice and vegetables',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 8.0,
    preparationTime: 45,
    servings: 3,
    images: ['https://via.placeholder.com/600x400?text=Shrimp+Machboos'],
    isActive: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 28,
    orderCount: 76
  },
  // أطباق كويتية أخرى
  {
    nameAr: 'مرقوق',
    nameEn: 'Margoog',
    descriptionAr: 'مرقوق لحم مع الخضار والعجين المفروق الطازج',
    descriptionEn: 'Traditional Kuwaiti margoog with meat, vegetables and fresh dough',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 6.0,
    preparationTime: 75,
    servings: 5,
    images: ['https://via.placeholder.com/600x400?text=Margoog'],
    isActive: true,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 31,
    orderCount: 85
  },
  {
    nameAr: 'مطبق زبيدي',
    nameEn: 'Mutabbaq Zubaidi',
    descriptionAr: 'سمك زبيدي مطبق مع الأرز الأبيض والدقوس',
    descriptionEn: 'Grilled Zubaidi fish with white rice and daqoos sauce',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 9.5,
    preparationTime: 60,
    servings: 3,
    images: ['https://via.placeholder.com/600x400?text=Mutabbaq+Zubaidi'],
    isActive: true,
    isAvailable: true,
    rating: 5.0,
    reviewCount: 45,
    orderCount: 120
  },
  {
    nameAr: 'جريش',
    nameEn: 'Jareesh',
    descriptionAr: 'جريش باللحم مع القرفة والهيل',
    descriptionEn: 'Traditional jareesh with meat, cinnamon and cardamom',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 5.0,
    preparationTime: 90,
    servings: 4,
    images: ['https://via.placeholder.com/600x400?text=Jareesh'],
    isActive: true,
    isAvailable: true,
    rating: 4.6,
    reviewCount: 22,
    orderCount: 58
  },
  {
    nameAr: 'مكبوس حاشي',
    nameEn: 'Camel Machboos',
    descriptionAr: 'مكبوس لحم حاشي مع الأرز البسمتي والبهارات الخاصة',
    descriptionEn: 'Camel meat machboos with basmati rice and special spices',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 12.0,
    preparationTime: 120,
    servings: 6,
    images: ['https://via.placeholder.com/600x400?text=Camel+Machboos'],
    isActive: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 18,
    orderCount: 42
  },
  // مقبلات إضافية
  {
    nameAr: 'دقوس',
    nameEn: 'Daqoos',
    descriptionAr: 'دقوس كويتي حار مع الطماطم والبهارات',
    descriptionEn: 'Spicy Kuwaiti daqoos sauce with tomatoes and spices',
    category: 'مقبلات',
    categoryEn: 'Appetizers',
    price: 1.5,
    preparationTime: 20,
    servings: 4,
    images: ['https://via.placeholder.com/600x400?text=Daqoos'],
    isActive: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 38,
    orderCount: 95
  },
  {
    nameAr: 'عيش باجلا',
    nameEn: 'Bagilla',
    descriptionAr: 'عيش باجلا كويتي تقليدي مع الفول والبهارات',
    descriptionEn: 'Traditional Kuwaiti bagilla with fava beans and spices',
    category: 'مقبلات',
    categoryEn: 'Appetizers',
    price: 2.0,
    preparationTime: 30,
    servings: 3,
    images: ['https://via.placeholder.com/600x400?text=Bagilla'],
    isActive: true,
    isAvailable: true,
    rating: 4.5,
    reviewCount: 25,
    orderCount: 62
  },
  {
    nameAr: 'محمر',
    nameEn: 'Muhammar',
    descriptionAr: 'أرز محمر حلو مع السكر والزعفران',
    descriptionEn: 'Sweet brown rice with sugar and saffron',
    category: 'حلويات',
    categoryEn: 'Desserts',
    price: 3.0,
    preparationTime: 40,
    servings: 4,
    images: ['https://via.placeholder.com/600x400?text=Muhammar'],
    isActive: true,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 30,
    orderCount: 78
  },
  {
    nameAr: 'جباب',
    nameEn: 'Jibab',
    descriptionAr: 'جباب كويتي محلي طازج مع القطر',
    descriptionEn: 'Fresh Kuwaiti jibab with syrup',
    category: 'حلويات',
    categoryEn: 'Desserts',
    price: 2.5,
    preparationTime: 25,
    servings: 6,
    images: ['https://via.placeholder.com/600x400?text=Jibab'],
    isActive: true,
    isAvailable: true,
    rating: 4.6,
    reviewCount: 27,
    orderCount: 71
  },
  // مشروبات
  {
    nameAr: 'شاي كرك',
    nameEn: 'Karak Tea',
    descriptionAr: 'شاي كرك كويتي بالحليب والهيل والزعفران',
    descriptionEn: 'Kuwaiti karak tea with milk, cardamom and saffron',
    category: 'مشروبات',
    categoryEn: 'Beverages',
    price: 0.5,
    preparationTime: 10,
    servings: 1,
    images: ['https://via.placeholder.com/600x400?text=Karak+Tea'],
    isActive: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 55,
    orderCount: 150
  },
  {
    nameAr: 'عصير رمان',
    nameEn: 'Pomegranate Juice',
    descriptionAr: 'عصير رمان طازج طبيعي 100%',
    descriptionEn: 'Fresh natural pomegranate juice 100%',
    category: 'مشروبات',
    categoryEn: 'Beverages',
    price: 2.0,
    preparationTime: 5,
    servings: 1,
    images: ['https://via.placeholder.com/600x400?text=Pomegranate+Juice'],
    isActive: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 32,
    orderCount: 88
  }
];

async function addMoreDishes() {
  console.log('🍽️  إضافة أصناف كويتية إضافية...\n');

  try {
    // Find the test chef
    const chefsSnapshot = await db.collection('chef')
      .where('email', '==', 'chef@chif.com')
      .limit(1)
      .get();

    if (chefsSnapshot.empty) {
      console.error('❌ الشيف التجريبي غير موجود!');
      process.exit(1);
    }

    const chefDoc = chefsSnapshot.docs[0];
    const chefId = chefDoc.id;
    const chefData = chefDoc.data();

    console.log(`✅ تم العثور على الشيف: ${chefData.name} (${chefId})\n`);

    // Create dishes
    let createdCount = 0;
    for (const dish of moreDishes) {
      const dishData = {
        ...dish,
        chefId: chefId,
        chefName: chefData.name,
        chefNameEn: chefData.nameEn,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const dishRef = await db.collection('dishes').add(dishData);
      console.log(`✅ تم إضافة: ${dish.nameAr} - ${dish.price} د.ك (${dishRef.id})`);
      createdCount++;
    }

    console.log(`\n🎉 تم إضافة ${createdCount} صنف بنجاح!`);
    console.log('━'.repeat(50));
    console.log('الأصناف حسب الفئة:');
    console.log('- أطباق رئيسية (مجابيس): 6 أصناف');
    console.log('- مقبلات: 2 أصناف');
    console.log('- حلويات: 2 أصناف');
    console.log('- مشروبات: 2 أصناف');
    console.log('━'.repeat(50));
    console.log('\n📋 الأصناف المضافة:');
    console.log('• مجبوس سمك - 7.5 د.ك');
    console.log('• مجبوس ربيان - 8.0 د.ك');
    console.log('• مرقوق - 6.0 د.ك');
    console.log('• مطبق زبيدي - 9.5 د.ك');
    console.log('• جريش - 5.0 د.ك');
    console.log('• مكبوس حاشي - 12.0 د.ك');
    console.log('• دقوس - 1.5 د.ك');
    console.log('• عيش باجلا - 2.0 د.ك');
    console.log('• محمر - 3.0 د.ك');
    console.log('• جباب - 2.5 د.ك');
    console.log('• شاي كرك - 0.5 د.ك');
    console.log('• عصير رمان - 2.0 د.ك');
    console.log('━'.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ خطأ في إضافة الأصناف:', error.message);
    throw error;
  }
}

// Run the script
addMoreDishes()
  .then(() => {
    console.log('✅ اكتمل السكريبت بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل السكريبت:', error);
    process.exit(1);
  });
