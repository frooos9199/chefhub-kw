// ============================================
// ChefHub - Firestore Helper Functions
// ============================================

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import type { Chef, Dish, Order, Review, SpecialOrder } from '@/types';
import { stripUndefinedDeep } from '@/lib/helpers';

// ============================================
// Collection References
// ============================================

export const collections = {
  users: 'users',
  chefs: 'chefs',
  dishes: 'dishes',
  specialOrders: 'special_orders',
  orders: 'orders',
  reviews: 'reviews',
  invoices: 'invoices',
  notifications: 'notifications',
  whatsappNotifications: 'whatsapp_notifications',
  emailNotifications: 'email_notifications',
  auditLogs: 'audit_logs',
  settings: 'settings',
};

// ============================================
// Generic CRUD Operations
// ============================================

/**
 * Get a single document by ID
 */
export async function getDocument<T>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

/**
 * Get multiple documents with optional filters
 */
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

/**
 * Create a new document
 */
export async function createDocument<T>(
  collectionName: string,
  data: Partial<T>
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const sanitized = stripUndefinedDeep(docData);
    const docRef = await addDoc(collectionRef, sanitized);
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

/**
 * Update an existing document
 */
export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// ============================================
// Chef Operations
// ============================================

/**
 * Get approved chefs
 */
export async function getApprovedChefs(limitCount = 10): Promise<Chef[]> {
  return getDocuments<Chef>(collections.chefs, [
    where('status', '==', 'approved'),
    where('isActive', '==', true),
    orderBy('rating', 'desc'),
    limit(limitCount),
  ]);
}

/**
 * Get chef by ID
 */
export async function getChef(chefId: string): Promise<Chef | null> {
  return getDocument<Chef>(collections.chefs, chefId);
}

/**
 * Update chef status
 */
export async function updateChefStatus(
  chefId: string,
  status: 'approved' | 'rejected' | 'suspended',
  adminId: string
): Promise<void> {
  await updateDocument(collections.chefs, chefId, {
    status,
    approvedBy: adminId,
    approvedAt: status === 'approved' ? serverTimestamp() : null,
  });
}

// ============================================
// Dish Operations
// ============================================

/**
 * Get dishes by chef
 */
export async function getChefDishes(chefId: string): Promise<Dish[]> {
  return getDocuments<Dish>(collections.dishes, [
    where('chefId', '==', chefId),
    where('isAvailable', '==', true),
    orderBy('createdAt', 'desc'),
  ]);
}

/**
 * Get popular dishes
 */
export async function getPopularDishes(limitCount = 10): Promise<Dish[]> {
  return getDocuments<Dish>(collections.dishes, [
    where('isAvailable', '==', true),
    orderBy('totalOrders', 'desc'),
    limit(limitCount),
  ]);
}

// ============================================
// Order Operations
// ============================================

/**
 * Create a new order
 */
export async function createOrder(orderData: Partial<Order>): Promise<string> {
  const orderId = await createDocument<Order>(collections.orders, orderData);
  
  // Update chef statistics
  if (orderData.chefId) {
    const chefRef = doc(db, collections.chefs, orderData.chefId);
    await updateDoc(chefRef, {
      totalOrders: increment(1),
      totalRevenue: increment(orderData.total || 0),
    });
  }
  
  // Update dishes statistics
  if (orderData.items) {
    for (const item of orderData.items) {
      const dishRef = doc(db, collections.dishes, item.dishId);
      await updateDoc(dishRef, {
        totalOrders: increment(item.quantity),
      });
    }
  }
  
  return orderId;
}

/**
 * Get orders by customer
 */
export async function getCustomerOrders(
  customerId: string,
  limitCount = 20
): Promise<Order[]> {
  return getDocuments<Order>(collections.orders, [
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ]);
}

/**
 * Get orders by chef
 */
export async function getChefOrders(
  chefId: string,
  status?: string,
  limitCount = 50
): Promise<Order[]> {
  const constraints: QueryConstraint[] = [
    where('chefId', '==', chefId),
  ];
  
  if (status) {
    constraints.push(where('status', '==', status));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(limitCount));
  
  return getDocuments<Order>(collections.orders, constraints);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<void> {
  const updateData: any = { status };
  
  const statusTimestamps: Record<string, string> = {
    accepted: 'acceptedAt',
    preparing: 'preparingAt',
    ready: 'readyAt',
    delivered: 'deliveredAt',
    cancelled: 'cancelledAt',
  };
  
  if (statusTimestamps[status]) {
    updateData[statusTimestamps[status]] = serverTimestamp();
  }
  
  await updateDocument(collections.orders, orderId, updateData);
}

// ============================================
// Review Operations
// ============================================

/**
 * Create a review
 */
export async function createReview(reviewData: Partial<Review>): Promise<string> {
  const reviewId = await createDocument<Review>(collections.reviews, reviewData);
  
  // Update chef rating
  if (reviewData.chefId && reviewData.rating) {
    const chefRef = doc(db, collections.chefs, reviewData.chefId);
    const chef = await getDoc(chefRef);
    
    if (chef.exists()) {
      const chefData = chef.data();
      const totalRatings = (chefData.totalRatings || 0) + 1;
      const currentRating = chefData.rating || 0;
      const newRating = ((currentRating * (totalRatings - 1)) + reviewData.rating) / totalRatings;
      
      await updateDoc(chefRef, {
        rating: Math.round(newRating * 10) / 10, // تقريب لرقم واحد بعد الفاصلة
        totalRatings,
      });
    }
  }
  
  return reviewId;
}

/**
 * Get chef reviews
 */
export async function getChefReviews(
  chefId: string,
  limitCount = 20
): Promise<Review[]> {
  return getDocuments<Review>(collections.reviews, [
    where('chefId', '==', chefId),
    where('isHidden', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ]);
}

// ============================================
// Special Order Operations
// ============================================

/**
 * Get active special orders
 */
export async function getActiveSpecialOrders(): Promise<SpecialOrder[]> {
  const now = Timestamp.now();
  
  return getDocuments<SpecialOrder>(collections.specialOrders, [
    where('isActive', '==', true),
    where('isFull', '==', false),
    where('startDate', '<=', now),
    where('endDate', '>=', now),
    orderBy('createdAt', 'desc'),
  ]);
}

/**
 * Increment special order count
 */
export async function incrementSpecialOrderCount(specialOrderId: string): Promise<void> {
  const specialOrderRef = doc(db, collections.specialOrders, specialOrderId);
  const specialOrder = await getDoc(specialOrderRef);
  
  if (specialOrder.exists()) {
    const data = specialOrder.data();
    const newCount = (data.currentOrders || 0) + 1;
    const isFull = newCount >= data.maxOrders;
    
    await updateDoc(specialOrderRef, {
      currentOrders: increment(1),
      isFull,
    });
  }
}

// ============================================
// Statistics Operations
// ============================================

/**
 * Get platform statistics
 */
export async function getPlatformStats() {
  const [totalChefs, totalOrders, activeChefs] = await Promise.all([
    getDocs(collection(db, collections.chefs)),
    getDocs(collection(db, collections.orders)),
    getDocs(query(
      collection(db, collections.chefs),
      where('status', '==', 'approved'),
      where('isActive', '==', true)
    )),
  ]);
  
  return {
    totalChefs: totalChefs.size,
    totalOrders: totalOrders.size,
    activeChefs: activeChefs.size,
  };
}

/**
 * Get chef statistics
 */
export async function getChefStats(chefId: string) {
  const [orders, dishes, reviews] = await Promise.all([
    getChefOrders(chefId),
    getChefDishes(chefId),
    getChefReviews(chefId),
  ]);
  
  const totalRevenue = orders.reduce((sum, order) => sum + (order.chefEarnings || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  
  return {
    totalOrders: orders.length,
    completedOrders,
    totalRevenue,
    totalDishes: dishes.length,
    totalReviews: reviews.length,
    avgRating: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0,
  };
}
