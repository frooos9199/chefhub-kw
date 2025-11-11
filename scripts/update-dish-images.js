// ============================================
// ChefHub - Update Dish Images Script
// ============================================
// This script updates dish images with real food images
// Run: node scripts/update-dish-images.js

const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// صور حقيقية من Unsplash (مجاني للاستخدام)
const dishImages = {
  'مجبوس دجاج': [
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800'
  ],
  'مجبوس لحم': [
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800',
    'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800'
  ],
  'هريس': [
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'
  ],
  'مجبوس سمك': [
    'https://images.unsplash.com/photo-1580959375944-0be6b5caf4c4?w=800',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800'
  ],
  'مجبوس ربيان': [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800'
  ],
  'مكبوس حاشي': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800'
  ],
  'مرقوق': [
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'
  ],
  'مطبق زبيدي': [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
    'https://images.unsplash.com/photo-1580959375944-0be6b5caf4c4?w=800'
  ],
  'جريش': [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800'
  ],
  'سلطة فتوش': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
  ],
  'حمص بالطحينة': [
    'https://images.unsplash.com/photo-1571058039229-b5eb4e6d2846?w=800',
    'https://images.unsplash.com/photo-1580916468953-da4e0d4a2562?w=800'
  ],
  'دقوس': [
    'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800',
    'https://images.unsplash.com/photo-1608877907149-a206d75ba011?w=800'
  ],
  'عيش باجلا': [
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800',
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800'
  ],
  'لقيمات': [
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800'
  ],
  'بسبوسة': [
    'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
    'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800'
  ],
  'محمر': [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
    'https://images.unsplash.com/photo-1590080876876-9fce46b44102?w=800'
  ],
  'جباب': [
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'
  ],
  'عصير ليمون بالنعناع': [
    'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
    'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800'
  ],
  'شاي كرك': [
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800',
    'https://images.unsplash.com/photo-1597318281699-44c4fb8fd46b?w=800'
  ],
  'عصير رمان': [
    'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800'
  ]
};

async function updateDishImages() {
  try {
    console.log('🔄 جاري تحديث صور الأصناف...\n');

    const dishesSnapshot = await db.collection('dishes').get();
    
    let updated = 0;
    let skipped = 0;

    for (const doc of dishesSnapshot.docs) {
      const dish = doc.data();
      const dishName = dish.nameAr;
      
      if (dishImages[dishName]) {
        await doc.ref.update({
          images: dishImages[dishName],
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ تم تحديث صور: ${dishName}`);
        updated++;
      } else {
        console.log(`⏭️  تم تخطي: ${dishName} (لا توجد صور متطابقة)`);
        skipped++;
      }
    }

    console.log('\n✨ اكتمل التحديث!');
    console.log(`📊 الإحصائيات:`);
    console.log(`   ✅ تم التحديث: ${updated} صنف`);
    console.log(`   ⏭️  تم التخطي: ${skipped} صنف`);

  } catch (error) {
    console.error('❌ خطأ في تحديث الصور:', error);
    process.exit(1);
  }

  process.exit(0);
}

updateDishImages();
