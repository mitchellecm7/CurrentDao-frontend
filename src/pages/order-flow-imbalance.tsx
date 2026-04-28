import React from 'react';
import { OrderFlowImbalance } from '@/components/orderbook/OrderFlowImbalance';

export default function OrderFlowImbalancePage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Order Flow Imbalance</h1>
          <p className="text-gray-400">
            Live buy/sell order flow imbalance analysis to help traders gauge market pressure
          </p>
        </div>
        
        <div className="space-y-6">
          <OrderFlowImbalance 
            symbol="BTC/USD"
            alertThreshold={70}
            showHistoricalOverlay={true}
            showPerAssetBreakdown={true}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderFlowImbalance 
              symbol="ETH/USD"
              alertThreshold={60}
              showHistoricalOverlay={false}
              showPerAssetBreakdown={false}
            />
            
            <OrderFlowImbalance 
              symbol="SOL/USD"
              alertThreshold={75}
              showHistoricalOverlay={false}
              showPerAssetBreakdown={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
