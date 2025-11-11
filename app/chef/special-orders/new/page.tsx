'use client';

// ============================================
// ChefHub - Create New Special Order
// ============================================

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  ArrowRight,
  Save,
  Calendar,
  DollarSign,
  Users,
  Type,
  AlignLeft,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { compressImage } from '@/lib/image-compression';

export default function NewSpecialOrderPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    originalPrice: '',
    maxOrders: '',
    startDate: '',
    endDate: '',
    image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار صورة صالحة');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setUploadingImage(true);

      // Compress image
      const compressedBase64 = await compressImage(file);

      // Set preview
      setImagePreview(compressedBase64);

      // Convert base64 to blob for upload
      const response = await fetch(compressedBase64);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const storageRef = ref(storage, `special-orders/${user?.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'العنوان بالعربي مطلوب';
    if (!formData.titleEn.trim()) newErrors.titleEn = 'العنوان بالإنجليزي مطلوب';
    if (!formData.description.trim()) newErrors.description = 'الوصف بالعربي مطلوب';
    if (!formData.price) newErrors.price = 'السعر مطلوب';
    if (!formData.maxOrders) newErrors.maxOrders = 'العدد الأقصى مطلوب';
    if (!formData.startDate) newErrors.startDate = 'تاريخ البداية مطلوب';
    if (!formData.endDate) newErrors.endDate = 'تاريخ النهاية مطلوب';

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
      }
    }

    // Validate price
    if (formData.price && parseFloat(formData.price) <= 0) {
      newErrors.price = 'السعر يجب أن يكون أكبر من صفر';
    }

    // Validate max orders
    if (formData.maxOrders && parseInt(formData.maxOrders) <= 0) {
      newErrors.maxOrders = 'العدد يجب أن يكون أكبر من صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsSaving(true);

    try {
      const specialOrderData = {
        chefId: user.uid,
        chefName: userData?.name || '',
        title: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn || '',
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        maxOrders: parseInt(formData.maxOrders),
        currentOrders: 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        image: formData.image || '',
        status: 'active',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'specialOrders'), specialOrderData);

      alert('تم إنشاء الطلب الخاص بنجاح! ✅');
      router.push('/chef/special-orders');
    } catch (error) {
      console.error('Error creating special order:', error);
      alert('حدث خطأ أثناء إنشاء الطلب الخاص');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/chef/special-orders"
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    طلب خاص جديد
                  </h1>
                  <span className="text-xs text-gray-600">عرض موسمي مميز</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              <ImageIcon className="w-5 h-5 inline-block ml-2" />
              صورة العرض
            </h3>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-500 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-bold mb-1">
                  {uploadingImage ? 'جاري رفع الصورة...' : 'اضغط لرفع صورة العرض'}
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG أو WEBP (أقصى حجم 5MB)
                </p>
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              <Type className="w-5 h-5 inline-block ml-2" />
              المعلومات الأساسية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title Arabic */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  العنوان (عربي) *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="مثال: غبقة رمضان 2025"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Title English */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  العنوان (English) *
                </label>
                <input
                  type="text"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramadan Ghabqa 2025"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.titleEn ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.titleEn && <p className="text-red-500 text-sm mt-1">{errors.titleEn}</p>}
              </div>
            </div>

            {/* Description Arabic */}
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الوصف (عربي) *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="اكتب وصف تفصيلي للعرض..."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Description English */}
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الوصف (English)
              </label>
              <textarea
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleInputChange}
                rows={4}
                placeholder="Write detailed description..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              <DollarSign className="w-5 h-5 inline-block ml-2" />
              السعر والتوفر
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  السعر (د.ك) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="15.000"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  السعر الأصلي (د.ك)
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="18.000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">للعرض فقط (اختياري)</p>
              </div>

              {/* Max Orders */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline-block ml-1" />
                  العدد الأقصى *
                </label>
                <input
                  type="number"
                  name="maxOrders"
                  value={formData.maxOrders}
                  onChange={handleInputChange}
                  placeholder="50"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.maxOrders ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.maxOrders && <p className="text-red-500 text-sm mt-1">{errors.maxOrders}</p>}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              <Calendar className="w-5 h-5 inline-block ml-2" />
              مدة العرض
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تاريخ البداية *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تاريخ النهاية *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving || uploadingImage}
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  نشر الطلب الخاص
                </>
              )}
            </button>

            <Link
              href="/chef/special-orders"
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
