const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixChefStatus() {
  try {
    console.log('🔧 Fixing chef status...\n');
    
    // Get all chefs
    const chefsSnapshot = await db.collection('chefs').get();
    
    for (const chefDoc of chefsSnapshot.docs) {
      const chefData = chefDoc.data();
      
      console.log(`📋 Processing: ${chefData.businessName || chefData.name}`);
      console.log(`   Chef ID: ${chefDoc.id}`);
      
      // Update users collection to match chefs collection
      await db.collection('users').doc(chefDoc.id).update({
        status: chefData.status || 'active',
        isActive: chefData.isActive !== undefined ? chefData.isActive : true
      });
      
      console.log(`   ✅ Updated users collection:`);
      console.log(`      - status: ${chefData.status || 'active'}`);
      console.log(`      - isActive: ${chefData.isActive !== undefined ? chefData.isActive : true}`);
      console.log('');
    }
    
    console.log('✅ All chefs fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixChefStatus();
