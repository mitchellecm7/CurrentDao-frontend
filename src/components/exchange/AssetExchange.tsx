'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowUpDown, 
  TrendingUp, 
  Clock, 
  Zap, 
  Sun, 
  Wind, 
  Droplet, 
  Flame, 
  Leaf,
  Info,
  Settings,
  ChevronDown
} from 'lucide-react'
import { useEnergyExchange } from '../../hooks/useEnergyExchange'
import { toast } from 'react-hot-toast'

export type EnergyAssetType = 
  | 'WATT' 
  | 'SOLAR' 
  | 'WIND' 
  | 'HYDRO' 
  | 'GEOTHERMAL' 
  | 'BIOMASS'
  | 'NATURAL_GAS'
  | 'COAL'
  | 'NUCLEAR'
  | 'CARBON_CREDITS'

interface EnergyAsset {
  symbol: EnergyAssetType
  name: string
  icon: React.ReactNode
  color: string
  description: string
  price: number
  change24h: number
  volume24h: number
  liquidity: number
}

interface ExchangeRate {
  from: EnergyAssetType
  to: EnergyAssetType
  rate: number
  spread: number
  lastUpdated: number
}

export function AssetExchange() {
  const [fromAsset, setFromAsset] = useState<EnergyAssetType>('WATT')
  const [toAsset, setToAsset] = useState<EnergyAssetType>('SOLAR')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slippage, setSlippage] = useState('0.5')
  
  const {
    assets,
    exchangeRates,
    isLoading,
    swap,
    getExchangeRate,
    calculateFee
  } = useEnergyExchange()

  const energyAssets: EnergyAsset[] = [
    {
      symbol: 'WATT',
      name: 'WATT Token',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-yellow-600',
      description: 'Base energy currency',
      price: 1.00,
      change24h: 0.5,
      volume24h: 1250000,
      liquidity: 5000000
    },
    {
      symbol: 'SOLAR',
      name: 'Solar Energy',
      icon: <Sun className="w-5 h-5" />,
      color: 'text-orange-500',
      description: 'Solar-generated energy credits',
      price: 0.95,
      change24h: 2.3,
      volume24h: 890000,
      liquidity: 3200000
    },
    {
      symbol: 'WIND',
      name: 'Wind Energy',
      icon: <Wind className="w-5 h-5" />,
      color: 'text-blue-500',
      description: 'Wind-generated energy credits',
      price: 0.92,
      change24h: -1.2,
      volume24h: 780000,
      liquidity: 2800000
    },
    {
      symbol: 'HYDRO',
      name: 'Hydro Energy',
      icon: <Droplet className="w-5 h-5" />,
      color: 'text-cyan-500',
      description: 'Hydroelectric energy credits',
      price: 0.88,
      change24h: 0.8,
      volume24h: 650000,
      liquidity: 2500000
    },
    {
      symbol: 'GEOTHERMAL',
      name: 'Geothermal Energy',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-red-500',
      description: 'Geothermal energy credits',
      price: 0.94,
      change24h: 1.5,
      volume24h: 420000,
      liquidity: 1800000
    },
    {
      symbol: 'BIOMASS',
      name: 'Biomass Energy',
      icon: <Leaf className="w-5 h-5" />,
      color: 'text-green-500',
      description: 'Biomass energy credits',
      price: 0.86,
      change24h: -0.5,
      volume24h: 380000,
      liquidity: 1500000
    },
    {
      symbol: 'NATURAL_GAS',
      name: 'Natural Gas',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-gray-600',
      description: 'Natural gas energy credits',
      price: 0.78,
      change24h: -2.1,
      volume24h: 920000,
      liquidity: 3600000
    },
    {
      symbol: 'COAL',
      name: 'Coal Energy',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-gray-700',
      description: 'Coal energy credits',
      price: 0.72,
      change24h: -3.4,
      volume24h: 680000,
      liquidity: 2400000
    },
    {
      symbol: 'NUCLEAR',
      name: 'Nuclear Energy',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-purple-500',
      description: 'Nuclear energy credits',
      price: 0.96,
      change24h: 0.3,
      volume24h: 580000,
      liquidity: 2200000
    },
    {
      symbol: 'CARBON_CREDITS',
      name: 'Carbon Credits',
      icon: <Leaf className="w-5 h-5" />,
      color: 'text-green-600',
      description: 'Carbon offset credits',
      price: 1.12,
      change24h: 4.2,
      volume24h: 340000,
      liquidity: 1200000
    }
  ]

  const getAssetInfo = (symbol: EnergyAssetType) => 
    energyAssets.find(asset => asset.symbol === symbol)

  const handleSwapAssets = () => {
    setFromAsset(toAsset)
    setToAsset(fromAsset)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      const rate = getExchangeRate(fromAsset, toAsset)
      const calculatedToAmount = (parseFloat(value) * rate).toFixed(6)
      setToAmount(calculatedToAmount)
    } else {
      setToAmount('')
    }
  }

  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      const rate = getExchangeRate(toAsset, fromAsset)
      const calculatedFromAmount = (parseFloat(value) * rate).toFixed(6)
      setFromAmount(calculatedFromAmount)
    } else {
      setFromAmount('')
    }
  }

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) {
      toast.error('Please enter swap amounts')
      return
    }

    try {
      await swap({
        fromAsset,
        toAsset,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        slippage: parseFloat(slippage)
      })
      
      toast.success('Swap executed successfully')
      setFromAmount('')
      setToAmount('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Swap failed')
    }
  }

  const currentRate = getExchangeRate(fromAsset, toAsset)
  const fee = fromAmount ? calculateFee(fromAsset, parseFloat(fromAmount)) : 0
  const fromAssetInfo = getAssetInfo(fromAsset)
  const toAssetInfo = getAssetInfo(toAsset)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Energy Asset Exchange</h2>
            <p className="text-sm text-gray-600">Multi-energy asset trading with real-time rates</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showAdvanced && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Advanced Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                step="0.1"
                min="0.1"
                max="5"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className={fromAssetInfo?.color}>
                        {fromAssetInfo?.icon}
                      </span>
                      <span className="font-medium">{fromAsset}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwapAssets}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className={toAssetInfo?.color}>
                        {toAssetInfo?.icon}
                      </span>
                      <span className="font-medium">{toAsset}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <input
                    type="number"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Exchange Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  1 {fromAsset} = {currentRate.toFixed(6)} {toAsset}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Price Impact</span>
                <span className="text-sm font-semibold text-green-600">+0.12%</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Network Fee</span>
                <span className="text-sm font-semibold text-gray-900">{fee.toFixed(6)} WATT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Minimum Received</span>
                <span className="text-sm font-semibold text-gray-900">
                  {toAmount ? (parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6) : '0.00'} {toAsset}
                </span>
              </div>
            </div>

            <button
              onClick={handleSwap}
              disabled={!fromAmount || !toAmount || isLoading}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Swap Assets'
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Market Overview</h3>
            <div className="space-y-3">
              {energyAssets.slice(0, 6).map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={asset.color}>{asset.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{asset.symbol}</p>
                      <p className="text-xs text-gray-500">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${asset.price}</p>
                    <p className={`text-xs ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>WATT → SOLAR: 1,250 WATT</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>SOLAR → WIND: 850 SOLAR</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>WIND → WATT: 2,100 WIND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
