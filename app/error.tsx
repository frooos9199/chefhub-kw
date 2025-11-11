'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-6 inline-block rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 p-4">
            <ChefHat className="h-16 w-16 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            عذراً! حدث خطأ ما 😔
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-6">
            نعتذر عن هذا الخلل. يبدو أن هناك مشكلة في تحميل الصفحة.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              🔄 حاول مرة أخرى
            </button>

            <Link
              href="/"
              className="px-8 py-4 border-2 border-emerald-600 text-emerald-700 text-lg font-bold rounded-xl hover:bg-emerald-50 transition-all transform hover:scale-105"
            >
              🏠 الصفحة الرئيسية
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              💡 <strong>إذا استمرت المشكلة:</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• تأكد من اتصالك بالإنترنت</li>
              <li>• حاول تحديث الصفحة (F5)</li>
              <li>• امسح ذاكرة المتصفح (Cache)</li>
              <li>• تواصل مع الدعم الفني</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
