'use client';

// ============================================
// ChefHub - Authentication Context with Firebase
// ============================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { users } from '@/lib/firebase/firestore';
import type { UserRole } from '@/types';

interface UserData {
  id: string;
  uid: string; // إضافة uid للتوافق
  chefId?: string; // معرف الشيف في مجموعة chefs (للمستخدمين من نوع chef)
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'deleted';
  isActive: boolean;
  profileImage?: string;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isChef: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAuthenticated: false,
  isCustomer: false,
  isChef: false,
  isAdmin: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      // Listen to Firestore user document changes
      const unsubscribeFirestore = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (snapshot) => {
          if (snapshot.exists()) {
            setUserData({ 
              uid: snapshot.id, 
              id: snapshot.id, // للتوافق مع الكود القديم
              ...snapshot.data() 
            } as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to user data:', error);
          setLoading(false);
        }
      );

      return () => unsubscribeFirestore();
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'فشل تسجيل الدخول');
    }
  };

  // Sign up new user
  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: UserRole
  ) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        phone,
        role,
        status: 'active',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // If chef, create chef profile
      if (role === 'chef') {
        await setDoc(doc(db, 'chef', user.uid), {
          userId: user.uid,
          name,
          email,
          phone,
          bio: '',
          specialty: '',
          governorate: '',
          area: '',
          address: '',
          status: 'pending',
          isVerified: false,
          rating: 0,
          totalOrders: 0,
          totalRevenue: 0,
          commission: 0,
          documents: {},
          settings: {
            notifications: {
              email: true,
              whatsapp: true,
              newOrder: true,
              orderUpdate: true,
            },
            delivery: {
              governorates: [],
              fees: {},
              estimatedTime: 60,
            },
            workingHours: {},
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'فشل إنشاء الحساب');
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'فشل تسجيل الخروج');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'فشل إرسال رابط إعادة تعيين كلمة المرور');
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    isAuthenticated: !!user && !!userData,
    isCustomer: userData?.role === 'customer',
    isChef: userData?.role === 'chef',
    isAdmin: userData?.role === 'admin',
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
