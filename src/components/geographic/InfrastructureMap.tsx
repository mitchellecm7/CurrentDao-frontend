import React from 'react';
import { MapRenderingUtils } from '../../utils/geographic/map-rendering';

interface InfrastructureMapProps {
  width: number;
  height: number;
}

const ASSETS = [
  { name: 'Solar Array Alpha', type: 'solar', coords: { lat: 36.1716, lng: -115.1391 } },
  { name: 'Wind Farm Beta', type: 'wind', coords: { lat: 53.5461, lng: -113.4938 } },
  { name: 'Hydro Dam Gamma', type: 'hydro', coords: { lat: 47.6062, lng: -122.3321 } },
  { name: 'Nuclear Plant Delta', type: 'nuclear', coords: { lat: 51.1657, lng: 10.4515 } },
];

export const InfrastructureMap: React.FC<InfrastructureMapProps> = ({ width, height }) => {
  return (
    <g className="infrastructure">
      {ASSETS.map((asset, i) => {
        const pos = MapRenderingUtils.project(asset.coords, width, height);
        
        return (
          <g key={i} className="asset-node group cursor-pointer">
            <rect
              x={pos.x - 6}
              y={pos.y - 6}
              width="12"
              height="12"
              rx="2"
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="1"
              className="group-hover:fill-blue-500 transition-colors"
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r="20"
              fill="rgba(59, 130, 246, 0.05)"
              className="group-hover:fill-blue-500/10 transition-colors"
            />
            
            <text
              x={pos.x}
              y={pos.y + 25}
              textAnchor="middle"
              fill="white"
              className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {asset.name}
            </text>
          </g>
        );
      })}
    </g>
  );
};
