// ============================================
// API Route: Delete User from Firebase Auth
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, adminId } = await request.json();

    if (!userId || !adminId) {
      return NextResponse.json(
        { error: 'Missing userId or adminId' },
        { status: 400 }
      );
    }

    // التحقق من صلاحيات الأدمن باستخدام client SDK
    const adminDocRef = doc(db, 'users', adminId);
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists() || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // حذف من Firestore باستخدام client SDK
    try {
      await deleteDoc(doc(db, 'users', userId));
      console.log(`✅ Deleted user ${userId} from users collection`);
    } catch (firestoreError) {
      console.error('Error deleting from Firestore users:', firestoreError);
    }

    try {
      await deleteDoc(doc(db, 'chefs', userId));
      console.log(`✅ Deleted chef ${userId} from chefs collection`);
    } catch (firestoreError) {
      console.error('Error deleting from Firestore chefs:', firestoreError);
    }

    // حذف من Firebase Authentication (إذا كان Admin SDK متاحاً)
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        await adminAuth.deleteUser(userId);
        console.log(`✅ Deleted user ${userId} from Firebase Auth`);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`⚠️ User ${userId} not found in Firebase Auth (already deleted or never existed)`);
        } else {
          console.error('Error deleting from Auth:', authError);
          // لا نفشل العملية بالكامل إذا فشل الحذف من Auth
        }
      }
    } else {
      console.warn('⚠️ Firebase Admin not configured. Skipping Auth deletion.');
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully from Firestore' + (adminAuth ? ' and Firebase Auth' : ' (Auth deletion skipped - Admin SDK not configured)')
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
