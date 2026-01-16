// ============================================
// ChefHub - Server-side Upload API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage, getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get Admin instances
    const adminStorage = getAdminStorage();
    const adminAuth = getAdminAuth();

    if (!adminStorage || !adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured' },
        { status: 500 }
      );
    }

    // 1. التحقق من Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    console.log('✅ User authenticated:', userId);

    // 2. قراءة الملفات من FormData
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`📦 Uploading ${files.length} files to ${folder}`);

    // 3. رفع الملفات إلى Firebase Storage
    const uploadPromises = files.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const fileName = `${timestamp}_${index}_${file.name}`;
      const filePath = `${folder}/${fileName}`;

      console.log(`📤 [${index + 1}/${files.length}] Uploading: ${file.name}`);

      // رفع الملف
      const fileRef = adminStorage.bucket().file(filePath);
      await fileRef.save(buffer, {
        contentType: file.type,
        metadata: {
          firebaseStorageDownloadTokens: crypto.randomUUID(),
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      // جعل الملف عام للقراءة
      await fileRef.makePublic();

      // الحصول على رابط التحميل
      const publicUrl = `https://storage.googleapis.com/${adminStorage.bucket().name}/${filePath}`;

      console.log(`✅ [${index + 1}/${files.length}] Uploaded: ${fileName}`);

      return publicUrl;
    });

    const urls = await Promise.all(uploadPromises);

    console.log(`🎉 Successfully uploaded ${urls.length} files`);

    return NextResponse.json({
      success: true,
      urls,
      count: urls.length,
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
