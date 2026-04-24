import React, { useState } from 'react';
import { useRealTimeTrading } from '../../hooks/useRealTimeTrading';
import { OrderBook } from './OrderBook';
import { MarketDepth } from './MarketDepth';
import { OrderManagement } from './OrderManagement';

export const TradingEngine: React.FC = () => {
  const { orderBook, trades, fairPrice, connectionStatus, placeOrder } = useRealTimeTrading();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !amount) return;

    placeOrder({
      price: parseFloat(price),
      quantity: parseFloat(amount),
      side: orderSide,
      type: 'limit'
    });

    setAmount('');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-8 text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
        
        {/* Left Column: Order Book & Market Data */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="flex-1 min-h-0">
            <OrderBook 
              bids={orderBook.bids} 
              asks={orderBook.asks} 
              spread={orderBook.spread} 
              spreadPercentage={orderBook.spreadPercentage}
            />
          </div>
          <div className="h-1/3 min-h-[250px]">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full flex flex-col justify-center items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 z-10">Fair Market Price</span>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 z-10">
                ${fairPrice.toFixed(4)}
              </span>
              <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter z-10 ${
                connectionStatus === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                {connectionStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Chart & Depth */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          <div className="flex-[2] bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex items-center justify-center relative group overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent)]" />
             <div className="text-center z-10">
               <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
               <h2 className="text-2xl font-bold mb-2">Live Price Chart</h2>
               <p className="text-gray-500 text-sm">Aggregating real-time energy flows...</p>
             </div>
          </div>
          <div className="flex-1 min-h-0">
            <MarketDepth bids={orderBook.bids} asks={orderBook.asks} />
          </div>
        </div>

        {/* Right Column: Trading Controls & History */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
              <button 
                onClick={() => setOrderSide('buy')}
                className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  orderSide === 'buy' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Buy
              </button>
              <button 
                onClick={() => setOrderSide('sell')}
                className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  orderSide === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Sell
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Price (USDT)</label>
                <input 
                  type="number" 
                  step="0.0001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="0.0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Amount (MWH)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="0.00"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 ${
                    orderSide === 'buy' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl shadow-green-500/20' 
                      : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-xl shadow-red-500/20'
                  }`}
                >
                  Confirm {orderSide}
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 min-h-0">
            <OrderManagement trades={trades} />
          </div>
        </div>
      </div>
    </div>
  );
};
