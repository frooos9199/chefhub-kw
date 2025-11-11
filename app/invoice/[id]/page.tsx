'use client';

// ============================================
// ChefHub - Invoice Page
// View and download invoice
// ============================================

import { useParams } from 'next/navigation';
import { FileText, Download, Printer, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { InvoiceData } from '@/lib/invoice';

// Mock invoice data
const MOCK_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-1731369600000-123',
  orderNumber: '#ORD-456789',
  issueDate: '١٢ نوفمبر ٢٠٢٥',
  dueDate: '١٩ نوفمبر ٢٠٢٥',
  
  customerName: 'أحمد محمد الكندري',
  customerEmail: 'ahmed@example.com',
  customerPhone: '+96598765432',
  deliveryAddress: {
    governorate: 'حولي',
    area: 'السالمية',
    block: '10',
    street: '5',
    building: '25',
    floor: '3',
    apartment: '7',
  },
  
  items: [
    {
      name: 'كنافة نابلسية فاخرة',
      quantity: 2,
      unitPrice: 8.500,
      total: 17.000,
      chefName: 'مطبخ فاطمة للحلويات',
    },
    {
      name: 'مجبوس دجاج',
      quantity: 1,
      unitPrice: 12.000,
      total: 12.000,
      chefName: 'مطبخ محمد للمأكولات الكويتية',
    },
  ],
  
  subtotal: 29.000,
  deliveryFee: 2.000,
  tax: 0,
  discount: 0,
  total: 31.000,
  
  paymentMethod: 'knet',
  paymentStatus: 'paid',
  
  chefs: [
    {
      name: 'فاطمة أحمد',
      businessName: 'مطبخ فاطمة للحلويات',
      phone: '+96512345678',
    },
  ],
  
  platformCommission: 3.100,
};

export default function InvoicePage() {
  const params = useParams();
  const invoice = MOCK_INVOICE;

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Downloading PDF...');
    alert('سيتم تنزيل الفاتورة قريباً');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending
    console.log('Sending email...');
    alert('سيتم إرسال الفاتورة بالإيميل قريباً');
  };

  const formatCurrency = (amount: number) => amount.toFixed(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header - Hide on print */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ChefHub
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">إرسال بالإيميل</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">طباعة</span>
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تحميل PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Invoice Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-12 text-center text-white print:bg-emerald-600">
            <h1 className="text-5xl font-black mb-2">ChefHub</h1>
            <p className="text-xl opacity-90">منصة الشيفات في الكويت</p>
          </div>

          {/* Invoice Details */}
          <div className="p-8 md:p-12">
            {/* Title & Status */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <h2 className="text-3xl font-black text-gray-900">فاتورة</h2>
                </div>
                <p className="text-gray-600">رقم الفاتورة: <span className="font-bold text-gray-900">{invoice.invoiceNumber}</span></p>
                <p className="text-gray-600">رقم الطلب: <span className="font-bold text-gray-900">{invoice.orderNumber}</span></p>
                <p className="text-gray-600">تاريخ الإصدار: <span className="font-bold">{invoice.issueDate}</span></p>
              </div>

              {invoice.paymentStatus === 'paid' && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-full border-2 border-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-black">مدفوع</span>
                </div>
              )}
            </div>

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">معلومات العميل</h3>
                <p className="text-gray-700 mb-1"><strong>{invoice.customerName}</strong></p>
                <p className="text-gray-600 text-sm">{invoice.customerPhone}</p>
                <p className="text-gray-600 text-sm">{invoice.customerEmail}</p>
              </div>

              {/* Delivery Address */}
              <div className="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">عنوان التوصيل</h3>
                <p className="text-gray-700 leading-relaxed">
                  {invoice.deliveryAddress.governorate} - {invoice.deliveryAddress.area}
                  {invoice.deliveryAddress.block && `, قطعة ${invoice.deliveryAddress.block}`}
                  {invoice.deliveryAddress.street && `, شارع ${invoice.deliveryAddress.street}`}
                  <br />
                  {invoice.deliveryAddress.building && `مبنى ${invoice.deliveryAddress.building}`}
                  {invoice.deliveryAddress.floor && `, طابق ${invoice.deliveryAddress.floor}`}
                  {invoice.deliveryAddress.apartment && `, شقة ${invoice.deliveryAddress.apartment}`}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-right py-4 px-4 border-b-2 border-gray-200 font-black text-gray-900">الصنف</th>
                    <th className="text-center py-4 px-4 border-b-2 border-gray-200 font-black text-gray-900">الكمية</th>
                    <th className="text-right py-4 px-4 border-b-2 border-gray-200 font-black text-gray-900">السعر</th>
                    <th className="text-right py-4 px-4 border-b-2 border-gray-200 font-black text-gray-900">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.chefName}</div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-gray-700">{item.quantity}</td>
                      <td className="py-4 px-4 text-gray-700">{formatCurrency(item.unitPrice)} د.ك</td>
                      <td className="py-4 px-4 font-bold text-gray-900">{formatCurrency(item.total)} د.ك</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold">{formatCurrency(invoice.subtotal)} د.ك</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>رسوم التوصيل:</span>
                  <span className="font-bold">{formatCurrency(invoice.deliveryFee)} د.ك</span>
                </div>

                {invoice.tax > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>الضريبة:</span>
                    <span className="font-bold">{formatCurrency(invoice.tax)} د.ك</span>
                  </div>
                )}

                {invoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم:</span>
                    <span className="font-bold">-{formatCurrency(invoice.discount)} د.ك</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t-2 border-gray-200">
                  <span className="text-xl font-black text-gray-900">الإجمالي:</span>
                  <span className="text-3xl font-black text-emerald-600">{formatCurrency(invoice.total)} د.ك</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-8 p-6 bg-emerald-50 rounded-xl border-2 border-emerald-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">طريقة الدفع</h3>
                  <p className="text-gray-700">
                    {invoice.paymentMethod === 'knet' && 'KNET'}
                    {invoice.paymentMethod === 'visa' && 'Visa/MasterCard'}
                    {invoice.paymentMethod === 'cod' && 'الدفع عند الاستلام'}
                  </p>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 mb-1">حالة الدفع</h3>
                  <p className={`font-bold ${
                    invoice.paymentStatus === 'paid' ? 'text-green-600' :
                    invoice.paymentStatus === 'failed' ? 'text-red-600' :
                    'text-amber-600'
                  }`}>
                    {invoice.paymentStatus === 'paid' && 'مدفوع ✓'}
                    {invoice.paymentStatus === 'failed' && 'فشل الدفع ✗'}
                    {invoice.paymentStatus === 'pending' && 'قيد الانتظار'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-8 border-t border-gray-200 text-center print:bg-white">
            <p className="text-gray-600 mb-3">شكراً لاستخدامك ChefHub!</p>
            <p className="text-sm text-gray-500 mb-4">
              في حال وجود أي استفسار، يرجى التواصل معنا
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a href="mailto:support@chefhub.kw" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                support@chefhub.kw
              </a>
              <span className="text-gray-300">|</span>
              <a href="https://wa.me/96512345678" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                +965 1234 5678
              </a>
            </div>
          </div>
        </div>

        {/* Back Button - Hide on print */}
        <div className="mt-8 text-center print:hidden">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            رجوع للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
