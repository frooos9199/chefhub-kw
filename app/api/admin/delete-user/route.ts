// ============================================
// API Route: Delete User from Firebase Auth
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, chefId, adminId } = await request.json();
    
    console.log('🗑️ Delete request received:', { userId, chefId, adminId });

    if ((!userId && !chefId) || !adminId) {
      return NextResponse.json(
        { error: 'Missing userId/chefId or adminId' },
        { status: 400 }
      );
    }

    // الحصول على Admin SDK
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured' },
        { status: 500 }
      );
    }

    // التحقق من صلاحيات الأدمن
    const adminDocRef = adminDb.collection('users').doc(adminId);
    const adminDoc = await adminDocRef.get();
    
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      console.error('❌ Unauthorized access attempt by:', adminId);
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin verified');

    let userIdToDelete = userId;
    let chefIdToDelete = chefId;

    // إذا كان لدينا chefId فقط، نحصل على userId
    if (chefId && !userId) {
      try {
        const chefDoc = await adminDb.collection('chefs').doc(chefId).get();
        if (chefDoc.exists && chefDoc.data()?.userId) {
          userIdToDelete = chefDoc.data()?.userId;
          console.log(`✅ Found userId: ${userIdToDelete} for chefId: ${chefId}`);
        } else {
          console.warn(`⚠️ Chef doc not found or missing userId for chefId: ${chefId}`);
        }
      } catch (error) {
        console.error('❌ Error fetching chef doc:', error);
      }
    }
    
    // إذا كان لدينا userId فقط، نحصل على chefId
    if (userId && !chefId) {
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data()?.chefId) {
          chefIdToDelete = userDoc.data()?.chefId;
          console.log(`✅ Found chefId: ${chefIdToDelete} for userId: ${userId}`);
        } else {
          console.warn(`⚠️ User doc not found or missing chefId for userId: ${userId}`);
        }
      } catch (error) {
        console.error('❌ Error fetching user doc:', error);
      }
    }

    console.log('🎯 Will delete - userId:', userIdToDelete, 'chefId:', chefIdToDelete);

    // حذف من Firestore users collection باستخدام Admin SDK
    if (userIdToDelete) {
      try {
        await adminDb.collection('users').doc(userIdToDelete).delete();
        console.log(`✅ DELETED user ${userIdToDelete} from users collection`);
      } catch (firestoreError) {
        console.error('❌ Error deleting from Firestore users:', firestoreError);
        throw firestoreError;
      }
    }

    // حذف من Firestore chefs collection باستخدام Admin SDK
    if (chefIdToDelete) {
      try {
        await adminDb.collection('chefs').doc(chefIdToDelete).delete();
        console.log(`✅ DELETED chef ${chefIdToDelete} from chefs collection`);
      } catch (firestoreError) {
        console.error('❌ Error deleting from Firestore chefs:', firestoreError);
        throw firestoreError;
      }
    }

    // حذف من Firebase Authentication
    if (adminAuth && userIdToDelete) {
      try {
        await adminAuth.deleteUser(userIdToDelete);
        console.log(`✅ DELETED user ${userIdToDelete} from Firebase Auth`);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`⚠️ User ${userIdToDelete} not found in Firebase Auth (already deleted or never existed)`);
        } else {
          console.error('❌ Error deleting from Auth:', authError);
          // لا نفشل العملية بالكامل إذا فشل الحذف من Auth
        }
      }
    } else {
      console.warn('⚠️ Firebase Admin Auth not configured. Skipping Auth deletion.');
    }

    console.log('🎉 Delete operation completed successfully');

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
