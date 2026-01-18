// ============================================
// ChefHub - Delete Test Users Script
// ============================================
// This script deletes test users from Firebase
// Run: node scripts/delete-test-users.js

const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();
const db = admin.firestore();

const testEmails = [
  'admin@chif.com',
  'chef@chif.com',
  'user@chif.com'
];

async function deleteTestUsers() {
  console.log('🗑️  Starting to delete test users...\n');

  for (const email of testEmails) {
    try {
      // Get user by email
      const userRecord = await auth.getUserByEmail(email);
      const uid = userRecord.uid;

      console.log(`Deleting user: ${email} (${uid})...`);

      // Delete user document from Firestore
      await db.collection('users').doc(uid).delete();
      console.log(`✅ Deleted user document from Firestore`);

      // If chef, delete chef document and dishes
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists && userDoc.data().chefId) {
        const chefId = userDoc.data().chefId;
        
        // Delete chef's dishes
        const dishesSnapshot = await db.collection('dishes')
          .where('chefId', '==', chefId)
          .get();
        
        const deletePromises = dishesSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${dishesSnapshot.size} dishes`);

        // Delete chef document
        await db.collection('chefs').doc(chefId).delete();
        console.log(`✅ Deleted chef document`);
      }

      // Delete from Authentication
      await auth.deleteUser(uid);
      console.log(`✅ Deleted auth user\n`);

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️  User ${email} not found, skipping...\n`);
      } else {
        console.error(`❌ Error deleting user ${email}:`, error.message);
      }
    }
  }

  console.log('🎉 Test users deletion complete!\n');
}

// Run the script
deleteTestUsers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
