import Link from 'next/link';

export default function RegisterIndexPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">تسجيل جديد</h1>
        <div className="flex flex-col gap-6">
          <Link href="/auth/register/customer" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-all">تسجيل كعميل</Link>
          <Link href="/auth/register/chef" className="block w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-all">تسجيل كشيف</Link>
        </div>
        <div className="mt-8">
          <Link href="/auth/login" className="text-emerald-600 hover:underline">لديك حساب؟ تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
