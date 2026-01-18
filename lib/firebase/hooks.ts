// ============================================
// ChefHub - Custom Firebase Hooks
// ============================================

'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Hook to listen to a single document in real-time
 */
export function useDocument(collectionName: string, documentId: string | null) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, collectionName, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to document:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error };
}

/**
 * Hook to listen to a collection in real-time with filters
 */
export function useCollection(
  collectionName: string,
  filters?: {
    field: string;
    operator: any;
    value: any;
  }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents: DocumentData[] = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to collection:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(filters), orderByField, orderDirection, limitCount]);

  return { data, loading, error };
}

/**
 * Hook to get chef's dishes in real-time
 */
export function useChefDishes(chefId: string | null) {
  return useCollection(
    'dishes',
    chefId ? [{ field: 'chefId', operator: '==', value: chefId }] : undefined,
    'createdAt',
    'desc'
  );
}

/**
 * Hook to get chef's orders in real-time
 */
export function useChefOrders(chefId: string | null, status?: string) {
  const filters = [];
  if (chefId) {
    filters.push({ field: 'chefId', operator: '==', value: chefId });
  }
  if (status) {
    filters.push({ field: 'status', operator: '==', value: status });
  }

  return useCollection('orders', filters.length > 0 ? filters : undefined, 'createdAt', 'desc');
}

/**
 * Hook to get customer's orders in real-time
 */
export function useCustomerOrders(customerId: string | null) {
  return useCollection(
    'orders',
    customerId ? [{ field: 'customerId', operator: '==', value: customerId }] : undefined,
    'createdAt',
    'desc'
  );
}

/**
 * Hook to get active chefs
 */
export function useActiveChefs() {
  return useCollection(
    'chef',
    [
      { field: 'status', operator: '==', value: 'active' },
      { field: 'isActive', operator: '==', value: true }
    ],
    'rating',
    'desc'
  );
}

/**
 * Hook to get pending chefs (for admin)
 */
export function usePendingChefs() {
  return useCollection(
    'chef',
    [{ field: 'status', operator: '==', value: 'pending' }],
    'createdAt',
    'desc'
  );
}

/**
 * Hook to get all active dishes
 */
export function useActiveDishes() {
  return useCollection(
    'dishes',
    [{ field: 'isActive', operator: '==', value: true }],
    'createdAt',
    'desc'
  );
}

/**
 * Hook to get all active dishes with chef information
 */
export function useActiveDishesWithChefs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDishesWithChefs = async () => {
      try {
        setLoading(true);
        const dishesRef = collection(db, 'dishes');
        const q = query(
          dishesRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        
        // Fetch dishes with chef information
        const dishesWithChefs = await Promise.all(
          snapshot.docs.map(async (dishDoc: any) => {
            const dishData = { id: dishDoc.id, ...dishDoc.data() };
            
            // Fetch chef data
            if (dishData.chefId) {
              try {
                const chefDoc = await getDoc(doc(db, 'chef', dishData.chefId));
                if (chefDoc.exists()) {
                  const chefData = chefDoc.data();
                  dishData.chefName = chefData.name || dishData.chefName;
                  dishData.chefImage = chefData.profileImage;
                  
                  // Count chef's dishes
                  const chefDishesQuery = query(
                    collection(db, 'dishes'),
                    where('chefId', '==', dishData.chefId),
                    where('isActive', '==', true)
                  );
                  const chefDishesSnapshot = await getDocs(chefDishesQuery);
                  dishData.chefDishesCount = chefDishesSnapshot.size;
                }
              } catch (err) {
                console.error('Error fetching chef data:', err);
              }
            }
            
            return dishData;
          })
        );
        
        setData(dishesWithChefs);
        setError(null);
      } catch (err) {
        console.error('Error in useActiveDishesWithChefs:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishesWithChefs();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to get chef's special orders
 */
export function useChefSpecialOrders(chefId: string | null) {
  return useCollection(
    'specialOrders',
    chefId ? [{ field: 'chefId', operator: '==', value: chefId }] : undefined,
    'createdAt',
    'desc'
  );
}

/**
 * Hook to get active special orders
 */
export function useActiveSpecialOrders() {
  return useCollection(
    'specialOrders',
    [{ field: 'status', operator: '==', value: 'active' }],
    'createdAt',
    'desc'
  );
}

/**
 * Hook to get reviews for a chef
 */
export function useChefReviews(chefId: string | null) {
  return useCollection(
    'reviews',
    chefId ? [{ field: 'chefId', operator: '==', value: chefId }] : undefined,
    'createdAt',
    'desc'
  );
}

/**
 * Hook to get reviews for a dish
 */
export function useDishReviews(dishId: string | null) {
  return useCollection(
    'reviews',
    dishId ? [{ field: 'dishId', operator: '==', value: dishId }] : undefined,
    'createdAt',
    'desc'
  );
}

export default {
  useDocument,
  useCollection,
  useChefDishes,
  useChefOrders,
  useCustomerOrders,
  useActiveChefs,
  usePendingChefs,
  useActiveDishes,
  useActiveDishesWithChefs,
  useChefSpecialOrders,
  useActiveSpecialOrders,
  useChefReviews,
  useDishReviews,
};
