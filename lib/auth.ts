// ============================================
// ChefHub - Authentication Helper Functions
// ============================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { uploadImage, generateUniqueFileName, getStoragePath } from './storage';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserRole, Chef, GovernorateId } from '@/types';

// ============================================
// Customer Registration
// ============================================
export async function registerCustomer(data: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: data.fullName,
    });

    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Create user document in Firestore
    const userDoc = {
      id: userCredential.user.uid,
      email: data.email,
      phone: data.phoneNumber,
      name: data.fullName,
      role: 'customer' as UserRole,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      user: userCredential.user,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني.',
    };
  } catch (error: any) {
    console.error('Error registering customer:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

// ============================================
// Chef Registration
// ============================================
export async function registerChef(data: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  whatsappNumber: string;
  businessName: string;
  bio: string;
  specialty: string[];
  availableGovernorates: GovernorateId[];
  deliveryFees: Record<GovernorateId, number>;
  legalAgreement?: {
    agreedToTerms: boolean;
    signature: string;
    signatureDate: string;
    ipAddress?: string;
  };
  profileImage?: File | null;
}) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Update profile
    await updateProfile(userCredential.user, {
      displayName: data.fullName,
    });

    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Create user document
    const userDoc = {
      id: userCredential.user.uid,
      email: data.email,
      phone: data.phoneNumber,
      name: data.fullName,
      role: 'chef' as UserRole,
      isActive: false, // Chef needs admin approval
      // default to bundled avatar (public folder)
      profileImage: '/default-chef-avatar.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If a profile image File was provided, upload it to Storage and set URL
    if (data.profileImage) {
      try {
        const fileName = generateUniqueFileName(data.profileImage.name);
        const path = getStoragePath('profile', userCredential.user.uid, fileName);
        const url = await uploadImage(data.profileImage, path);
        // @ts-ignore - add profileImage field
        userDoc.profileImage = url;
      } catch (err) {
        console.error('Failed to upload profile image during registration:', err);
        // continue without blocking registration
      }
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create chef document
    const chefDoc = {
      id: userCredential.user.uid,
      userId: userCredential.user.uid,
      email: data.email,
      phone: data.phoneNumber,
      name: data.fullName,
      role: 'chef' as UserRole,
      status: 'pending' as const,
      businessName: data.businessName,
      specialty: data.specialty,
      bio: data.bio,
      whatsappNumber: data.whatsappNumber,
  profileImage: (userDoc as any).profileImage || '/default-chef-avatar.png',
      kitchenImages: [],
      deliveryGovernorates: data.availableGovernorates,
      deliveryFees: data.deliveryFees,
      legalAgreement: data.legalAgreement || null,
      receiveEmailNotifications: true,
      receiveWhatsAppNotifications: true,
      notificationPreferences: {
        newOrder: true,
        orderAccepted: true,
        orderReady: true,
        orderDelivered: true,
        orderCancelled: true,
        newReview: true,
        dailySummary: true,
      },
      rating: 0,
      totalRatings: 0,
      totalOrders: 0,
      totalRevenue: 0,
      commission: 10, // Default 10%
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'chefs', userCredential.user.uid), {
      ...chefDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      user: userCredential.user,
      message: 'تم إرسال طلبك. سيتم مراجعته من قبل الإدارة قريباً.',
    };
  } catch (error: any) {
    console.error('Error registering chef:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

// ============================================
// Admin Registration (Manual - Console only)
// ============================================
export async function registerAdmin(data: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  adminKey: string; // Secret key for admin registration
}) {
  try {
    // Verify admin key (should be stored in environment variables)
    if (data.adminKey !== process.env.NEXT_PUBLIC_ADMIN_REGISTRATION_KEY) {
      throw new Error('Invalid admin key');
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    await updateProfile(userCredential.user, {
      displayName: data.fullName,
    });

    const userDoc = {
      id: userCredential.user.uid,
      email: data.email,
      phone: data.phoneNumber,
      name: data.fullName,
      role: 'admin' as UserRole,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      user: userCredential.user,
      message: 'تم إنشاء حساب الأدمن بنجاح.',
    };
  } catch (error: any) {
    console.error('Error registering admin:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

// ============================================
// Sign In
// ============================================
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      // إنشاء بيانات المستخدم تلقائياً إذا لم تكن موجودة
      console.warn('⚠️ User data not found in Firestore. Creating default user data...');
      
      const defaultUserData = {
        email: userCredential.user.email || email,
        name: userCredential.user.displayName || email.split('@')[0],
        phone: userCredential.user.phoneNumber || '',
        role: 'customer' as const,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // إنشاء document في Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), defaultUserData);
      
      console.log('✅ Default user data created successfully');
      
      return {
        success: true,
        message: 'Logged in successfully',
      };
    }

    const userData = userDoc.data() as User;

    // Self-heal missing/invalid role fields (older/hand-created users can lack role/status).
    // Firestore security rules rely on `users/{uid}.role`.
    const role = (userData as unknown as { role?: unknown }).role;
    const hasValidRole = role === 'customer' || role === 'chef' || role === 'admin';
    const status = (userData as unknown as { status?: unknown }).status;

    if (!hasValidRole) {
      try {
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          role: 'customer',
          status: status ?? 'active',
          isActive: true,
          updatedAt: serverTimestamp(),
        });
        (userData as any).role = 'customer';
        (userData as any).status = (status ?? 'active') as any;
        (userData as any).isActive = true;
      } catch (e) {
        // ignore - login can still proceed; downstream ops may fail with permission-denied
      }
    } else if (role === 'customer' && typeof status === 'undefined') {
      try {
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          status: 'active',
          updatedAt: serverTimestamp(),
        });
        (userData as any).status = 'active';
      } catch (e) {
        // ignore
      }
    }

    // Self-heal for chefs: sometimes admin approval updates `status` but `isActive` stays false.
    // Treat an approved chef as active, and best-effort sync the user doc.
    if (userData.role === 'chef' && !userData.isActive) {
      const userStatus = (userData as unknown as { status?: unknown }).status;
      const isApprovedByUserDoc = userStatus === 'approved' || userStatus === 'active';

      let isApprovedByChefDoc = false;
      try {
        const chefSnap = await getDoc(doc(db, 'chefs', userCredential.user.uid));
        if (chefSnap.exists()) {
          const chefData = chefSnap.data() as Record<string, unknown>;
          const chefStatus = chefData.status;
          isApprovedByChefDoc = chefStatus === 'approved' || chefStatus === 'active' || chefData.isActive === true;
        }
      } catch (e) {
        // ignore - fallback to user doc fields
      }

      if (isApprovedByUserDoc || isApprovedByChefDoc) {
        try {
          await updateDoc(doc(db, 'users', userCredential.user.uid), {
            isActive: true,
            status: 'approved',
            updatedAt: serverTimestamp(),
          });
        } catch (e) {
          // ignore - login can still proceed
        }

        return {
          success: true,
          user: userCredential.user,
          userData: { ...userData, isActive: true } as User,
          message: 'تم تسجيل الدخول بنجاح.',
        };
      }
    }

    // Check if user is active
    if (!userData.isActive) {
      console.log('⚠️ User account is not active:', {
        email: userData.email,
        role: userData.role
      });
      
      await firebaseSignOut(auth);
      
      // رسالة مخصصة للشيفات
      if (userData.role === 'chef') {
        throw new Error('حسابك قيد المراجعة من قبل الإدارة. سيتم تفعيل حسابك خلال 24-48 ساعة. سنرسل لك بريد إلكتروني عند الموافقة على طلبك.');
      }
      
      throw new Error('حسابك غير نشط. يرجى التواصل مع الدعم الفني.');
    }

    return {
      success: true,
      user: userCredential.user,
      userData,
      message: 'تم تسجيل الدخول بنجاح.',
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    
    // إذا كان الخطأ يحتوي على رسالة مخصصة، استخدمها مباشرة
    if (error.message && !error.code) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

// ============================================
// Sign Out
// ============================================
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return {
      success: true,
      message: 'تم تسجيل الخروج بنجاح.',
    };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تسجيل الخروج.',
    };
  }
}

// ============================================
// Reset Password
// ============================================
export async function resetPassword(email: string) {
  try {
    // Configure action code settings to redirect to our custom page
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/reset-password/confirm`,
      handleCodeInApp: false,
    };
    
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return {
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
    };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

// ============================================
// Change Password
// ============================================
export async function changePassword(newPassword: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    await updatePassword(user, newPassword);

    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح.',
    };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

// ============================================
// Get Current User Data
// ============================================
export async function getCurrentUserData(): Promise<User | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting current user data:', error);
    return null;
  }
}

// ============================================
// Resend Email Verification
// ============================================
export async function resendEmailVerification() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    await sendEmailVerification(user);

    return {
      success: true,
      message: 'تم إرسال رسالة التحقق إلى بريدك الإلكتروني.',
    };
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إرسال رسالة التحقق.',
    };
  }
}

// ============================================
// Error Messages Helper
// ============================================
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'البريد الإلكتروني مستخدم بالفعل.';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح.';
    case 'auth/operation-not-allowed':
      return 'العملية غير مسموح بها.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.';
    case 'auth/user-disabled':
      return 'هذا الحساب معطل.';
    case 'auth/user-not-found':
      return 'لم يتم العثور على حساب بهذا البريد الإلكتروني.';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة.';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.';
    case 'auth/network-request-failed':
      return 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.';
    case 'auth/requires-recent-login':
      return 'يرجى تسجيل الدخول مرة أخرى لإكمال هذه العملية.';
    case 'auth/invalid-action-code':
      return 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية.';
    case 'auth/expired-action-code':
      return 'رابط إعادة التعيين منتهي الصلاحية. يرجى طلب رابط جديد.';
    case 'auth/missing-email':
      return 'يرجى إدخال البريد الإلكتروني.';
    default:
      return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
}
