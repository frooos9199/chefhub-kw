const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function syncAllChefs() {
  try {
    console.log('🔄 Syncing all chefs between collections...\n');
    
    // Get all chefs
    const chefsSnapshot = await db.collection('chef').get();
    
    console.log(`Found ${chefsSnapshot.size} chefs to sync\n`);
    
    let synced = 0;
    let alreadyInSync = 0;
    let errors = 0;
    
    for (const chefDoc of chefsSnapshot.docs) {
      const chefData = chefDoc.data();
      
      try {
        // Get user data
        const userDoc = await db.collection('users').doc(chefDoc.id).get();
        
        if (!userDoc.exists) {
          console.log(`⚠️  No user document for chef: ${chefData.businessName || chefData.name}`);
          console.log(`   Creating user document...`);
          
          await db.collection('users').doc(chefDoc.id).set({
            email: chefData.email,
            name: chefData.businessName || chefData.name,
            phone: chefData.phone || '',
            role: 'chef',
            status: chefData.status || 'pending',
            isActive: chefData.isActive !== undefined ? chefData.isActive : false,
            createdAt: chefData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          synced++;
          console.log(`   ✅ Created\n`);
          continue;
        }
        
        const userData = userDoc.data();
        
        // Check if sync needed
        const needsSync = 
          userData.status !== chefData.status ||
          userData.isActive !== chefData.isActive;
        
        if (needsSync) {
          console.log(`🔧 Syncing: ${chefData.businessName || chefData.name}`);
          console.log(`   chefs: status=${chefData.status}, isActive=${chefData.isActive}`);
          console.log(`   users: status=${userData.status}, isActive=${userData.isActive}`);
          
          await db.collection('users').doc(chefDoc.id).update({
            status: chefData.status || 'pending',
            isActive: chefData.isActive !== undefined ? chefData.isActive : false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          synced++;
          console.log(`   ✅ Synced\n`);
        } else {
          alreadyInSync++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${chefData.businessName || chefData.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Synced: ${synced}`);
    console.log(`   ✓  Already in sync: ${alreadyInSync}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total: ${chefsSnapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

syncAllChefs();
