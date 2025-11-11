/**
 * ============================================
 * ChefHub - Image Compression Utility
 * ============================================
 * 
 * دالة مشتركة لضغط وتصغير الصور تلقائياً
 * تستخدم في جميع أنحاء التطبيق لتقليل حجم الصور
 */

export interface CompressionOptions {
  maxWidth?: number;      // العرض الأقصى (افتراضي: 1200)
  maxHeight?: number;     // الطول الأقصى (افتراضي: 1200)
  quality?: number;       // جودة الضغط 0-1 (افتراضي: 0.8)
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'; // نوع الصورة
}

/**
 * ضغط الصورة وتحويلها إلى Base64
 * @param file - ملف الصورة المراد ضغطه
 * @param options - خيارات الضغط
 * @returns Promise<string> - الصورة المضغوطة بصيغة Base64
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    outputFormat = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // حساب الأبعاد الجديدة مع الحفاظ على نسبة العرض إلى الارتفاع
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // رسم الصورة على الـ Canvas
        ctx.drawImage(img, 0, 0, width, height);

        // تحويل إلى base64 مع الضغط
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * ضغط عدة صور في نفس الوقت
 * @param files - مصفوفة من ملفات الصور
 * @param options - خيارات الضغط
 * @returns Promise<string[]> - مصفوفة الصور المضغوطة بصيغة Base64
 */
export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<string[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * التحقق من حجم الصورة المضغوطة
 * @param dataUrl - الصورة بصيغة Base64
 * @returns { sizeInBytes: number, sizeInKB: number, sizeInMB: number }
 */
export const getImageSize = (dataUrl: string) => {
  const sizeInBytes = dataUrl.length;
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;
  
  return {
    sizeInBytes,
    sizeInKB: parseFloat(sizeInKB.toFixed(2)),
    sizeInMB: parseFloat(sizeInMB.toFixed(2))
  };
};

/**
 * التحقق من أن حجم الصورة ضمن الحد المسموح
 * @param dataUrl - الصورة بصيغة Base64
 * @param maxSizeInMB - الحد الأقصى بالميجابايت (افتراضي: 1)
 * @returns boolean
 */
export const isImageSizeValid = (
  dataUrl: string,
  maxSizeInMB: number = 1
): boolean => {
  const { sizeInMB } = getImageSize(dataUrl);
  return sizeInMB <= maxSizeInMB;
};

/**
 * ضغط الصورة حتى تصبح ضمن الحد المسموح
 * @param file - ملف الصورة
 * @param maxSizeInMB - الحد الأقصى بالميجابايت
 * @param attempts - عدد المحاولات (افتراضي: 3)
 * @returns Promise<string | null> - الصورة المضغوطة أو null إذا فشل
 */
export const compressUntilValid = async (
  file: File,
  maxSizeInMB: number = 1,
  attempts: number = 3
): Promise<string | null> => {
  let quality = 0.8;
  let maxWidth = 1200;
  
  for (let i = 0; i < attempts; i++) {
    const compressed = await compressImage(file, {
      maxWidth,
      quality,
      outputFormat: 'image/jpeg'
    });
    
    if (isImageSizeValid(compressed, maxSizeInMB)) {
      return compressed;
    }
    
    // تقليل الجودة والحجم في كل محاولة
    quality -= 0.15;
    maxWidth -= 200;
    
    if (quality < 0.3 || maxWidth < 400) {
      break;
    }
  }
  
  return null; // فشل الضغط
};
