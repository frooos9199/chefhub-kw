'use client';

// ============================================
// ChefHub - Edit Dish Page
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChefHat,
  ArrowLeft,
  Upload,
  X,
  Save,
  Loader2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'رئيسي',
  'مقبلات',
  'حلويات',
  'مشروبات',
  'سلطات',
  'شوربات',
  'معجنات',
  'أخرى',
];

const ALLERGENS = [
  'مكسرات',
  'ألبان',
  'بيض',
  'قمح (جلوتين)',
  'صويا',
  'سمك',
  'قشريات',
  'لا يوجد',
];

// Mock existing dish data
const MOCK_DISH = {
  id: '1',
  nameAr: 'مجبوس دجاج',
  nameEn: 'Chicken Majboos',
  descriptionAr: 'أرز مبهر مع دجاج طري ومكسرات مقرمشة',
  descriptionEn: 'Spiced rice with tender chicken and crispy nuts',
  category: 'رئيسي',
  price: 8.500,
  preparationTime: 45,
  servingSize: '2-3 أشخاص',
  calories: 450,
  allergens: ['مكسرات'],
  ingredients: 'دجاج\nأرز بسمتي\nبهارات مجبوس\nمكسرات مشكلة\nزبيب\nبصل\nطماطم',
  isActive: true,
  isAvailable: true,
  images: [
    '/dishes/majboos.jpg',
    '/dishes/majboos-2.jpg',
    '/dishes/majboos-3.jpg',
  ],
};

export default function EditDishPage() {
  const params = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'رئيسي',
    price: '',
    preparationTime: '',
    servingSize: '',
    calories: '',
    allergens: [] as string[],
    ingredients: '',
    isActive: true,
    isAvailable: true,
  });

  // Load dish data
  useEffect(() => {
    const loadDish = async () => {
      try {
        // TODO: Fetch from Firebase
        await new Promise((resolve) => setTimeout(resolve, 500));

        setFormData({
          nameAr: MOCK_DISH.nameAr,
          nameEn: MOCK_DISH.nameEn,
          descriptionAr: MOCK_DISH.descriptionAr,
          descriptionEn: MOCK_DISH.descriptionEn,
          category: MOCK_DISH.category,
          price: MOCK_DISH.price.toString(),
          preparationTime: MOCK_DISH.preparationTime.toString(),
          servingSize: MOCK_DISH.servingSize,
          calories: MOCK_DISH.calories.toString(),
          allergens: MOCK_DISH.allergens,
          ingredients: MOCK_DISH.ingredients,
          isActive: MOCK_DISH.isActive,
          isAvailable: MOCK_DISH.isAvailable,
        });

        setExistingImages(MOCK_DISH.images);
      } catch (error) {
        console.error('Error loading dish:', error);
        alert('حدث خطأ أثناء تحميل بيانات الصنف');
      } finally {
        setIsLoading(false);
      }
    };

    loadDish();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAllergenToggle = (allergen: string) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    const totalImages = existingImages.length + selectedImages.length + newImages.length;

    if (totalImages > 5) {
      alert('يمكنك رفع 5 صور كحد أقصى');
      return;
    }

    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Upload new images to Firebase Storage
      // TODO: Update dish data in Firestore
      // TODO: Delete removed images from Storage

      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Updated Form Data:', formData);
      console.log('New Images:', selectedImages);
      console.log('Existing Images:', existingImages);

      router.push('/chef/dishes');
    } catch (error) {
      console.error('Error updating dish:', error);
      alert('حدث خطأ أثناء تحديث الصنف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      // TODO: Delete dish from Firestore
      // TODO: Delete images from Storage

      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/chef/dishes');
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('حدث خطأ أثناء حذف الصنف');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/chef/dishes" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  تعديل الصنف
                </h1>
                <span className="text-xs text-gray-500">{formData.nameAr}</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف</span>
              </button>

              <button
                onClick={() => router.push('/chef/dishes')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>إلغاء</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">المعلومات الأساسية</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اسم الصنف (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اسم الصنف (إنجليزي) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الوصف (عربي) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الوصف (إنجليزي) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">التفاصيل والتسعير</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الفئة <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  السعر (د.ك) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.001"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  وقت التحضير (دقيقة) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">حجم الحصة</label>
                <input
                  type="text"
                  name="servingSize"
                  value={formData.servingSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">السعرات الحرارية</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">الصور</h2>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">الصور الحالية</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                          <span className="text-4xl">🍽️</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                          الرئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-bold">إضافة صور جديدة</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />
              </label>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-emerald-200">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                      جديدة
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergens */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">مسببات الحساسية</h2>

            <div className="flex flex-wrap gap-3">
              {ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => handleAllergenToggle(allergen)}
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${
                    formData.allergens.includes(allergen)
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">المكونات</h2>

            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all resize-none"
              placeholder="أدخل المكونات (كل مكون في سطر منفصل)"
            />
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">الحالة</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-gray-900">نشط</div>
                  <div className="text-sm text-gray-600">الصنف ظاهر للعملاء</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-gray-900">متاح للطلب</div>
                  <div className="text-sm text-gray-600">يمكن للعملاء طلب هذا الصنف الآن</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>حفظ التغييرات</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/chef/dishes')}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
