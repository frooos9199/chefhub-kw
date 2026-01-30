'use client';

import { useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function TestOrdersPage() {
  const { user, userData } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const allOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(allOrders);
      setTestResult(`✅ تم جلب ${allOrders.length} طلب`);
    } catch (error) {
      setTestResult(`❌ خطأ: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchChefOrders = async () => {
    if (!user) {
      setTestResult('❌ يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('chefId', '==', user.uid));
      const ordersSnapshot = await getDocs(q);
      const chefOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(chefOrders);
      setTestResult(`✅ تم جلب ${chefOrders.length} طلب للشيف ${userData?.name}`);
    } catch (error) {
      setTestResult(`❌ خطأ: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = async () => {
    if (!user) {
      setTestResult('❌ يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      const chefsSnapshot = await getDocs(query(collection(db, 'chefs'), where('status', '==', 'approved')));
      
      if (chefsSnapshot.empty) {
        setTestResult('❌ لا يوجد شيفات مفعلين');
        return;
      }

      const firstChef = chefsSnapshot.docs[0];
      const chefData = firstChef.data();

      const testOrder = {
        orderNumber: `TEST-${Date.now()}`,
        customerId: user.uid,
        customerName: userData?.name || 'عميل تجريبي',
        customerEmail: userData?.email || user.email,
        customerPhone: userData?.phone || '12345678',
        chefId: firstChef.id,
        chefName: chefData.businessName || chefData.name,
        items: [{
          dishId: 'test-dish-1',
          dishName: 'طبق تجريبي',
          chefId: firstChef.id,
          chefName: chefData.businessName || chefData.name,
          quantity: 2,
          price: 5.000,
        }],
        deliveryAddress: {
          governorate: 'العاصمة',
          area: 'السالمية',
          phoneNumber: '12345678'
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'pending',
        subtotal: 10.000,
        deliveryFee: 1.500,
        total: 11.500,
        commission: 1.000,
        chefEarnings: 10.500,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), testOrder);
      setTestResult(`✅ تم إنشاء طلب تجريبي!\nID: ${docRef.id}\nرقم: ${testOrder.orderNumber}\nالشيف: ${testOrder.chefName}`);
      fetchAllOrders();
    } catch (error) {
      setTestResult(`❌ خطأ: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 mb-8">🧪 اختبار نظام الطلبات</h1>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
          <h2 className="text-xl font-bold mb-4">معلومات المستخدم</h2>
          {user ? (
            <div className="space-y-2 text-sm">
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>الاسم:</strong> {userData?.name || 'غير محدد'}</p>
              <p><strong>الدور:</strong> {userData?.role || 'غير محدد'}</p>
            </div>
          ) : (
            <p className="text-red-600">❌ غير مسجل دخول</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
          <h2 className="text-xl font-bold mb-4">الإجراءات</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchAllOrders}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              جلب جميع الطلبات
            </button>
            <button
              onClick={fetchChefOrders}
              disabled={loading || !user}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              جلب طلبات الشيف
            </button>
            <button
              onClick={createTestOrder}
              disabled={loading || !user}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              إنشاء طلب تجريبي
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-xl font-bold mb-4">النتيجة</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-xl">{testResult}</pre>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <h2 className="text-xl font-bold mb-4">الطلبات ({orders.length})</h2>
          {loading ? (
            <p>جاري التحميل...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">لا توجد طلبات</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>رقم الطلب:</strong> {order.orderNumber}</div>
                    <div><strong>الحالة:</strong> {order.status}</div>
                    <div><strong>العميل:</strong> {order.customerName}</div>
                    <div><strong>الشيف:</strong> {order.chefName}</div>
                    <div><strong>Chef ID:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{order.chefId}</code></div>
                    <div><strong>المبلغ:</strong> {order.total?.toFixed(3)} د.ك</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
