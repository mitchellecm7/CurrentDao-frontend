import React from 'react';

interface OrderTypeSelectorProps {
  orderType: 'market' | 'limit';
  onChange: (type: 'market' | 'limit') => void;
}

export default function OrderTypeSelector({ orderType, onChange }: OrderTypeSelectorProps) {
  return (
    <div className="flex bg-zinc-900 rounded-2xl p-1 mb-6">
      <button
        onClick={() => onChange('market')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
          orderType === 'market' 
            ? 'bg-yellow-400 text-black shadow-sm' 
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        Market
      </button>
      <button
        onClick={() => onChange('limit')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
          orderType === 'limit' 
            ? 'bg-yellow-400 text-black shadow-sm' 
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        Limit
      </button>
    </div>
  );
}