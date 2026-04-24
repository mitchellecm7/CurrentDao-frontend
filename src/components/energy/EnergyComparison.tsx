'use client';

import type { EnergySource } from '@/types/energy';
import { EnergyIcon } from './EnergyIcon';
import { QualityRating } from './QualityRating';
import { X } from 'lucide-react';

interface EnergyComparisonProps {
  sources: EnergySource[];
  onRemove: (id: string) => void;
}

export function EnergyComparison({ sources, onRemove }: EnergyComparisonProps) {
  if (sources.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-medium">
        Select energy sources from the marketplace to compare them side-by-side.
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
      {sources.map(source => (
        <div key={source.id} className="snap-start min-w-[280px] max-w-[320px] bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md">
          <button 
            onClick={() => onRemove(source.id)}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1.5 transition-colors z-10"
            aria-label={`Remove ${source.name} from comparison`}
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">
              <EnergyIcon type={source.type} className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 line-clamp-1" title={source.name}>{source.name}</h4>
              <p className="text-xs text-gray-500 font-medium capitalize">{source.type} Energy • {source.location}</p>
            </div>
          </div>
          
          <div className="p-5 space-y-5 flex-grow">
            <QualityRating rating={source.quality} certifications={source.certifications} />
            
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
              <div>
                <span className="text-xs text-gray-500 font-medium block">Renewable Ratio</span>
                <span className="font-bold text-green-600 text-lg">{source.renewablePercentage}%</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium block">Price Estimate</span>
                <span className="font-bold text-gray-900 text-lg">${source.pricePerKwh.toFixed(3)}<span className="text-xs font-normal text-gray-500">/kWh</span></span>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 font-medium block mb-1">Educational Profile</span>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{source.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}