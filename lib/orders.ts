// ============================================
// ChefHub - Order Management
// ============================================

import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus, PaymentStatus } from '@/types';

/**
 * إنشاء رقم طلب فريد
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

/**
 * إنشاء طلب جديد
 */
export async function createOrder(orderData: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    dishId: string;
    dishName: string;
    chefId: string;
    chefName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  deliveryAddress: {
    governorate: string;
    area: string;
    block?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    additionalInfo?: string;
    phoneNumber: string;
  };
  paymentMethod: 'knet' | 'visa' | 'cod';
  subtotal: number;
  deliveryFee: number;
  total: number;
}): Promise<{ orderId: string; orderNumber: string }> {
  try {
    const orderNumber = generateOrderNumber();
    
    // تجميع الأصناف حسب الشيف
    const chefOrders = new Map<string, typeof orderData.items>();
    
    orderData.items.forEach(item => {
      const chefItems = chefOrders.get(item.chefId) || [];
      chefItems.push(item);
      chefOrders.set(item.chefId, chefItems);
    });

    // إنشاء طلب رئيسي
    const order = {
      orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      items: orderData.items,
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: (orderData.paymentMethod === 'cod' ? 'pending' : 'pending') as PaymentStatus,
      status: 'pending' as OrderStatus,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(db, 'orders'), order);

    // إنشاء طلبات فرعية لكل شيف
    for (const [chefId, items] of chefOrders) {
      const chefTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      await addDoc(collection(db, 'chefOrders'), {
        orderNumber,
        mainOrderId: orderRef.id,
        chefId,
        chefName: items[0].chefName,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        items,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: 'pending' as OrderStatus,
        total: chefTotal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    console.log('✅ Order created successfully:', orderNumber);
    
    return {
      orderId: orderRef.id,
      orderNumber,
    };
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

/**
 * جلب طلب حسب الرقم
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('orderNumber', '==', orderNumber)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Order;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
}

/**
 * جلب طلب حسب الـ ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (!orderDoc.exists()) {
      return null;
    }
    
    return {
      id: orderDoc.id,
      ...orderDoc.data(),
    } as Order;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
}

/**
 * تحديث حالة الطلب
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Order status updated:', orderId, status);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
}

/**
 * تحديث حالة الدفع
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      paymentStatus,
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Payment status updated:', orderId, paymentStatus);
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  }
}

/**
 * جلب طلبات العميل
 */
export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    throw error;
  }
}

/**
 * جلب طلبات الشيف
 */
export async function getChefOrders(chefId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, 'chefOrders'),
      where('chefId', '==', chefId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('❌ Error fetching chef orders:', error);
    throw error;
  }
}
