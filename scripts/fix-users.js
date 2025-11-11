// Quick fix - Add isActive field to existing users
const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixUsers() {
  console.log('🔧 Fixing existing users...\n');
  
  const users = await db.collection('users').get();
  
  for (const doc of users.docs) {
    await doc.ref.update({
      isActive: true
    });
    console.log(`✅ Updated user: ${doc.data().email}`);
  }
  
  console.log('\n✅ All users updated!');
  process.exit(0);
}

fixUsers().catch(console.error);
