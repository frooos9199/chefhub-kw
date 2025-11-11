// ============================================
// ChefHub - Invoice Helper Functions
// Generate and manage invoices
// ============================================

import { Order } from '@/types';

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  issueDate: string;
  dueDate: string;
  
  // Customer Info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    governorate: string;
    area: string;
    block?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    additionalInfo?: string;
  };
  
  // Order Items
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    chefName: string;
  }[];
  
  // Pricing
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  
  // Payment
  paymentMethod: 'knet' | 'visa' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  
  // Chef Info
  chefs: {
    name: string;
    businessName: string;
    phone: string;
  }[];
  
  // Platform
  platformCommission: number;
  
  // Notes
  notes?: string;
}

// ============================================
// Generate Invoice Number
// ============================================

export function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
}

// ============================================
// Format Invoice Date
// ============================================

export function formatInvoiceDate(date: Date): string {
  return date.toLocaleDateString('ar-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================
// Calculate Tax (if applicable)
// Kuwait doesn't have VAT yet, but keeping for future
// ============================================

export function calculateTax(subtotal: number, taxRate: number = 0): number {
  return subtotal * taxRate;
}

// ============================================
// Format Currency (KWD)
// ============================================

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(3)} د.ك`;
}

// ============================================
// Generate Invoice HTML for Email
// ============================================

export function generateInvoiceHTML(invoice: InvoiceData): string {
  const itemsHTML = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة ${invoice.invoiceNumber}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 800px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">ChefHub</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">منصة الشيفات في الكويت</p>
        </div>
        
        <!-- Invoice Info -->
        <div style="padding: 40px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap;">
            <div>
              <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 28px;">فاتورة</h2>
              <p style="margin: 5px 0; color: #6b7280;"><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>رقم الطلب:</strong> ${invoice.orderNumber}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>تاريخ الإصدار:</strong> ${invoice.issueDate}</p>
            </div>
            <div style="text-align: left;">
              <h3 style="margin: 0 0 10px; color: #1f2937;">العميل</h3>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.customerName}</p>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.customerPhone}</p>
              <p style="margin: 5px 0; color: #6b7280;">${invoice.customerEmail}</p>
            </div>
          </div>
          
          <!-- Delivery Address -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px; color: #1f2937;">عنوان التوصيل</h3>
            <p style="margin: 5px 0; color: #6b7280;">
              ${invoice.deliveryAddress.governorate} - ${invoice.deliveryAddress.area}
              ${invoice.deliveryAddress.block ? `، قطعة ${invoice.deliveryAddress.block}` : ''}
              ${invoice.deliveryAddress.street ? `، شارع ${invoice.deliveryAddress.street}` : ''}
              ${invoice.deliveryAddress.building ? `، مبنى ${invoice.deliveryAddress.building}` : ''}
              ${invoice.deliveryAddress.floor ? `، طابق ${invoice.deliveryAddress.floor}` : ''}
              ${invoice.deliveryAddress.apartment ? `، شقة ${invoice.deliveryAddress.apartment}` : ''}
            </p>
            ${invoice.deliveryAddress.additionalInfo ? `<p style="margin: 10px 0 0; color: #6b7280; font-style: italic;">${invoice.deliveryAddress.additionalInfo}</p>` : ''}
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: bold; color: #1f2937;">الصنف</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: bold; color: #1f2937;">الكمية</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: bold; color: #1f2937;">السعر</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: bold; color: #1f2937;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">المجموع الفرعي:</span>
              <span style="font-weight: bold; color: #1f2937;">${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">رسوم التوصيل:</span>
              <span style="font-weight: bold; color: #1f2937;">${formatCurrency(invoice.deliveryFee)}</span>
            </div>
            ${invoice.tax > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">الضريبة:</span>
              <span style="font-weight: bold; color: #1f2937;">${formatCurrency(invoice.tax)}</span>
            </div>
            ` : ''}
            ${invoice.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #10b981;">الخصم:</span>
              <span style="font-weight: bold; color: #10b981;">-${formatCurrency(invoice.discount)}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
              <span style="font-size: 20px; font-weight: bold; color: #1f2937;">الإجمالي:</span>
              <span style="font-size: 24px; font-weight: bold; color: #10b981;">${formatCurrency(invoice.total)}</span>
            </div>
          </div>
          
          <!-- Payment Info -->
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-top: 30px; border-right: 4px solid #10b981;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="margin: 0 0 5px; color: #1f2937;">طريقة الدفع</h3>
                <p style="margin: 0; color: #6b7280;">
                  ${invoice.paymentMethod === 'knet' ? 'KNET' : invoice.paymentMethod === 'visa' ? 'Visa/MasterCard' : 'الدفع عند الاستلام'}
                </p>
              </div>
              <div style="text-align: left;">
                <h3 style="margin: 0 0 5px; color: #1f2937;">حالة الدفع</h3>
                <p style="margin: 0; color: ${invoice.paymentStatus === 'paid' ? '#10b981' : invoice.paymentStatus === 'failed' ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
                  ${invoice.paymentStatus === 'paid' ? 'مدفوع ✓' : invoice.paymentStatus === 'failed' ? 'فشل الدفع ✗' : 'قيد الانتظار'}
                </p>
              </div>
            </div>
          </div>
          
          ${invoice.notes ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin: 0 0 10px; color: #1f2937;">ملاحظات</h3>
            <p style="margin: 0; color: #6b7280;">${invoice.notes}</p>
          </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">شكراً لاستخدامك ChefHub!</p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            في حال وجود أي استفسار، يرجى التواصل معنا عبر البريد الإلكتروني أو الواتساب
          </p>
          <div style="margin-top: 15px;">
            <a href="mailto:support@chefhub.kw" style="color: #10b981; text-decoration: none; margin: 0 10px;">support@chefhub.kw</a>
            <span style="color: #d1d5db;">|</span>
            <a href="https://wa.me/96512345678" style="color: #10b981; text-decoration: none; margin: 0 10px;">+965 1234 5678</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// Create Invoice from Order
// ============================================

export function createInvoiceFromOrder(
  order: Partial<Order>,
  customerEmail: string = '',
  customerPhone: string = ''
): InvoiceData {
  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  return {
    invoiceNumber: generateInvoiceNumber(),
    orderNumber: order.orderNumber || `ORD-${Date.now()}`,
    issueDate: formatInvoiceDate(now),
    dueDate: formatInvoiceDate(dueDate),
    
    customerName: order.customerName || 'عميل',
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    deliveryAddress: order.deliveryAddress || {
      governorate: '',
      area: '',
    },
    
    items: order.items?.map(item => ({
      name: item.dishName,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
      chefName: order.chefName || '',
    })) || [],
    
    subtotal: order.subtotal || 0,
    deliveryFee: order.deliveryFee || 0,
    tax: 0, // Kuwait doesn't have VAT yet
    discount: 0,
    total: order.total || 0,
    
    paymentMethod: (order.paymentMethod as any) || 'cod',
    paymentStatus: (order.paymentStatus as any) || 'pending',
    
    chefs: [{
      name: order.chefName || '',
      businessName: order.chefName || '',
      phone: '',
    }],
    
    platformCommission: order.commission || 0,
    
    notes: order.customerNotes,
  };
}

// ============================================
// Save Invoice to Firestore
// ============================================

export async function saveInvoiceToFirestore(
  invoice: InvoiceData,
  orderId: string
): Promise<string> {
  // This will be implemented when connecting to Firebase
  // For now, return a mock ID
  console.log('Saving invoice to Firestore:', invoice, orderId);
  return `invoice_${Date.now()}`;
}
