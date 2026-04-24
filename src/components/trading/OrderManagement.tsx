import React, { useState } from 'react';
import { LiveMatch, OrderBookEntry } from '../../types/orderbook';

interface OrderManagementProps {
  trades: LiveMatch[];
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ trades }) => {
  const [activeTab, setActiveTab] = useState<'open' | 'history' | 'funds'>('history');

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-full flex flex-col">
      <div className="flex border-b border-white/10 bg-white/5">
        {(['open', 'history', 'funds'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'open' ? 'Open Orders' : tab === 'history' ? 'Trade History' : 'Funds'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'history' ? (
          <table className="w-full text-xs">
            <thead className="text-gray-500 uppercase font-bold sticky top-0 bg-slate-900/90 backdrop-blur pb-2">
              <tr>
                <th className="text-left py-2 font-medium">Time</th>
                <th className="text-left py-2 font-medium">Side</th>
                <th className="text-right py-2 font-medium">Price</th>
                <th className="text-right py-2 font-medium">Amount</th>
                <th className="text-right py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trades.map((trade, i) => (
                <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-2.5 text-gray-500">
                    {new Date(trade.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className={`py-2.5 font-bold ${trade.aggressor === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.aggressor.toUpperCase()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-gray-200">{trade.price.toFixed(4)}</td>
                  <td className="py-2.5 text-right font-mono text-gray-200">{trade.quantity.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-mono text-gray-400">{(trade.price * trade.quantity).toFixed(2)}</td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-600 font-medium italic">
                    No trade history found for this session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <div className="w-16 h-16 border-2 border-dashed border-gray-500 rounded-full mb-4 animate-spin-slow"></div>
            <p className="text-sm font-medium">Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};
