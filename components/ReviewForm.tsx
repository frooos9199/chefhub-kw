'use client';

// ============================================
// ChefHub - Review Form Component
// ============================================

import { useState } from 'react';
import { Star, Send } from 'lucide-react';

interface ReviewFormProps {
  dishId: string;
  dishName: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewForm({ dishId, dishName, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('يرجى اختيار التقييم');
      return;
    }

    if (comment.trim().length < 10) {
      setError('يرجى كتابة تعليق أطول (10 أحرف على الأقل)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(rating, comment);
      setSuccess(true);
      setRating(0);
      setComment('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">أضف تقييمك</h3>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 font-medium">
          ✅ تم إرسال تقييمك بنجاح!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            تقييمك لـ {dishName}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {rating === 5 && '⭐ ممتاز!'}
              {rating === 4 && '👍 جيد جداً'}
              {rating === 3 && '👌 جيد'}
              {rating === 2 && '😐 مقبول'}
              {rating === 1 && '😞 يحتاج تحسين'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            تعليقك
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            placeholder="شاركنا رأيك في هذا الصنف..."
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            {comment.length} / 500 حرف
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              إرسال التقييم
            </>
          )}
        </button>
      </form>
    </div>
  );
}
