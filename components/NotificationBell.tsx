'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  titleAr: string;
  messageAr: string;
  isRead: boolean;
  link?: string;
  createdAt: any;
}

export function NotificationBell() {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // إخفاء الجرس للعملاء العاديين أو المستخدمين غير المسجلين
  if (!userData || userData.role === 'customer') {
    return null;
  }

  useEffect(() => {
    if (!userData?.uid) return;

    // الاستماع للإشعارات الخاصة بالمستخدم (شيف أو أدمن)
    const userId = userData.role === 'admin' ? 'admin' : userData.uid;
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs: Notification[] = [];
        let unread = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          notifs.push({
            id: doc.id,
            ...data,
          } as Notification);
          
          if (!data.isRead) {
            unread++;
          }
        });

        setNotifications(notifs);
        setUnreadCount(unread);
      },
      (error) => {
        console.error('❌ Notification listener error:', error);
        // في حالة الخطأ، اخفِ الإشعارات بدلاً من إظهار خطأ
        setNotifications([]);
        setUnreadCount(0);
      }
    );

    return () => unsubscribe();
  }, [userData]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notifications Panel */}
          <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">الإشعارات</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">{unreadCount} إشعار جديد</p>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link || '#'}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      !notif.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {notif.titleAr}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {notif.messageAr}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <Link
                  href={userData.role === 'admin' ? '/admin/notifications' : '/chef/notifications'}
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium block text-center"
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatTime(timestamp: any): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  
  return date.toLocaleDateString('ar');
}
