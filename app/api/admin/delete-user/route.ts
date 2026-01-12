// ============================================
// API Route: Delete User from Firebase Auth
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, adminId } = await request.json();

    if (!userId || !adminId) {
      return NextResponse.json(
        { error: 'Missing userId or adminId' },
        { status: 400 }
      );
    }

    // التحقق من صلاحيات الأدمن
    const adminDoc = await adminDb.collection('users').doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // حذف المستخدم من Firebase Authentication
    try {
      await adminAuth.deleteUser(userId);
      console.log(`✅ Deleted user ${userId} from Firebase Auth`);
    } catch (authError: any) {
      // إذا كان المستخدم غير موجود في Auth، نتجاهل الخطأ
      if (authError.code === 'auth/user-not-found') {
        console.log(`⚠️ User ${userId} not found in Firebase Auth (already deleted or never existed)`);
      } else {
        throw authError;
      }
    }

    // حذف من Firestore
    await adminDb.collection('users').doc(userId).delete();
    await adminDb.collection('chefs').doc(userId).delete();

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully from Auth and Firestore'
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
