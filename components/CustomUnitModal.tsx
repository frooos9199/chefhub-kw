'use client';

import React, { useState } from 'react';
import { X, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface CustomUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
}

export function CustomUnitModal({ isOpen, onClose, onSubmit }: CustomUnitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('الرجاء إدخال اسم الوحدة');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await onSubmit(name.trim(), description.trim() || undefined);
      setSuccess(true);
      setTimeout(() => {
        setName('');
        setDescription('');
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      {/* Modal */}
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-full md:max-w-md shadow-2xl animate-in slide-in-from-bottom md:zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl md:rounded-t-2xl flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-black flex items-center gap-2">
            <Package className="w-5 h-5" />
            وحدة جديدة
          </h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 text-right">
              اسم الوحدة *
            </label>
            <p className="text-xs text-gray-600 mb-2 text-right">
              مثال: كيلو، كأس، حبة، حزمة
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الوحدة"
              maxLength={50}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-right focus:border-emerald-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 text-right">
              الوصف (اختياري)
            </label>
            <p className="text-xs text-gray-600 mb-2 text-right">
              مثال: 1000 غرام، كمية قياسية
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أضف وصف اختياري"
              maxLength={200}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-right focus:border-emerald-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-700 text-right">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-green-700 text-right">✅ تم إضافة الوحدة بنجاح</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-2">ℹ️ معلومات الوحدة</p>
            <p className="text-sm text-blue-800 text-right">
              الوحدات المخصصة تساعدك على تحديد كيفية بيع منتجاتك (مثل: بالكيلو، بالحبة، بالحزمة).
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الوحدة'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
