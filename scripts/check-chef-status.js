const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkChefStatus() {
  try {
    console.log('🔍 Checking chef status...\n');
    
    // Get all chefs
    const chefsSnapshot = await db.collection('chefs').get();
    
    console.log(`Found ${chefsSnapshot.size} chefs\n`);
    
    for (const chefDoc of chefsSnapshot.docs) {
      const chefData = chefDoc.data();
      
      // Get corresponding user data
      const userDoc = await db.collection('users').doc(chefDoc.id).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      
      console.log(`📋 Chef: ${chefData.businessName || chefData.name}`);
      console.log(`   ID: ${chefDoc.id}`);
      console.log(`   Email: ${chefData.email}`);
      console.log(`   In chefs collection:`);
      console.log(`      - status: ${chefData.status}`);
      console.log(`      - isActive: ${chefData.isActive}`);
      
      if (userData) {
        console.log(`   In users collection:`);
        console.log(`      - status: ${userData.status}`);
        console.log(`      - isActive: ${userData.isActive}`);
        console.log(`      - role: ${userData.role}`);
      } else {
        console.log(`   ⚠️  NO USER DOCUMENT FOUND!`);
      }
      
      // Check for mismatch
      if (userData && chefData.isActive !== userData.isActive) {
        console.log(`   ⚠️  MISMATCH: chefs.isActive (${chefData.isActive}) !== users.isActive (${userData.isActive})`);
      }
      
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkChefStatus();
