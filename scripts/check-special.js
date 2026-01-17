const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkSpecialOrders() {
  console.log('Checking special orders...\n');
  
  const snapshot = await db.collection('special_orders').get();
  console.log('Total:', snapshot.size);
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log('\n---');
    console.log('ID:', doc.id);
    console.log('Title:', data.title);
    console.log('Chef:', data.chefId);
    console.log('Active:', data.isActive);
    console.log('End:', data.endDate?.toDate?.());
  });
  
  process.exit(0);
}

checkSpecialOrders();
