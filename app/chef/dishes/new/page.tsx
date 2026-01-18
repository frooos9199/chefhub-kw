'use client';

// ============================================
// ChefHub - Add New Dish Page
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadMultipleImagesViaAPI } from '@/lib/storage-client';
import {
  ChefHat,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Image as ImageIcon,
  Loader2,
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

export default function AddDishPage() {
  const router = useRouter();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    showAllergens: true,
    showIngredients: true,
  });

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
    const totalImages = selectedImages.length + newImages.length;

    if (totalImages > 5) {
      alert('يمكنك رفع 5 صور كحد أقصى');
      return;
    }

    // Create previews
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('\n🚀 ========== بدء عملية إضافة طبق جديد ==========');
    console.log('⏰ Time:', new Date().toISOString());
    console.log('📝 Form submitted');
    
    // تحقق من حالة isSubmitting
    if (isSubmitting) {
      console.warn('⚠️  Already submitting! Ignoring duplicate submission.');
      return;
    }
    
    if (!userData?.uid) {
      console.error('❌ userData.uid is missing!');
      console.log('userData:', userData);
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    if (selectedImages.length === 0) {
      console.error('❌ No images selected!');
      alert('يرجى إضافة صورة واحدة على الأقل');
      return;
    }

    console.log('✅ Validation passed');
    console.log('   User ID:', userData.uid);
    console.log('   Chef ID:', userData.chefId);
    console.log('   Images count:', selectedImages.length);
    console.log('   Form data:', formData);

    const chefId = userData.chefId || userData.uid;
    
    console.log('🔒 Setting isSubmitting = true');
    setIsSubmitting(true);

    try {
      // 1. رفع الصور باستخدام API (server-side)
      // ⚠️ الحجم المثالي لصور الأطباق: 800x800 بكسل (مربعة) - لعرض واضح في البطاقات والتفاصيل
      console.log('📤 Step 1: Starting image upload via API...');
      console.log('Number of images:', selectedImages.length);
      console.log('User ID:', userData.uid);
      
      console.log('🔄 Calling uploadMultipleImagesViaAPI...');
      const imageUrls = await uploadMultipleImagesViaAPI(
        selectedImages,
        `dishes/${userData.uid}`
      );
      
      console.log(`✅ Successfully uploaded ${imageUrls.length} images`);
      console.log('Image URLs:', imageUrls);

      // 2. حفظ بيانات الصنف في Firestore مع روابط الصور
      console.log('📝 Step 2: Saving dish data to Firestore...');
      const dishData = {
        chefId, // chef doc id is the auth uid (fallback if chefId isn't stored on user)
        chefName: userData.name || 'شيف',
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime),
        servingSize: formData.servingSize ? parseInt(formData.servingSize) : 1,
        calories: formData.calories ? parseInt(formData.calories) : 0,
        allergens: formData.allergens,
        ingredients: formData.ingredients.trim(),
        showAllergens: formData.showAllergens,
        showIngredients: formData.showIngredients,
        images: imageUrls, // روابط الصور من Firebase Storage
        isActive: formData.isActive,
        isAvailable: formData.isAvailable,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('Dish data to be saved:', dishData);
      const docRef = await addDoc(collection(db, 'dishes'), dishData);
      console.log('✅ Dish saved with ID:', docRef.id);
      console.log('\n🎉 ========== نجحت العملية بالكامل! ==========\n');

      alert('✅ تم إضافة الصنف بنجاح!');
      
      console.log('🔄 Redirecting to /chef/dishes...');
      router.push('/chef/dishes');
      
    } catch (error: any) {
      console.error('\n❌ ========== فشلت العملية! ==========');
      console.error('❌ Error creating dish:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      console.error('========================================\n');
      
      let errorMessage = 'حدث خطأ أثناء إضافة الصنف.';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = '🔒 خطأ في الصلاحيات.\n\nتأكد من:\n1. تفعيل Firebase Storage\n2. نشر Storage Rules\n\nافتح Console للمزيد من التفاصيل.';
      } else if (error.code === 'permission-denied') {
        errorMessage = '🔒 خطأ في صلاحيات Firestore.\n\nتأكد من:\n1. نشر Firestore Rules\n2. أنك مسجل دخول كشيف\n\nافتح Console للمزيد من التفاصيل.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'تم إلغاء رفع الصور.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'خطأ غير معروف في رفع الصور.\n\nافتح Console للمزيد من التفاصيل.';
      } else if (error.message) {
        errorMessage = `خطأ: ${error.message}\n\nافتح Console (F12) للمزيد من التفاصيل.`;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      console.log('🏁 Finished - Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

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
                  إضافة صنف جديد
                </h1>
                <span className="text-xs text-gray-500">{userData?.name || 'الشيف'}</span>
              </div>
            </Link>

            <button
              onClick={() => router.push('/chef/dishes')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>إلغاء</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">المعلومات الأساسية</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Arabic Name */}
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
                  placeholder="مثال: مجبوس دجاج"
                />
              </div>

              {/* English Name */}
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
                  placeholder="Example: Chicken Majboos"
                />
              </div>

              {/* Arabic Description */}
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
                  placeholder="وصف تفصيلي للصنف بالعربي..."
                />
              </div>

              {/* English Description */}
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
                  placeholder="Detailed description in English..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">التفاصيل والتسعير</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category */}
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

              {/* Price */}
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
                  placeholder="8.500"
                />
              </div>

              {/* Preparation Time */}
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
                  placeholder="45"
                />
              </div>

              {/* Serving Size */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  حجم الحصة
                </label>
                <input
                  type="text"
                  name="servingSize"
                  value={formData.servingSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="2-3 أشخاص"
                />
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  السعرات الحرارية
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="450"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">الصور</h2>

            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-600 font-bold">
                    انقر لرفع الصور أو اسحبها هنا
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG أو WEBP (حد أقصى 5 صور)</p>
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

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
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
            )}
          </div>

          {/* Allergens */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">مسببات الحساسية</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="showAllergens"
                  checked={formData.showAllergens}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-700">عرض للعملاء</span>
              </label>
            </div>

            <div className={`flex flex-wrap gap-3 ${!formData.showAllergens ? 'opacity-50' : ''}`}>
              {ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => handleAllergenToggle(allergen)}
                  disabled={!formData.showAllergens}
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${
                    formData.allergens.includes(allergen)
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                  } disabled:cursor-not-allowed`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">المكونات</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="showIngredients"
                  checked={formData.showIngredients}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-700">عرض للعملاء</span>
              </label>
            </div>

            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              disabled={!formData.showIngredients}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={(e) => {
                console.log('🖱️  Submit button clicked!');
                console.log('   isSubmitting:', isSubmitting);
                console.log('   Button disabled:', isSubmitting);
              }}
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
                  <span>حفظ الصنف</span>
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
