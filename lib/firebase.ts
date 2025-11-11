// ============================================
// ChefHub - Firebase Configuration
// ============================================

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing! Check your environment variables.');
  console.log('Required vars:', {
    apiKey: firebaseConfig.apiKey ? '✅' : '❌',
    authDomain: firebaseConfig.authDomain ? '✅' : '❌',
    projectId: firebaseConfig.projectId ? '✅' : '❌',
    storageBucket: firebaseConfig.storageBucket ? '✅' : '❌',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✅' : '❌',
    appId: firebaseConfig.appId ? '✅' : '❌',
  });
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
