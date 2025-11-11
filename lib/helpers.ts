// ============================================
// ChefHub - Helper Utility Functions
// ============================================

/**
 * Format price in Kuwaiti Dinar
 */
export function formatKWD(amount: number): string {
  return `${amount.toFixed(3)} د.ك`;
}

/**
 * Format date in Arabic
 */
export function formatDateAr(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time in Arabic
 */
export function formatDateTimeAr(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ar-KW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `#${timestamp}${random}`;
}

/**
 * Calculate order commission
 */
export function calculateCommission(
  subtotal: number,
  commissionRate: number = 10
): number {
  return (subtotal * commissionRate) / 100;
}

/**
 * Validate Kuwaiti phone number
 */
export function validateKuwaitPhone(phone: string): boolean {
  const pattern = /^\+965\s?[569]\d{7}$/;
  return pattern.test(phone);
}

/**
 * Format Kuwaiti phone number
 */
export function formatKuwaitPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('965')) {
    const number = digits.slice(3);
    return `+965 ${number.slice(0, 4)} ${number.slice(4)}`;
  }
  
  if (digits.length === 8) {
    return `+965 ${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  
  return phone;
}

/**
 * Get order status color classes
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700 border-gray-300',
    preparing: 'bg-amber-100 text-amber-700 border-amber-300',
    ready: 'bg-purple-100 text-purple-700 border-purple-300',
    delivered: 'bg-green-100 text-green-700 border-green-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[status] || colors.pending;
}

/**
 * Get order status text in Arabic
 */
export function getOrderStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'قيد الانتظار',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };
  return texts[status] || status;
}

/**
 * Calculate time remaining for special orders
 */
export function getTimeRemaining(endDate: Date | string): string {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'انتهى';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} يوم`;
  if (hours > 0) return `${hours} ساعة`;
  return 'أقل من ساعة';
}
