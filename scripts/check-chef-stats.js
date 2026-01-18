const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkChefStats() {
  try {
    console.log('🔍 Checking chef statistics...\n');

    // Get all chefs
    const chefsSnapshot = await db.collection('chefs').get();
    
    for (const chefDoc of chefsSnapshot.docs) {
      const chef = chefDoc.data();
      const chefId = chefDoc.id;
      
      // Count dishes
      const dishesSnapshot = await db.collection('dishes')
        .where('chefId', '==', chefId)
        .where('isActive', '==', true)
        .get();
      
      // Count special orders
      const specialOrdersSnapshot = await db.collection('special_orders')
        .where('chefId', '==', chefId)
        .where('isActive', '==', true)
        .get();
      
      // Count reviews
      const reviewsSnapshot = await db.collection('reviews')
        .where('chefId', '==', chefId)
        .get();
      
      console.log('👨‍🍳 Chef:', chef.businessName || chef.name);
      console.log('   ID:', chefId);
      console.log('   📊 Statistics:');
      console.log('      - Total Orders (from chef doc):', chef.totalOrders || 0);
      console.log('      - Active Dishes:', dishesSnapshot.size);
      console.log('      - Active Special Orders:', specialOrdersSnapshot.size);
      console.log('      - Total Ratings:', chef.totalRatings || 0);
      console.log('      - Reviews Count:', reviewsSnapshot.size);
      console.log('      - Rating:', (chef.rating || 0).toFixed(1));
      console.log('');
    }
    
    console.log('✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkChefStats();
