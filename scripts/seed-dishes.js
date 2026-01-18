// ============================================
// ChefHub - Seed Test Dishes Script
// ============================================
// This script creates test dishes for the test chef
// Run: node scripts/seed-dishes.js

const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Test dishes data
const testDishes = [
  {
    nameAr: 'مجبوس دجاج',
    nameEn: 'Chicken Machboos',
    descriptionAr: 'طبق مجبوس دجاج كويتي تقليدي مع الأرز البسمتي والبهارات الخاصة',
    descriptionEn: 'Traditional Kuwaiti chicken machboos with basmati rice and special spices',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 6.5,
    preparationTime: 45,
    servings: 4,
    images: ['https://via.placeholder.com/600x400?text=Chicken+Machboos'],
    isActive: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 28,
    orderCount: 85
  },
  {
    nameAr: 'مجبوس لحم',
    nameEn: 'Meat Machboos',
    descriptionAr: 'مجبوس لحم غنم طازج مع الأرز المبهر والخضار',
    descriptionEn: 'Fresh lamb machboos with spiced rice and vegetables',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 8.5,
    preparationTime: 60,
    servings: 4,
    images: ['https://via.placeholder.com/600x400?text=Meat+Machboos'],
    isActive: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 22,
    orderCount: 67
  },
  {
    nameAr: 'هريس',
    nameEn: 'Harees',
    descriptionAr: 'هريس كويتي أصيل مطبوخ على نار هادئة مع اللحم',
    descriptionEn: 'Authentic Kuwaiti harees slow-cooked with meat',
    category: 'أطباق رئيسية',
    categoryEn: 'Main Dishes',
    price: 5.5,
    preparationTime: 90,
    servings: 3,
    images: ['https://via.placeholder.com/600x400?text=Harees'],
    isActive: true,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 18,
    orderCount: 52
  },
  {
    nameAr: 'سلطة فتوش',
    nameEn: 'Fattoush Salad',
    descriptionAr: 'سلطة فتوش طازجة مع الخضار والخبز المحمص',
    descriptionEn: 'Fresh fattoush salad with vegetables and toasted bread',
    category: 'مقبلات',
    categoryEn: 'Appetizers',
    price: 2.5,
    preparationTime: 15,
    servings: 2,
    images: ['https://via.placeholder.com/600x400?text=Fattoush'],
    isActive: true,
    isAvailable: true,
    rating: 4.6,
    reviewCount: 15,
    orderCount: 42
  },
  {
    nameAr: 'حمص بالطحينة',
    nameEn: 'Hummus with Tahini',
    descriptionAr: 'حمص طازج مع الطحينة وزيت الزيتون',
    descriptionEn: 'Fresh hummus with tahini and olive oil',
    category: 'مقبلات',
    categoryEn: 'Appetizers',
    price: 2.0,
    preparationTime: 10,
    servings: 2,
    images: ['https://via.placeholder.com/600x400?text=Hummus'],
    isActive: true,
    isAvailable: true,
    rating: 4.5,
    reviewCount: 12,
    orderCount: 38
  },
  {
    nameAr: 'لقيمات',
    nameEn: 'Luqaimat',
    descriptionAr: 'لقيمات محلية طازجة مع القطر والسمسم',
    descriptionEn: 'Fresh local luqaimat with syrup and sesame',
    category: 'حلويات',
    categoryEn: 'Desserts',
    price: 3.0,
    preparationTime: 20,
    servings: 4,
    images: ['https://via.placeholder.com/600x400?text=Luqaimat'],
    isActive: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 35,
    orderCount: 95
  },
  {
    nameAr: 'بسبوسة',
    nameEn: 'Basbousa',
    descriptionAr: 'بسبوسة بالسميد والقشطة مع شربات السكر',
    descriptionEn: 'Semolina basbousa with cream and sugar syrup',
    category: 'حلويات',
    categoryEn: 'Desserts',
    price: 3.5,
    preparationTime: 30,
    servings: 6,
    images: ['https://via.placeholder.com/600x400?text=Basbousa'],
    isActive: true,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 24,
    orderCount: 68
  },
  {
    nameAr: 'عصير ليمون بالنعناع',
    nameEn: 'Lemon Mint Juice',
    descriptionAr: 'عصير ليمون طازج مع النعناع والثلج',
    descriptionEn: 'Fresh lemon juice with mint and ice',
    category: 'مشروبات',
    categoryEn: 'Beverages',
    price: 1.5,
    preparationTime: 5,
    servings: 1,
    images: ['https://via.placeholder.com/600x400?text=Lemon+Mint'],
    isActive: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 20,
    orderCount: 55
  }
];

async function seedDishes() {
  console.log('🍽️  Starting to create test dishes...\n');

  try {
    // Find the test chef
    const chefsSnapshot = await db.collection('chefs')
      .where('email', '==', 'chef@chif.com')
      .limit(1)
      .get();

    if (chefsSnapshot.empty) {
      console.error('❌ Test chef not found! Please run seed-users.js first.');
      process.exit(1);
    }

    const chefDoc = chefsSnapshot.docs[0];
    const chefId = chefDoc.id;
    const chefData = chefDoc.data();

    console.log(`✅ Found test chef: ${chefData.name} (${chefId})\n`);

    // Create dishes
    let createdCount = 0;
    for (const dish of testDishes) {
      const dishData = {
        ...dish,
        chefId: chefId,
        chefName: chefData.name,
        chefNameEn: chefData.nameEn,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const dishRef = await db.collection('dishes').add(dishData);
      console.log(`✅ Created dish: ${dish.nameAr} (${dishRef.id})`);
      createdCount++;
    }

    console.log(`\n🎉 Successfully created ${createdCount} dishes!`);
    console.log('━'.repeat(50));
    console.log('Dishes by category:');
    console.log('- أطباق رئيسية: 3 dishes');
    console.log('- مقبلات: 2 dishes');
    console.log('- حلويات: 2 dishes');
    console.log('- مشروبات: 1 dish');
    console.log('━'.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error creating dishes:', error.message);
    throw error;
  }
}

// Run the script
seedDishes()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
