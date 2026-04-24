'use client';

import type { EnergyFilters, QualityRating } from '@/types/energy';
import { SlidersHorizontal } from 'lucide-react';

interface EnergyFilterProps {
  filters: EnergyFilters;
  onFilterChange: (filters: EnergyFilters) => void;
}

export function EnergyFilter({ filters, onFilterChange }: EnergyFilterProps) {
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, minRenewablePercentage: parseInt(e.target.value, 10) });
  };

  const toggleQuality = (q: QualityRating) => {
    const newQuality = filters.quality.includes(q)
      ? filters.quality.filter(x => x !== q)
      : [...filters.quality, q];
    onFilterChange({ ...filters, quality: newQuality });
  };

  const qualities: QualityRating[] = ['premium', 'standard', 'basic'];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
        Source Filters
      </h3>
      
      <div>
        <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Min Renewable %</span>
          <span className="text-blue-600 font-bold">{filters.minRenewablePercentage}%</span>
        </label>
        <input type="range" min="0" max="100" step="5" value={filters.minRenewablePercentage} onChange={handleRangeChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Quality Tier</label>
        <div className="flex flex-wrap gap-2">
          {qualities.map(q => (
            <button key={q} onClick={() => toggleQuality(q)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize border transition-all ${filters.quality.includes(q) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}