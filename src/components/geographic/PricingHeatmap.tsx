import React from 'react';
import { RegionalMarketData } from '../../types/maps';
import { MapRenderingUtils } from '../../utils/geographic/map-rendering';

interface PricingHeatmapProps {
  pricing: RegionalMarketData[];
  width: number;
  height: number;
}

export const PricingHeatmap: React.FC<PricingHeatmapProps> = ({ pricing, width, height }) => {
  return (
    <g className="heatmap">
      {pricing.map((region, i) => {
        const pos = MapRenderingUtils.project(region.coordinates, width, height);
        const color = region.averagePrice > 0.15 ? 'rgba(239, 68, 68, 0.4)' : region.averagePrice > 0.11 ? 'rgba(234, 179, 8, 0.4)' : 'rgba(34, 197, 94, 0.4)';

        return (
          <g key={i} className="region-marker group cursor-help">
            <circle
              cx={pos.x}
              cy={pos.y}
              r={20 + (region.totalCapacity / 10000)}
              fill={color}
              className="animate-pulse"
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r="4"
              fill="white"
              className="shadow-xl"
            />
            
            {/* Tooltip-like label */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity">
              <rect
                x={pos.x + 10}
                y={pos.y - 40}
                width="120"
                height="60"
                rx="8"
                fill="rgba(15, 23, 42, 0.9)"
                stroke="rgba(255,255,255,0.1)"
              />
              <text x={pos.x + 20} y={pos.y - 20} fill="white" className="text-[10px] font-bold uppercase tracking-wider">
                {region.region}
              </text>
              <text x={pos.x + 20} y={pos.y - 5} fill={region.priceTrend === 'up' ? '#f87171' : '#4ade80'} className="text-[12px] font-black">
                ${region.averagePrice.toFixed(2)} / kWh
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
