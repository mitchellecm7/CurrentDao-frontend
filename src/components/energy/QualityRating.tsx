'use client';

import { Star, ShieldCheck } from 'lucide-react';
import type { QualityRating, Certification } from '@/types/energy';

interface QualityRatingProps {
  rating: QualityRating;
  certifications?: Certification[];
}

export function QualityRating({ rating, certifications = [] }: QualityRatingProps) {
  const renderStars = () => {
    let count = 1;
    if (rating === 'standard') count = 2;
    if (rating === 'premium') count = 3;

    return (
      <div className="flex items-center gap-0.5 text-amber-500" aria-label={`Quality rating: ${rating}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < count ? 'fill-current' : 'text-gray-300'}`} />
        ))}
        <span className="text-xs font-semibold text-gray-600 ml-1 capitalize">{rating}</span>
      </div>
    );
  };

  const formatCert = (cert: string) => cert.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col gap-2">
      {renderStars()}
      {certifications.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {certifications.map(cert => (
            <span key={cert} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
              <ShieldCheck className="w-3 h-3" />
              {formatCert(cert)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}