import React from 'react';

const WeatherOracles: React.FC = () => {
  const regions = [
    { id: 'us-east', name: 'US East (PJM)', temp: 22, condition: 'Sunny', solar: '95%', wind: '12mph' },
    { id: 'eu-west', name: 'EU West (France)', temp: 18, condition: 'Cloudy', solar: '40%', wind: '25mph' },
    { id: 'asia-ne', name: 'Asia NE (Tokyo)', temp: 25, condition: 'Rainy', solar: '10%', wind: '8mph' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Weather & Energy Forecasts</h2>
        <span className="text-xs text-slate-500 font-medium italic">Data refreshed every 15m</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {regions.map((region) => (
          <div key={region.id} className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">
                {region.condition === 'Sunny' ? '☀️' : region.condition === 'Cloudy' ? '☁️' : '🌧️'}
              </span>
            </div>
            
            <h3 className="font-bold text-white text-lg mb-1">{region.name}</h3>
            <p className="text-slate-400 text-sm mb-6">{region.condition}, {region.temp}°C</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Solar Output</p>
                <p className="text-lg font-black text-amber-400">{region.solar}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Wind Speed</p>
                <p className="text-lg font-black text-blue-400">{region.wind}</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Consensus reached (7/7 Oracles)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherOracles;
