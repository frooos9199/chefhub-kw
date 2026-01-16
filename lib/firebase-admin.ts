// ============================================
// Firebase Admin SDK Configuration
// ============================================
// Used for server-side operations like deleting users from Auth

import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;
let adminStorage: admin.storage.Storage | null = null;

// Initialize Firebase Admin SDK only when needed
function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase Admin credentials not configured. User deletion from Auth will be skipped.');
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket: `${projectId}.appspot.com`,
    });
    console.log('✅ Firebase Admin initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    return null;
  }
}

// Lazy initialization functions
export function getAdminAuth(): admin.auth.Auth | null {
  if (!adminAuth) {
    const app = initializeAdmin();
    if (app) {
      adminAuth = admin.auth(app);
    }
  }
  return adminAuth;
}

export function getAdminDb(): admin.firestore.Firestore | null {
  if (!adminDb) {
    const app = initializeAdmin();
    if (app) {
      adminDb = admin.firestore(app);
    }
  }
  return adminDb;
}

export function getAdminStorage(): admin.storage.Storage | null {
  if (!adminStorage) {
    const app = initializeAdmin();
    if (app) {
      adminStorage = admin.storage(app);
    }
  }
  return adminStorage;
}

export default admin;
