'use client';

import React from 'react';
import '@/styles/energy.css';

interface EnergyTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
}

export function EnergyTooltip({ children, content }: EnergyTooltipProps) {
  return (
    <div className="energy-tooltip-container">
      {children}
      <div className="energy-tooltip-content bg-gray-900 text-white text-xs rounded-lg py-2 px-3 w-48 text-center shadow-xl font-medium tracking-wide">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}