'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { compressImage, getImageSize, isImageSizeValid } from '@/lib/image-compression';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  LogOut,
  Shield,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export default function BannersManagement() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user || userData?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const bannersRef = collection(db, 'banners');
      const q = query(bannersRef, orderBy('order', 'asc'));
      
      const snapshot = await getDocs(q);
      const bannersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];

      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('الرجاء اختيار صورة');
      return;
    }

    setUploading(true);
    console.log('Starting upload...');
    
    try {
      // ضغط الصورة تلقائياً باستخدام الدالة المشتركة
      // ⚠️ الحجم المثالي للبانر: 1920x600 بكسل (نسبة 16:5) - لعرض كامل على جميع الشاشات
      console.log('Compressing image...');
      const compressedImageUrl = await compressImage(selectedImage, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.75,
        outputFormat: 'image/jpeg'
      });
      
      // التحقق من حجم الصورة المضغوطة
      const size = getImageSize(compressedImageUrl);
      console.log(`Compressed image size: ${size.sizeInKB} KB`);
      
      if (!isImageSizeValid(compressedImageUrl, 1)) {
        alert('الصورة كبيرة جداً. الرجاء اختيار صورة أصغر أو بجودة أقل.');
        setUploading(false);
        return;
      }

      // حفظ في Firestore
      console.log('Adding to Firestore...');
      const bannersRef = collection(db, 'banners');
      const docRef = await addDoc(bannersRef, {
        imageUrl: compressedImageUrl, // الصورة المضغوطة
        title: title || '',
        link: link || '',
        isActive: true,
        order: banners.length,
        createdAt: serverTimestamp()
      });
      console.log('Added to Firestore with ID:', docRef.id);

      // Reset form
      setSelectedImage(null);
      setPreviewUrl('');
      setTitle('');
      setLink('');
      setShowAddForm(false);
      
      // Refresh banners
      console.log('Refreshing banners...');
      await fetchBanners();
      
      alert('تم إضافة البنر بنجاح! ✅');
    } catch (error: any) {
      console.error('Error adding banner:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      alert(`حدث خطأ: ${error.message || 'خطأ غير معروف'}\n\nتأكد من تفعيل Firebase Storage في Console`);
    } finally {
      setUploading(false);
      console.log('Upload process finished');
    }
  };

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const bannerRef = doc(db, 'banners', bannerId);
      await updateDoc(bannerRef, {
        isActive: !currentStatus
      });
      await fetchBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البنر؟')) return;

    try {
      await deleteDoc(doc(db, 'banners', bannerId));
      await fetchBanners();
      alert('تم حذف البنر بنجاح');
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('حدث خطأ أثناء حذف البنر');
    }
  };

  const updateBannerOrder = async (bannerId: string, newOrder: number) => {
    try {
      const bannerRef = doc(db, 'banners', bannerId);
      await updateDoc(bannerRef, {
        order: newOrder
      });
      await fetchBanners();
    } catch (error) {
      console.error('Error updating banner order:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || loadingBanners) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم الأدمن</h1>
                <p className="text-sm text-gray-500">إدارة الإعلانات</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                الرجوع للوحة التحكم
              </Link>
              <Link
                href="/admin/settings"
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">إدارة الإعلانات</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {showAddForm ? 'إلغاء' : 'إضافة بنر جديد'}
          </button>
        </div>

        {/* Add Banner Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">إضافة بنر إعلاني جديد</h2>
            <form onSubmit={handleAddBanner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة البنر *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  required
                />
                {previewUrl && (
                  <div className="mt-4">
                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان البنر (اختياري)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="مثال: عرض خاص على جميع الأطباق"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط البنر (اختياري)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="/browse أو رابط خارجي"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading || !selectedImage}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {uploading ? 'جاري الرفع...' : 'إضافة البنر'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {banners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد إعلانات حالياً</p>
              <p className="text-gray-500 text-sm mt-2">قم بإضافة أول بنر إعلاني</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {banners.map((banner, index) => (
                <div key={banner.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || 'بنر'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {banner.title || 'بنر إعلاني'}
                      </h3>
                      {banner.link && (
                        <p className="text-sm text-gray-500 mt-1">🔗 {banner.link}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          banner.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {banner.isActive ? '✅ نشط' : '⏸️ متوقف'}
                        </span>
                        <span className="text-xs text-gray-500">الترتيب: {banner.order + 1}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Order buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => updateBannerOrder(banner.id, Math.max(0, banner.order - 1))}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateBannerOrder(banner.id, banner.order + 1)}
                          disabled={index === banners.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Toggle Status */}
                      <button
                        onClick={() => toggleBannerStatus(banner.id, banner.isActive)}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title={banner.isActive ? 'إيقاف' : 'تفعيل'}
                      >
                        {banner.isActive ? (
                          <Eye className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
