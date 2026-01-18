"use client";


import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Clock, Package, Trash2, CheckCircle, XCircle, Phone, Mail, MessageCircle, Calendar, FileText, Building2, Printer } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { notifyChefApproval } from "@/lib/notifications";

export default function AdminChefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [chef, setChef] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dishes, setDishes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // التحقق من صلاحيات الأدمن
  useEffect(() => {
    if (!authLoading) {
      if (!user || userData?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, userData, authLoading, router]);


  async function handleDeleteChef() {
    if (!chef?.id || !user?.uid) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا الشيف؟ سيتم حذف جميع بياناته نهائياً بما في ذلك حسابه من Firebase Authentication!")) return;
    setDeleting(true);
    try {
      // حذف جميع منتجات الشيف أولاً
      const dishesQuery = query(collection(db, 'dishes'), where('chefId', '==', chef.id));
      const dishesSnapshot = await getDocs(dishesQuery);
      
      console.log(`🗑️ جاري حذف ${dishesSnapshot.size} منتج للشيف...`);
      
      const deletePromises = dishesSnapshot.docs.map(dishDoc => deleteDoc(dishDoc.ref));
      await Promise.all(deletePromises);
      
      console.log('✅ تم حذف جميع المنتجات');
      
      // استدعاء API لحذف المستخدم من Auth و Firestore
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: chef.id,
          adminId: user.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل حذف الشيف');
      }

      alert(`تم حذف الشيف و ${dishesSnapshot.size} منتج بنجاح! ✅`);
      router.push("/admin/chef");
    } catch (err: any) {
      console.error("خطأ في الحذف:", err);
      alert("حدث خطأ أثناء حذف الشيف: " + err.message);
    }
    setDeleting(false);
  }

  async function handleToggleStatus(newStatus: 'active' | 'suspended') {
    if (!chef?.id) return;
    const confirmMsg = newStatus === 'active' 
      ? "هل تريد الموافقة على هذا الشيف وتفعيل حسابه؟"
      : "هل تريد إيقاف هذا الشيف؟";
    
    if (!window.confirm(confirmMsg)) return;
    
    setUpdating(true);
    try {
      const wasInactive = chef.status !== 'active';
      
      // تحديث في chefs collection
      await updateDoc(doc(db, "chefs", chef.id), {
        status: newStatus,
        isActive: newStatus === 'active'
      });
      
      // تحديث في users collection
      await updateDoc(doc(db, "users", chef.id), {
        status: newStatus,
        isActive: newStatus === 'active'
      });
      
      // تحديث حالة جميع منتجات الشيف
      const dishesQuery = query(
        collection(db, "dishes"), 
        where("chefId", "==", chef.id)
      );
      const dishesSnapshot = await getDocs(dishesQuery);
      
      // تحديث حالة كل منتج
      const updatePromises = dishesSnapshot.docs.map(dishDoc => 
        updateDoc(doc(db, "dishes", dishDoc.id), {
          status: newStatus,
          isActive: newStatus === 'active'
        })
      );
      await Promise.all(updatePromises);
      
      // إرسال إشعار للشيف عند الموافقة (إذا كان الحساب معلقاً من قبل)
      if (newStatus === 'active' && wasInactive) {
        try {
          await notifyChefApproval({
            chefId: chef.id,
            chefName: chef.businessName || chef.name,
            chefEmail: chef.email,
            chefWhatsApp: chef.phone
          });
          console.log('✅ Chef approval notification sent');
        } catch (notifError) {
          console.error('⚠️ Failed to send approval notification:', notifError);
          // لا نوقف العملية إذا فشل الإشعار
        }
      }
      
      // تحديث الحالة المحلية
      setChef((prev: any) => ({ ...prev, status: newStatus, isActive: newStatus === 'active' }));
      
      const dishCount = dishesSnapshot.size;
      alert(
        newStatus === 'active' 
          ? `تم تفعيل الشيف و ${dishCount} منتج بنجاح! ✅\nتم إرسال إشعار للشيف عبر الإيميل والواتساب`
          : `تم إيقاف الشيف و ${dishCount} منتج بنجاح!`
      );
    } catch (err) {
      console.error("خطأ في تحديث الحالة:", err);
      alert("حدث خطأ أثناء تحديث حالة الشيف");
    }
    setUpdating(false);
  }

  // طباعة الإقرار القانوني
  function handlePrintAgreement() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>الإقرار القانوني - ${chef.name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; direction: rtl; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #dc2626; padding-bottom: 20px; }
          .header h1 { color: #dc2626; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin: 30px 0; padding: 20px; border: 2px solid #e5e7eb; border-radius: 10px; }
          .section h2 { color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 5px; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #1f2937; }
          .signature-box { margin-top: 30px; padding: 30px; border: 3px solid #dc2626; border-radius: 10px; text-align: center; background: #fef2f2; }
          .signature { font-family: cursive; font-size: 48px; color: #dc2626; margin: 20px 0; }
          .status { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; }
          .status-active { background: #d1fae5; color: #065f46; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; border-top: 2px solid #e5e7eb; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚖️ الإقرار القانوني والموافقة على الشروط والأحكام</h1>
          <p>منصة ChefHub - Kuwait</p>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="section">
          <h2>📋 بيانات الشيف</h2>
          <div class="info-row">
            <span class="label">الاسم الكامل:</span>
            <span class="value">${chef.name || '--'}</span>
          </div>
          <div class="info-row">
            <span class="label">اسم المشروع/المطبخ:</span>
            <span class="value">${chef.businessName || '--'}</span>
          </div>
          <div class="info-row">
            <span class="label">البريد الإلكتروني:</span>
            <span class="value">${chef.email || '--'}</span>
          </div>
          <div class="info-row">
            <span class="label">رقم الهاتف:</span>
            <span class="value">${chef.phone || '--'}</span>
          </div>
          <div class="info-row">
            <span class="label">تاريخ التسجيل:</span>
            <span class="value">${chef.createdAt?.toDate ? chef.createdAt.toDate().toLocaleDateString('ar-KW') : '--'}</span>
          </div>
          <div class="info-row">
            <span class="label">الحالة:</span>
            <span class="status ${chef.status === 'active' ? 'status-active' : 'status-pending'}">
              ${chef.status === 'active' ? '✅ نشط' : chef.status === 'pending' ? '⏳ قيد المراجعة' : '🚫 موقوف'}
            </span>
          </div>
        </div>

        <div class="section">
          <h2>✅ الموافقة على الشروط والأحكام</h2>
          <div class="info-row">
            <span class="label">حالة الموافقة:</span>
            <span class="value" style="color: ${chef.agreedToTerms ? '#059669' : '#dc2626'}; font-weight: bold;">
              ${chef.agreedToTerms ? '✓ تمت الموافقة' : '✗ لم تتم الموافقة'}
            </span>
          </div>
          ${chef.signatureDate ? `
          <div class="info-row">
            <span class="label">تاريخ التوقيع:</span>
            <span class="value">${chef.signatureDate}</span>
          </div>
          ` : ''}
        </div>

        ${chef.signature ? `
        <div class="signature-box">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">📝 التوقيع الإلكتروني</h3>
          <div class="signature">${chef.signature}</div>
          <p style="color: #6b7280; margin: 10px 0;">هذا التوقيع يُثبت موافقة الشيف على جميع الشروط والأحكام</p>
        </div>
        ` : ''}

        <div class="section" style="background: #fffbeb; border-color: #f59e0b;">
          <h2 style="color: #92400e;">⚠️ ملاحظة قانونية مهمة</h2>
          <p style="line-height: 1.8; color: #78350f;">
            بموجب هذا الإقرار، يتحمل الشيف المسؤولية الكاملة عن جودة ونظافة وسلامة جميع المنتجات الغذائية المقدمة.
            منصة ChefHub هي مجرد وسيط إلكتروني لعرض المنتجات وربط الشيف بالعملاء، وليست مسؤولة عن أي أضرار
            قد تنتج عن المنتجات المقدمة.
          </p>
        </div>

        <div class="footer">
          <p><strong>ChefHub Kuwait</strong> - منصة ربط الشيف بالعملاء</p>
          <p>www.chefhub-kw.vercel.app</p>
          <p>تم إنشاء هذا المستند بواسطة لوحة تحكم الأدمن</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  useEffect(() => {
    async function fetchChef() {
      // الانتظار حتى تنتهي مصادقة المستخدم
      if (authLoading) return;
      if (!user || userData?.role !== 'admin') return;
      
      setLoading(true);
      setError('');
      try {
        let chefId = '';
        if (typeof params.id === 'string') chefId = params.id;
        else if (Array.isArray(params.id)) chefId = params.id[0];
        
        if (!chefId) {
          setError('لم يتم تحديد الشيف');
          setLoading(false);
          return;
        }
        
        console.log('Fetching chef with ID:', chefId);
        
        // جلب بيانات الشيف
        const chefRef = doc(db, 'chefs', chefId);
        const chefSnap = await getDoc(chefRef);
        
        if (!chefSnap.exists()) {
          console.log('Chef document does not exist');
          setError('الشيف غير موجود في قاعدة البيانات');
          setLoading(false);
          return;
        }
        
        console.log('Chef data found:', chefSnap.data());
        const data = chefSnap.data() || {};
        const chefData = {
          id: chefId,
          name: data.name || '',
          businessName: data.businessName || '',
          email: data.email || '',
          profileImage: data.profileImage || '/default-chef-avatar.png',
          specialty: Array.isArray(data.specialty) ? data.specialty : [],
          customSpecialty: data.customSpecialty || '',
          rating: typeof data.rating === 'number' ? data.rating : 0,
          totalRatings: typeof data.totalRatings === 'number' ? data.totalRatings : 0,
          totalOrders: typeof data.totalOrders === 'number' ? data.totalOrders : 0,
          bio: data.bio || '',
          coverImage: data.coverImage || '',
          status: data.status || 'pending',
          isActive: data.isActive ?? false,
          governorate: data.governorate || '',
          area: data.area || '',
          phone: data.phone || '',
          whatsappNumber: data.whatsappNumber || '',
          workingHours: data.workingHours || '',
          deliveryGovernorates: Array.isArray(data.deliveryGovernorates) ? data.deliveryGovernorates : [],
          deliveryFees: typeof data.deliveryFees === 'object' && data.deliveryFees !== null ? data.deliveryFees : {},
          totalRevenue: typeof data.totalRevenue === 'number' ? data.totalRevenue : 0,
          commission: typeof data.commission === 'number' ? data.commission : 0,
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
          createdAt: data.createdAt || null,
          // دعم الحقول القديمة والجديدة للإقرار القانوني
          legalAgreement: data.legalAgreement || null,
          agreedToTerms: data.legalAgreement?.agreedToTerms || data.agreedToTerms || false,
          signature: data.legalAgreement?.signature || data.signature || '',
          signatureDate: data.legalAgreement?.signatureDate || data.signatureDate || '',
        };
        
        console.log('📋 Chef data loaded:', {
          id: chefData.id,
          name: chefData.name,
          hasLegalAgreement: !!chefData.legalAgreement,
          agreedToTerms: chefData.agreedToTerms,
          signature: chefData.signature ? 'موجود' : 'غير موجود',
          signatureDate: chefData.signatureDate
        });
        
        setChef(chefData);
        setReviews(chefData.reviews);
        
        // جلب الأصناف الخاصة بالشيف
        console.log('Fetching dishes for chef:', chefId);
        const dishesQuery = query(collection(db, 'dishes'), where('chefId', '==', chefId));
        const dishesSnap = await getDocs(dishesQuery);
        const chefDishes = dishesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Found dishes:', chefDishes.length);
        setDishes(chefDishes);
        
        // جلب التقييمات من مجموعة منفصلة إذا موجودة
        try {
          const reviewsQuery = query(collection(db, 'chefReviews'), where('chefId', '==', chefId));
          const reviewsSnap = await getDocs(reviewsQuery);
          if (reviewsSnap.size > 0) {
            const chefReviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(chefReviews);
          }
        } catch (reviewErr) {
          console.log('Reviews collection might not exist, using embedded reviews');
        }
        
      } catch (err: any) {
        console.error('خطأ جلب بيانات الشيف:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        
        if (err.code === 'permission-denied') {
          setError('ليس لديك صلاحية للوصول إلى بيانات هذا الشيف');
        } else {
          setError(`حدث خطأ أثناء جلب بيانات الشيف: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchChef();
  }, [params.id, authLoading, user, userData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-600">جاري تحميل بيانات الشيف...</span>
      </div>
    );
  }
  if (error || !chef) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <span className="text-lg text-red-600">{error || 'حدث خطأ'}</span>
        <a
          href="/admin/chef"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
        >
          العودة لقائمة الشيف
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500">
        {chef.coverImage ? (
          <Image src={chef.coverImage} alt={chef.businessName} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl">👩‍🍳</span>
          </div>
        )}
        {/* رجوع للوحة الإدارة */}
        <a
          href="/admin/chef"
          className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl font-semibold hover:bg-white transition-all shadow-lg"
        >
          ← رجوع
        </a>
      </div>

      <div className="container mx-auto px-4 -mt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chef Header Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <div className="flex justify-between items-start mb-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    chef.status === 'active' ? 'bg-green-100 text-green-700' :
                    chef.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {chef.status === 'active' ? '✅ نشط' :
                     chef.status === 'pending' ? '⏳ قيد المراجعة' :
                     '🚫 موقوف'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {chef.status !== 'active' && (
                    <button
                      onClick={() => handleToggleStatus('active')}
                      disabled={updating || deleting}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" /> الموافقة وتفعيل الشيف
                    </button>
                  )}
                  {chef.status === 'active' && (
                    <button
                      onClick={() => handleToggleStatus('suspended')}
                      disabled={updating || deleting}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" /> إيقاف الشيف
                    </button>
                  )}
                  <button
                    onClick={handleDeleteChef}
                    disabled={deleting || updating}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" /> حذف
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
                  {chef.profileImage ? (
                    <Image src={chef.profileImage} alt={chef.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                      {chef.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-gray-900 mb-2">{chef.name}</h1>
                  {chef.businessName && (
                    <div className="flex items-center gap-2 text-lg text-gray-600 mb-3">
                      <Building2 className="w-5 h-5" />
                      <span className="font-semibold">{chef.businessName}</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(chef.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-gray-900">{chef.rating}</span>
                    </div>
                    <span className="text-gray-500">({chef.totalRatings} تقييم)</span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(chef.specialty) && chef.specialty.map((spec: string) => (
                      <span
                        key={spec}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-semibold rounded-full border-2 border-emerald-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">نبذة عن الشيف</h3>
                <p className="text-gray-600 leading-relaxed">{chef.bio}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {chef.totalOrders}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">طلب مكتمل</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {dishes.length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">صنف متوفر</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {chef.totalRatings}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">تقييم</div>
                </div>
              </div>
            </div>

            {/* Dishes */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-emerald-600" />
                الأصناف المتوفرة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dishes.length > 0 ? dishes.map((dish: any) => (
                  <div key={dish.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="font-bold text-gray-900 mb-2">{dish.nameAr || dish.name}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-600 font-bold">{dish.price?.toFixed ? dish.price.toFixed(3) : dish.price || '--'} د.ك</span>
                      <span className="text-gray-500">• {dish.sales || 0} مبيعات</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-amber-600 font-bold">{dish.rating || '--'}</span>
                      </span>
                    </div>
                  </div>
                )) : <div className="text-gray-500">لا توجد أصناف لهذا الشيف.</div>}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-emerald-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                التقييمات ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((review: any, idx: number) => (
                  <div key={review.id || idx} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{review.customerName || review.name || '---'}</h4>
                        <p className="text-sm text-gray-500">{review.date || ''}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment || review.text || ''}</p>
                  </div>
                )) : <div className="text-gray-500">لا توجد تقييمات بعد.</div>}
              </div>
            </div>

            {/* Legal Agreement */}
            {(chef.legalAgreement || chef.agreedToTerms || chef.signature || chef.signatureDate) && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-red-600" />
                    الإقرار القانوني والموافقة
                  </h2>
                  <button
                    onClick={handlePrintAgreement}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                  >
                    <Printer className="w-5 h-5" />
                    طباعة الإقرار
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        {chef.agreedToTerms ? (
                          <CheckCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">الموافقة على الشروط والأحكام</h4>
                        <p className="text-sm text-gray-700 mb-3">
                          {chef.agreedToTerms ? (
                            <span className="text-green-700 font-semibold">✓ وافق الشيف على جميع الشروط والأحكام والمسؤوليات القانونية</span>
                          ) : (
                            <span className="text-gray-500">لم يتم تسجيل الموافقة</span>
                          )}
                        </p>
                        
                        {chef.signature && (
                          <div className="mt-4 pt-4 border-t border-red-200">
                            <div className="text-xs text-gray-500 mb-2">التوقيع الإلكتروني:</div>
                            <div className="font-bold text-2xl text-red-800" style={{ fontFamily: 'cursive' }}>
                              {chef.signature}
                            </div>
                          </div>
                        )}
                        
                        {chef.signatureDate && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>تاريخ التوقيع: <span className="font-semibold">{chef.signatureDate}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>ملاحظة:</strong> هذا الإقرار يُلزم الشيف بالمسؤولية الكاملة عن جودة ونظافة وسلامة المنتجات المقدمة، وأن منصة ChefHub هي مجرد وسيط إلكتروني.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-emerald-100 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">معلومات التواصل</h3>
              <div className="space-y-4">
                {/* Email */}
                {chef.email && (
                  <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">البريد الإلكتروني</div>
                        <a href={`mailto:${chef.email}`} className="font-semibold text-purple-700 hover:underline break-all">
                          {chef.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {chef.phone && (
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">رقم الهاتف</div>
                        <a href={`tel:${chef.phone}`} className="font-semibold text-blue-700 hover:underline" dir="ltr">
                          {chef.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {chef.whatsappNumber && (
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">واتساب</div>
                        <a 
                          href={`https://wa.me/${chef.whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-green-700 hover:underline" 
                          dir="ltr"
                        >
                          {chef.whatsappNumber}
                        </a>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${chef.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      فتح محادثة واتساب
                    </a>
                  </div>
                )}

                {/* Working Hours */}
                {chef.workingHours && (
                  <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-100">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <div>
                        <div className="text-xs text-gray-500 mb-1">ساعات العمل</div>
                        <div className="font-semibold text-gray-900">{chef.workingHours}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Date */}
                {chef.createdAt && (
                  <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-xs text-gray-500 mb-1">تاريخ التسجيل</div>
                        <div className="font-semibold text-gray-900">
                          {chef.createdAt.toDate ? chef.createdAt.toDate().toLocaleDateString('ar-KW', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : '--'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Delivery Areas */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  مناطق التوصيل
                </h4>
                <div className="space-y-2">
                  {Array.isArray(chef.deliveryGovernorates) && chef.deliveryGovernorates.map((gov: string) => (
                    <div key={gov} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{gov}</span>
                      <span className="text-emerald-600 font-bold">
                        {chef.deliveryFees && chef.deliveryFees[gov] ? chef.deliveryFees[gov].toFixed(3) : '--'} د.ك
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}