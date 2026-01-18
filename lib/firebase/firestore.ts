// ============================================
// ChefHub - Firestore Helper Functions
// ============================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  WhereFilterOp,
  DocumentData,
  QueryConstraint,
  addDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// ============================================
// Generic CRUD Operations
// ============================================

/**
 * Create a new document in a collection
 */
export async function createDocument(
  collectionName: string,
  data: DocumentData,
  customId?: string
) {
  try {
    const timestamp = serverTimestamp();
    const docData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (customId) {
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, docData);
      return { id: customId, ...docData };
    } else {
      const docRef = await addDoc(collection(db, collectionName), docData);
      return { id: docRef.id, ...docData };
    }
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument(collectionName: string, documentId: string) {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: Partial<DocumentData>
) {
  try {
    const docRef = doc(db, collectionName, documentId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, updateData);
    return { id: documentId, ...updateData };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName: string, documentId: string) {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

/**
 * Get all documents from a collection with optional filters
 */
export async function getDocuments(
  collectionName: string,
  filters?: {
    field: string;
    operator: WhereFilterOp;
    value: any;
  }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
) {
  try {
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (filters) {
      filters.forEach((filter) => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });
    }

    // Add ordering
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

// ============================================
// Collection-Specific Functions
// ============================================

/**
 * Users Collection
 */
export const users = {
  create: (data: DocumentData, uid: string) => createDocument('users', data, uid),
  get: (uid: string) => getDocument('users', uid),
  update: (uid: string, data: Partial<DocumentData>) => updateDocument('users', uid, data),
  delete: (uid: string) => deleteDocument('users', uid),
};

/**
 * Chefs Collection
 */
export const chefs = {
  create: (data: DocumentData, uid: string) => createDocument('chef', data, uid),
  get: (uid: string) => getDocument('chef', uid),
  update: (uid: string, data: Partial<DocumentData>) => updateDocument('chef', uid, data),
  delete: (uid: string) => deleteDocument('chef', uid),
  getAll: () => getDocuments('chef'),
  getByStatus: (status: string) => 
    getDocuments('chef', [{ field: 'status', operator: '==', value: status }]),
  getPending: () => 
    getDocuments('chef', [{ field: 'status', operator: '==', value: 'pending' }]),
  getActive: () => 
    getDocuments('chef', [{ field: 'status', operator: '==', value: 'active' }]),
};

/**
 * Dishes Collection
 */
export const dishes = {
  create: (data: DocumentData) => createDocument('dishes', data),
  get: (id: string) => getDocument('dishes', id),
  update: (id: string, data: Partial<DocumentData>) => updateDocument('dishes', id, data),
  delete: (id: string) => deleteDocument('dishes', id),
  getByChef: (chefId: string) => 
    getDocuments('dishes', [{ field: 'chefId', operator: '==', value: chefId }]),
  getActive: () => 
    getDocuments('dishes', [{ field: 'isActive', operator: '==', value: true }]),
};

/**
 * Orders Collection
 */
export const orders = {
  create: (data: DocumentData) => createDocument('orders', data),
  get: (id: string) => getDocument('orders', id),
  update: (id: string, data: Partial<DocumentData>) => updateDocument('orders', id, data),
  delete: (id: string) => deleteDocument('orders', id),
  getByCustomer: (customerId: string) => 
    getDocuments('orders', [{ field: 'customerId', operator: '==', value: customerId }], 'createdAt'),
  getByChef: (chefId: string) => 
    getDocuments('orders', [{ field: 'chefId', operator: '==', value: chefId }], 'createdAt'),
  getByStatus: (status: string) => 
    getDocuments('orders', [{ field: 'status', operator: '==', value: status }], 'createdAt'),
  getAll: () => getDocuments('orders', undefined, 'createdAt'),
};

/**
 * Reviews Collection
 */
export const reviews = {
  create: (data: DocumentData) => createDocument('reviews', data),
  get: (id: string) => getDocument('reviews', id),
  update: (id: string, data: Partial<DocumentData>) => updateDocument('reviews', id, data),
  delete: (id: string) => deleteDocument('reviews', id),
  getByChef: (chefId: string) => 
    getDocuments('reviews', [{ field: 'chefId', operator: '==', value: chefId }], 'createdAt'),
  getByDish: (dishId: string) => 
    getDocuments('reviews', [{ field: 'dishId', operator: '==', value: dishId }], 'createdAt'),
};

/**
 * Special Orders Collection
 */
export const specialOrders = {
  create: (data: DocumentData) => createDocument('specialOrders', data),
  get: (id: string) => getDocument('specialOrders', id),
  update: (id: string, data: Partial<DocumentData>) => updateDocument('specialOrders', id, data),
  delete: (id: string) => deleteDocument('specialOrders', id),
  getByChef: (chefId: string) => 
    getDocuments('specialOrders', [{ field: 'chefId', operator: '==', value: chefId }], 'createdAt'),
  getActive: () => 
    getDocuments('specialOrders', [{ field: 'status', operator: '==', value: 'active' }], 'createdAt'),
};

export default {
  users,
  chefs,
  dishes,
  orders,
  reviews,
  specialOrders,
};
