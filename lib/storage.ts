// ============================================
// ChefHub - Firebase Storage Helper
// ============================================

import { storage } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadString,
  UploadMetadata,
} from 'firebase/storage';

/**
 * رفع صورة إلى Firebase Storage
 */
export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log(`📤 Starting upload for: ${file.name}`);
    console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`   Path: ${path}`);
    
    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Set metadata
    const metadata: UploadMetadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    };
    
    console.log(`   Uploading to Firebase Storage...`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    console.log(`   ✅ Upload complete!`);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`   📎 Download URL: ${downloadURL.substring(0, 80)}...`);
    
    return downloadURL;
  } catch (error: any) {
    console.error(`❌ Error uploading ${file.name}:`, error);
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

/**
 * رفع عدة صور
 */
export async function uploadMultipleImages(
  files: File[],
  basePath: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  console.log(`📦 Uploading ${files.length} images to ${basePath}`);
  
  const urls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = `${Date.now()}_${i}_${file.name}`;
    const path = `${basePath}/${fileName}`;
    
    console.log(`\n[${i + 1}/${files.length}] Uploading ${file.name}...`);
    
    try {
      const url = await uploadImage(file, path);
      urls.push(url);
      console.log(`   ✅ Success! URL added to array`);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`   ❌ Failed to upload ${file.name}`);
      throw error; // إيقاف العملية عند أول خطأ
    }
  }
  
  console.log(`\n✅ All ${urls.length} images uploaded successfully!`);
  return urls;
}

/**
 * رفع صورة من Base64
 */
export async function uploadBase64Image(
  base64String: string,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    
    // Upload base64 string
    const snapshot = await uploadString(storageRef, base64String, 'data_url');
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw error;
  }
}

/**
 * حذف صورة من Firebase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract path from URL
    const path = extractPathFromUrl(imageUrl);
    
    if (!path) {
      throw new Error('Invalid image URL');
    }
    
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * حذف عدة صور
 */
export async function deleteMultipleImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map(url => deleteImage(url));
  await Promise.all(deletePromises);
}

/**
 * استخراج المسار من URL
 */
function extractPathFromUrl(url: string): string | null {
  try {
    // Firebase Storage URL format:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
    
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}

/**
 * ضغط الصورة قبل الرفع
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create blob'));
              return;
            }
            
            // Create new file
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Could not load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * التحقق من نوع الملف
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * التحقق من حجم الملف
 */
export function isValidImageSize(file: File, maxSizeMB = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * توليد اسم ملف فريد
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
}

/**
 * الحصول على مسار تخزين حسب النوع
 */
export function getStoragePath(
  type: 'profile' | 'chef' | 'dish' | 'special_order' | 'license' | 'invoice',
  userId: string,
  fileName: string
): string {
  const paths: Record<string, string> = {
    profile: `profiles/${userId}/${fileName}`,
    chef: `chefs/${userId}/${fileName}`,
    dish: `dishes/${userId}/${fileName}`,
    special_order: `special_orders/${userId}/${fileName}`,
    license: `licenses/${userId}/${fileName}`,
    invoice: `invoices/${userId}/${fileName}`,
  };
  
  return paths[type] || `uploads/${userId}/${fileName}`;
}
