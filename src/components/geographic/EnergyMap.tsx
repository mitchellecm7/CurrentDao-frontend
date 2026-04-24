import React, { useRef, useState, useEffect } from 'react';
import { useGeographicData } from '../../hooks/useGeographicData';
import { FlowVisualization } from './FlowVisualization';
import { PricingHeatmap } from './PricingHeatmap';
import { InfrastructureMap } from './InfrastructureMap';

export const EnergyMap: React.FC = () => {
  const { flows, pricing, isLoading } = useGeographicData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Generating Global Flow Map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden" ref={containerRef}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,1)_0%,rgba(2,6,23,1)_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* SVG Map Layer */}
      <svg 
        className="relative z-10 w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <PricingHeatmap pricing={pricing} width={dimensions.width} height={dimensions.height} />
        <FlowVisualization flows={flows} width={dimensions.width} height={dimensions.height} />
        <InfrastructureMap width={dimensions.width} height={dimensions.height} />
      </svg>

      {/* UI Overlays */}
      <div className="absolute top-10 left-10 z-20 space-y-6 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm">
          <h1 className="text-2xl font-black text-white mb-2">Global Energy Flows</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Real-time visualization of cross-border energy trading and regional price disparities across the CurrentDao network.
          </p>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Flow</div>
              <div className="text-xl font-black text-blue-400">14.2 GW</div>
            </div>
            <div className="flex-1 border-l border-white/5 pl-4">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Routes</div>
              <div className="text-xl font-black text-emerald-400">284</div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto bg-slate-900/50 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl inline-flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Flows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing Heatmap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-4">
        {['+', '-', '⌖'].map(icon => (
          <button 
            key={icon}
            className="w-12 h-12 bg-slate-900/80 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-xl font-bold hover:bg-white hover:text-black transition-all shadow-xl"
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
};
