'use client';

// ============================================
// ChefHub - Search & Filter Component
// ============================================

import { Search, MapPin, Filter } from 'lucide-react';
import { KUWAIT_GOVERNORATES } from '@/types';
import { useState } from 'react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onGovernorateChange: (governorate: string) => void;
  onSpecialtyChange: (specialty: string) => void;
}

const SPECIALTIES = [
  'الكل',
  'مأكولات عربية',
  'مأكولات إيطالية',
  'مأكولات آسيوية',
  'حلويات شرقية',
  'حلويات غربية',
  'معجنات',
  'مخبوزات',
  'أطباق صحية',
];

export function SearchFilter({ onSearch, onGovernorateChange, onSpecialtyChange }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleGovernorateChange = (value: string) => {
    setSelectedGovernorate(value);
    onGovernorateChange(value);
  };

  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
    onSpecialtyChange(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="ابحث عن شيف أو صنف..."
          className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-6 space-y-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top duration-300">
          {/* Governorate Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="w-4 h-4 inline ml-2" />
              المحافظة
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleGovernorateChange('all')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedGovernorate === 'all'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                جميع المحافظات
              </button>
              {KUWAIT_GOVERNORATES.map((gov) => (
                <button
                  key={gov.id}
                  onClick={() => handleGovernorateChange(gov.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    selectedGovernorate === gov.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {gov.nameAr}
                </button>
              ))}
            </div>
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              التخصص
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtyChange(specialty)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedSpecialty === specialty
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
