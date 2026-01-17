'use client';

import { useState } from 'react';
import { Bell, Mail, MessageCircle, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function TestNotificationsPage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testInAppNotification = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const userId = userData?.uid || 'test-user';
      
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'test',
        titleAr: 'اختبار الإشعارات ✅',
        titleEn: 'Notification Test ✅',
        messageAr: 'هذا إشعار تجريبي للتأكد من عمل النظام',
        messageEn: 'This is a test notification to verify the system',
        isRead: false,
        link: '/test-notifications',
        createdAt: new Date()
      });
      
      setResult('✅ تم إنشاء الإشعار بنجاح! تحقق من جرس الإشعارات في الهيدر 🔔');
    } catch (error: any) {
      setResult('❌ خطأ: ' + error.message);
    }
    
    setLoading(false);
  };

  const testEmailNotification = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const { sendEmail } = await import('@/lib/email');
      
      const result = await sendEmail(
        'test@example.com',
        'اختبار الإيميل - ChefHub',
        '<h1>مرحباً!</h1><p>هذا إيميل تجريبي</p>'
      );
      
      if (result) {
        setResult('✅ تم إرسال الإيميل بنجاح!');
      } else {
        setResult('ℹ️ الإيميل في وضع DEBUG - تحقق من console للتفاصيل');
      }
    } catch (error: any) {
      setResult('❌ خطأ: ' + error.message);
    }
    
    setLoading(false);
  };

  const testWhatsAppNotification = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const { sendWhatsAppMessage } = await import('@/lib/whatsapp');
      
      const result = await sendWhatsAppMessage(
        '+96512345678',
        'مرحباً! هذه رسالة واتساب تجريبية من ChefHub'
      );
      
      if (result) {
        setResult('✅ تم إرسال رسالة WhatsApp بنجاح!');
      } else {
        setResult('ℹ️ WhatsApp في وضع DEBUG - تحقق من console للتفاصيل');
      }
    } catch (error: any) {
      setResult('❌ خطأ: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 اختبار نظام الإشعارات
          </h1>
          <p className="text-gray-600 mb-8">
            اختبر جميع قنوات الإشعارات في ChefHub
          </p>

          {/* Status */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">📊 حالة النظام:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✅ الإشعارات الداخلية: <span className="font-bold">فعالة</span></li>
              <li>⏸️ الإيميل (SendGrid): <span className="font-bold">في انتظار التفعيل</span></li>
              <li>⏸️ WhatsApp (Twilio): <span className="font-bold">غير مُعد</span></li>
            </ul>
          </div>

          {/* Test Buttons */}
          <div className="space-y-4">
            {/* In-App Notification */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    إشعار داخل الموقع
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    يظهر في جرس الإشعارات في الهيدر (فعال حالياً ✅)
                  </p>
                  <button
                    onClick={testInAppNotification}
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'جاري الإرسال...' : 'اختبار الإشعار الداخلي'}
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    إشعار بالإيميل
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    عبر SendGrid (في وضع DEBUG - في انتظار التفعيل ⏸️)
                  </p>
                  <button
                    onClick={testEmailNotification}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'جاري الإرسال...' : 'اختبار الإيميل'}
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    إشعار WhatsApp
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    عبر Twilio (في وضع DEBUG - غير مُعد ⏸️)
                  </p>
                  <button
                    onClick={testWhatsAppNotification}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'جاري الإرسال...' : 'اختبار WhatsApp'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-mono whitespace-pre-wrap">{result}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
            <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              ملاحظات مهمة:
            </h3>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li>• <strong>الإشعارات الداخلية:</strong> تعمل بشكل كامل الآن ✅</li>
              <li>• <strong>الإيميل:</strong> سيعمل بعد تفعيل SendGrid وتثبيت المكتبة</li>
              <li>• <strong>WhatsApp:</strong> يحتاج إعداد Twilio</li>
              <li>• افتح Console (F12) لرؤية تفاصيل الـ DEBUG</li>
              <li>• الإشعارات الداخلية تظهر في جرس الإشعارات 🔔 في الهيدر</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
