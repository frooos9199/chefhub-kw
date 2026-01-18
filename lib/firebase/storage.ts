// ============================================
// ChefHub - Firebase Storage Helper Functions
// ============================================

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a single file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload multiple files to Firebase Storage
 */
export async function uploadMultipleFiles(
  files: File[],
  basePath: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}_${index}_${file.name}`;
      const path = `${basePath}/${fileName}`;
      
      return uploadFile(file, path, (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      });
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage by URL
 */
export async function deleteFileByURL(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage by path
 */
export async function deleteFileByPath(path: string): Promise<void> {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Delete multiple files from Firebase Storage
 */
export async function deleteMultipleFiles(urls: string[]): Promise<void> {
  try {
    const deletePromises = urls.map((url) => deleteFileByURL(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
}

/**
 * List all files in a directory
 */
export async function listFiles(path: string): Promise<string[]> {
  try {
    const listRef = ref(storage, path);
    const result = await listAll(listRef);
    
    const urlPromises = result.items.map((itemRef) => getDownloadURL(itemRef));
    const urls = await Promise.all(urlPromises);
    
    return urls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Compress image before upload (client-side)
 */
export async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Image loading failed'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image with compression
 */
export async function uploadImageWithCompression(
  file: File,
  path: string,
  maxWidth: number = 1200,
  quality: number = 0.8,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Compress image first
    const compressedFile = await compressImage(file, maxWidth, quality);
    
    // Upload compressed image
    const url = await uploadFile(compressedFile, path, onProgress);
    
    return url;
  } catch (error) {
    console.error('Error uploading compressed image:', error);
    throw error;
  }
}

/**
 * Storage path generators for different entity types
 */
export const storagePaths = {
  chefProfile: (chefId: string) => `chef/${chefId}/profile`,
  chefDocuments: (chefId: string, docType: string) => `chef/${chefId}/documents/${docType}`,
  dishImages: (chefId: string, dishId: string) => `dishes/${chefId}/${dishId}`,
  userProfile: (userId: string) => `users/${userId}/profile`,
  orderReceipts: (orderId: string) => `orders/${orderId}/receipts`,
};

export default {
  uploadFile,
  uploadMultipleFiles,
  deleteFileByURL,
  deleteFileByPath,
  deleteMultipleFiles,
  listFiles,
  compressImage,
  uploadImageWithCompression,
  storagePaths,
};
