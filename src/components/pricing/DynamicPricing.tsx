'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDynamicPricing } from '@/hooks/useDynamicPricing';
import { ABTesting } from './ABTesting';
import { ElasticityAnalysis } from './ElasticityAnalysis';
import { AutomatedControls } from './AutomatedControls';
import { CompetitiveAnalysis as CompetitorsUI } from './CompetitiveAnalysis';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  RefreshCcw, 
  Activity,
  History 
} from 'lucide-react';

export default function DynamicPricing() {
  const { data, isLoading, isAutomated, handleToggleAutomation } = useDynamicPricing();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-600" />
            Pricing Optimization Engine
          </h1>
          <p className="text-gray-500 mt-1">Real-time dynamic pricing powered by demand forecasting and competitive analysis.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-600">Live data fetching every 5s</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">+15.2%</span>
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Price</p>
          <p className="text-3xl font-bold text-gray-900">${data.currentStrategy.currentPrice.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <History className="w-3 h-3" />
            Last changed 14 mins ago
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-blue-600 text-sm font-bold bg-blue-50 px-2 py-1 rounded">Targeted</span>
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Revenue Optimization</p>
          <p className="text-3xl font-bold text-gray-900">${data.currentStrategy.performance.revenue.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-1">Daily trend is outperforming forecast</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCcw className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-purple-600 text-sm font-bold bg-purple-50 px-2 py-1 rounded">A/B Testing</span>
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Experiments</p>
          <p className="text-3xl font-bold text-gray-900">{data.abTests.length}</p>
          <p className="text-[10px] text-gray-400 mt-1">3 variants in simulation</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-orange-600 text-sm font-bold bg-orange-50 px-2 py-1 rounded">High</span>
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Demand Elasticity</p>
          <p className="text-3xl font-bold text-gray-900">0.82</p>
          <p className="text-[10px] text-gray-400 mt-1">Price change impact: Substantial</p>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ElasticityAnalysis data={data.elasticityData} currentPrice={data.currentStrategy.currentPrice} />
          <ABTesting tests={data.abTests} />
        </div>
        <div className="space-y-8">
          <AutomatedControls 
            isAutomated={isAutomated} 
            onToggle={handleToggleAutomation} 
            performanceScore={94}
          />
          <CompetitorsUI competitors={data.competitors} />
        </div>
      </div>
    </div>
  );
}
