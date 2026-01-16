// ============================================
// ChefHub - Client-side Storage Helper
// Uses Server-side API for uploads
// ============================================

import { auth } from './firebase';

/**
 * رفع صورة واحدة باستخدام API
 */
export async function uploadImageViaAPI(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log(`📤 Starting API upload for: ${file.name}`);
    console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`   Folder: ${folder}`);

    // الحصول على token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    // إنشاء FormData
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folder', folder);

    console.log(`   Sending to API...`);

    // رفع الصورة
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Upload failed');
    }

    const data = await response.json();
    const url = data.urls[0];

    console.log(`   ✅ Upload complete!`);
    console.log(`   📎 Download URL: ${url.substring(0, 80)}...`);

    if (onProgress) {
      onProgress(100);
    }

    return url;

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * رفع عدة صور باستخدام API
 */
export async function uploadMultipleImagesViaAPI(
  files: File[],
  folder: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  try {
    console.log(`📦 Starting API upload for ${files.length} images to ${folder}`);

    // الحصول على token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    // إنشاء FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    console.log(`   Sending ${files.length} files to API...`);

    // رفع الصور
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Upload failed');
    }

    const data = await response.json();

    console.log(`✅ Successfully uploaded ${data.count} images`);
    console.log('Image URLs:', data.urls);

    return data.urls;

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
}
