// ============================================
// Test Firebase Storage Connection
// ============================================

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'chefhub-kw.firebasestorage.app'
});

const bucket = admin.storage().bucket();

async function testStorage() {
  console.log('\n🔍 ========== Testing Firebase Storage ==========\n');

  try {
    // 1. Check if bucket exists
    console.log('1️⃣ Checking bucket...');
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log('❌ Storage bucket does NOT exist!');
      console.log('   Bucket name:', bucket.name);
      console.log('\n📝 Action Required:');
      console.log('   - Go to Firebase Console');
      console.log('   - Enable Storage');
      console.log('   - Follow the setup wizard');
      return;
    }
    
    console.log('✅ Storage bucket exists!');
    console.log('   Bucket name:', bucket.name);

    // 2. Get bucket metadata
    console.log('\n2️⃣ Getting bucket metadata...');
    const [metadata] = await bucket.getMetadata();
    console.log('✅ Bucket metadata:');
    console.log('   Location:', metadata.location);
    console.log('   Storage class:', metadata.storageClass);
    console.log('   Created:', metadata.timeCreated);

    // 3. Try to list files
    console.log('\n3️⃣ Listing files...');
    const [files] = await bucket.getFiles({ maxResults: 5 });
    console.log(`✅ Found ${files.length} files in bucket`);
    
    if (files.length > 0) {
      console.log('   First few files:');
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name}`);
      });
    } else {
      console.log('   (Bucket is empty - this is normal for new setup)');
    }

    // 4. Test write permission
    console.log('\n4️⃣ Testing write permission...');
    const testFileName = 'test/connection-test.txt';
    const testContent = Buffer.from('Firebase Storage is working! 🎉\nTested at: ' + new Date().toISOString());
    
    const file = bucket.file(testFileName);
    await file.save(testContent, {
      metadata: {
        contentType: 'text/plain',
      }
    });
    
    console.log('✅ Write test successful!');
    console.log('   Created file:', testFileName);

    // 5. Test read permission
    console.log('\n5️⃣ Testing read permission...');
    const [content] = await file.download();
    console.log('✅ Read test successful!');
    console.log('   Content:', content.toString());

    // 6. Get public URL
    console.log('\n6️⃣ Getting public URL...');
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${testFileName}`;
    console.log('✅ File is now public!');
    console.log('   URL:', publicUrl);

    // 7. Clean up test file
    console.log('\n7️⃣ Cleaning up test file...');
    await file.delete();
    console.log('✅ Test file deleted');

    // Success summary
    console.log('\n🎉 ========== ALL TESTS PASSED ==========');
    console.log('✅ Firebase Storage is properly configured!');
    console.log('✅ Bucket:', bucket.name);
    console.log('✅ Location:', metadata.location);
    console.log('✅ Read/Write permissions: Working');
    console.log('\n📌 Next Steps:');
    console.log('   1. Update Storage Rules in Firebase Console');
    console.log('   2. Test image upload from your app');
    console.log('   3. Verify images appear in Storage Console');

  } catch (error) {
    console.error('\n❌ ========== ERROR ==========');
    console.error('Error testing Storage:', error.message);
    console.error('\nError code:', error.code);
    
    if (error.code === 'storage/bucket-not-found') {
      console.log('\n📝 Action Required:');
      console.log('   Storage is NOT enabled yet!');
      console.log('   1. Go to: https://console.firebase.google.com/');
      console.log('   2. Select project: chefhub-kw');
      console.log('   3. Go to: Build > Storage');
      console.log('   4. Click "Get Started"');
      console.log('   5. Follow the setup wizard');
    } else if (error.code === 'storage/unauthorized') {
      console.log('\n📝 Action Required:');
      console.log('   Storage Rules are too restrictive!');
      console.log('   1. Go to Firebase Console > Storage > Rules');
      console.log('   2. Update the rules to allow access');
    } else {
      console.log('\nFull error:', error);
    }
  }
}

// Run the test
testStorage()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
