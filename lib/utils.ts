// ============================================
// ChefHub - Utility Functions
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * دمج classNames مع Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق السعر بالدينار الكويتي
 */
export function formatPrice(amount: number, locale: 'ar' | 'en' = 'ar'): string {
  if (locale === 'ar') {
    return `${amount.toFixed(3)} د.ك`;
  }
  return `KWD ${amount.toFixed(3)}`;
}

/**
 * تنسيق رقم الطلب
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CH-${timestamp}-${random}`;
}

/**
 * تنسيق رقم الفاتورة
 */
export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
}

/**
 * تنسيق التاريخ
 */
export function formatDate(date: Date, locale: 'ar' | 'en' = 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * تنسيق الوقت
 */
export function formatTime(date: Date, locale: 'ar' | 'en' = 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * تنسيق التاريخ والوقت
 */
export function formatDateTime(date: Date, locale: 'ar' | 'en' = 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * التحقق من صحة رقم الجوال الكويتي
 */
export function isValidKuwaitPhone(phone: string): boolean {
  // الأرقام الكويتية تبدأ بـ +965 أو 965 ومتبوعة بـ 8 أرقام
  const regex = /^(\+965|965)?[2456]\d{7}$/;
  return regex.test(phone.replace(/\s/g, ''));
}

/**
 * تنسيق رقم الجوال الكويتي
 */
export function formatKuwaitPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/^\+965/, '').replace(/^965/, '');
  if (cleaned.length === 8) {
    return `+965 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return phone;
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * حساب النسبة المئوية
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * حساب العمولة
 */
export function calculateCommission(amount: number, commissionRate: number): number {
  return Math.round((amount * commissionRate) / 100 * 1000) / 1000;
}

/**
 * حساب أرباح الشيف
 */
export function calculateChefEarnings(total: number, commissionRate: number): number {
  const commission = calculateCommission(total, commissionRate);
  return Math.round((total - commission) * 1000) / 1000;
}

/**
 * تحويل Timestamp من Firebase إلى Date
 */
export function timestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

/**
 * الحصول على اسم المحافظة
 */
export function getGovernorateN(id: string, locale: 'ar' | 'en' = 'ar'): string {
  const governorates: Record<string, { ar: string; en: string }> = {
    capital: { ar: 'العاصمة', en: 'Al Asimah' },
    hawalli: { ar: 'حولي', en: 'Hawalli' },
    farwaniya: { ar: 'الفروانية', en: 'Al Farwaniya' },
    ahmadi: { ar: 'الأحمدي', en: 'Al Ahmadi' },
    jahra: { ar: 'الجهراء', en: 'Al Jahra' },
    mubarak: { ar: 'مبارك الكبير', en: 'Mubarak Al-Kabeer' },
  };
  
  return governorates[id]?.[locale] || id;
}

/**
 * اختصار النص
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * تحويل الثواني إلى وقت قابل للقراءة
 */
export function secondsToTime(seconds: number, locale: 'ar' | 'en' = 'ar'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (locale === 'ar') {
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * رفع الصورة إلى Firebase Storage
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  // سيتم تطبيقها لاحقاً مع Firebase Storage
  return '';
}

/**
 * حذف الصورة من Firebase Storage
 */
export async function deleteImage(url: string): Promise<void> {
  // سيتم تطبيقها لاحقاً مع Firebase Storage
}
