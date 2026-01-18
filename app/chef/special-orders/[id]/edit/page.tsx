'use client';

// ============================================
// ChefHub - Edit Special Order (Chef)
// ============================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChefHat,
  Save,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import { doc, getDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImageViaAPI } from '@/lib/storage-client';
import { compressImage } from '@/lib/image-compression';

function toNumberString(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') return value;
  return '';
}

export default function EditSpecialOrderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const specialOrderId = params?.id;
  const { user, userData } = useAuth();

  const [loading, setLoading] = useState(true);
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

  const canEdit = useMemo(() => Boolean(user && userData && userData.role === 'chef'), [user, userData]);

  useEffect(() => {
    const load = async () => {
      if (!specialOrderId) return;
      try {
        setLoading(true);
        const ref = doc(db, 'special_orders', specialOrderId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setErrors({ general: 'الطلب غير موجود' });
          return;
        }

        const data = snap.data() as Record<string, unknown>;

        const startDate = (data.startDate as any)?.toDate?.() ?? (data.startDate ? new Date(data.startDate as any) : null);
        const endDate = (data.endDate as any)?.toDate?.() ?? (data.endDate ? new Date(data.endDate as any) : null);

        const toInputDate = (d: Date | null) => {
          if (!d || Number.isNaN(d.getTime())) return '';
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };

        const image = typeof data.image === 'string' ? data.image : '';
        setImagePreview(image);

        setFormData({
          title: typeof data.title === 'string' ? data.title : '',
          titleEn: typeof data.titleEn === 'string' ? data.titleEn : '',
          description: typeof data.description === 'string' ? data.description : '',
          descriptionEn: typeof data.descriptionEn === 'string' ? data.descriptionEn : '',
          price: toNumberString(data.price),
          originalPrice: toNumberString(data.originalPrice),
          maxOrders: toNumberString(data.maxOrders),
          startDate: toInputDate(startDate),
          endDate: toInputDate(endDate),
          image,
        });
      } catch (e) {
        console.error('Error loading special order:', e);
        setErrors({ general: 'حدث خطأ أثناء تحميل الطلب' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [specialOrderId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار صورة صالحة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setUploadingImage(true);
      const compressedBase64 = await compressImage(file);
      setImagePreview(compressedBase64);

      const response = await fetch(compressedBase64);
      const blob = await response.blob();
      const compressedFile = new File([blob], file.name, { type: file.type });

      const imageUrl = await uploadImageViaAPI(compressedFile, `special-orders/${user?.uid}`);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('حدث خطأ أثناء رفع الصورة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setUploadingImage(false);
    }
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

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
    }

    if (formData.price && Number(formData.price) <= 0) newErrors.price = 'السعر يجب أن يكون أكبر من صفر';
    if (formData.maxOrders && Number(formData.maxOrders) <= 0) newErrors.maxOrders = 'العدد يجب أن يكون أكبر من صفر';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      alert('يجب تسجيل الدخول كـ شيف');
      return;
    }
    if (!specialOrderId) {
      alert('معرّف الطلب غير صحيح');
      return;
    }
    if (!validateForm()) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSaving(true);
    try {
      const ref = doc(db, 'special_orders', specialOrderId);
      const payload = {
        title: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn || '',
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
        maxOrders: Number(formData.maxOrders),
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        image: formData.image || '',
        updatedAt: serverTimestamp(),
      };

      await updateDoc(ref, payload);
      alert('تم تحديث الطلب الخاص بنجاح ✅');
      router.push('/chef/special-orders');
    } catch (err: any) {
      console.error('Error updating special order:', err);
      alert(`حدث خطأ أثناء تحديث الطلب: ${err?.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الطلب...</p>
        </div>
      </div>
    );
  }

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
                    تعديل الطلب الخاص
                  </h1>
                  <span className="text-xs text-gray-600">تحديث عرض موسمي</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              <ImageIcon className="w-5 h-5 inline-block ml-2" />
              صورة العرض
            </h3>

            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  title="إزالة الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-bold">اضغط لرفع صورة</p>
                <p className="text-sm text-gray-500">PNG, JPG حتى 5MB</p>
              </label>
            )}

            {imagePreview && (
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage ? 'جاري الرفع...' : 'تغيير الصورة'}</span>
                </label>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان (عربي)</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.title ? 'border-red-300' : 'border-gray-200'} focus:border-amber-400 outline-none`}
                />
                {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان (English)</label>
                <input
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.titleEn ? 'border-red-300' : 'border-gray-200'} focus:border-amber-400 outline-none`}
                />
                {errors.titleEn && <p className="text-red-600 text-xs mt-1">{errors.titleEn}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الوصف (عربي)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.description ? 'border-red-300' : 'border-gray-200'} focus:border-amber-400 outline-none`}
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الوصف (English) (اختياري)</label>
              <textarea
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">السعر (د.ك)</label>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  inputMode="decimal"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.price ? 'border-red-300' : 'border-gray-200'} focus:border-amber-400 outline-none`}
                />
                {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">السعر قبل الخصم (اختياري)</label>
                <input
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  inputMode="decimal"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الحد الأقصى للطلبات</label>
                <input
                  name="maxOrders"
                  value={formData.maxOrders}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.maxOrders ? 'border-red-300' : 'border-gray-200'} focus:border-amber-400 outline-none`}
                />
                {errors.maxOrders && <p className="text-red-600 text-xs mt-1">{errors.maxOrders}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البداية</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.startDate ? 'border-red-300' : 'border-gray-200'} focus:border-amber-400 outline-none`}
                />
                {errors.startDate && <p className="text-red-600 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ النهاية</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.endDate ? 'border-red-300' : 'border-gray-200'} focus:border-amber-400 outline-none`}
                />
                {errors.endDate && <p className="text-red-600 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
