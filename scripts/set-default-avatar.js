// ============================================
// ChefHub - Set Default Avatar Script
// Updates existing `chefs` and `users` documents that lack a profileImage
// to point to the bundled default avatar at /default-chef-avatar.png
// Usage: node scripts/set-default-avatar.js
// Requires: scripts/serviceAccountKey.json (Firebase admin SDK)
// ============================================

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json in scripts/ - cannot run admin operations');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setDefaults() {
  try {
    console.log('🔄 Scanning chefs collection...');
    const chefsSnapshot = await db.collection('chef').get();
    const batch = db.batch();
    let updated = 0;

    chefsSnapshot.forEach((docSnap) => {
      console.log(` - Setting default avatar for chef ${docSnap.id}`);
      batch.update(docSnap.ref, { profileImage: '/default-chef-avatar.png', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      updated++;
    });

    if (updated > 0) {
      console.log(`Committing ${updated} chef updates...`);
      await batch.commit();
      console.log('✅ Chef documents updated.');
    } else {
      console.log('No chefs needed updating.');
    }

    // Now ensure users collection has profileImage for chefs
    console.log('🔄 Scanning users collection for chef profiles...');
    const usersSnapshot = await db.collection('users').where('role', '==', 'chef').get();
    const userBatch = db.batch();
    let usersUpdated = 0;

    usersSnapshot.forEach((docSnap) => {
      console.log(` - Setting default avatar for user ${docSnap.id}`);
      userBatch.update(docSnap.ref, { profileImage: '/default-chef-avatar.png', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      usersUpdated++;
    });

    if (usersUpdated > 0) {
      console.log(`Committing ${usersUpdated} user updates...`);
      await userBatch.commit();
      console.log('✅ User documents updated.');
    } else {
      console.log('No users needed updating.');
    }

    console.log('\n✨ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error while setting defaults:', err);
    process.exit(1);
  }
}

setDefaults();
