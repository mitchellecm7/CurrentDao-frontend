'use client'

import React, { useState, useEffect } from 'react'
import { 
  PieChart, 
  Plus, 
  Minus, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Sun, 
  Wind, 
  Droplet, 
  Flame, 
  Leaf,
  Info,
  Settings,
  ChevronUp,
  ChevronDown,
  Wallet,
  Award,
  Activity,
  Building,
  Globe,
  Shield,
  Clock,
  BarChart3
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

interface TokenizedAsset {
  id: string
  name: string
  description: string
  assetType: EnergyAssetType
  totalSupply: number
  availableSupply: number
  pricePerToken: number
  marketCap: number
  myHoldings: number
  myHoldingsValue: number
  dividends: {
    token: EnergyAssetType
    apr: number
    frequency: 'daily' | 'weekly' | 'monthly'
  }
  metadata: {
    location: string
    capacity: number
    efficiency: number
    certification: string
    carbonOffset: number
  }
  isActive: boolean
  createdAt: number
}

interface FractionalOwnership {
  assetId: string
  shares: number
  percentageOwned: number
  value: number
  dividendsEarned: number
  lastDividendClaim: number
  votingPower: number
}

export function AssetTokenization() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'portfolio'>('marketplace')
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [buyAmount, setBuyAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('')
  const [sellPercentage, setSellPercentage] = useState('100')
  
  const {
    tokenizedAssets,
    userHoldings,
    isLoading,
    buyTokens,
    sellTokens,
    claimDividends,
    createTokenizedAsset,
    calculateOwnership,
    getAssetMetadata
  } = useEnergyExchange()

  const mockTokenizedAssets: TokenizedAsset[] = [
    {
      id: 'solar-farm-alpha',
      name: 'Solar Farm Alpha',
      description: '50MW solar farm in Arizona with advanced photovoltaic technology',
      assetType: 'SOLAR',
      totalSupply: 10000000,
      availableSupply: 2500000,
      pricePerToken: 0.85,
      marketCap: 8500000,
      myHoldings: 125000,
      myHoldingsValue: 106250,
      dividends: {
        token: 'WATT',
        apr: 8.5,
        frequency: 'monthly'
      },
      metadata: {
        location: 'Arizona, USA',
        capacity: 50,
        efficiency: 92.5,
        certification: 'ISO-14001, Green-E',
        carbonOffset: 45000
      },
      isActive: true,
      createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000
    },
    {
      id: 'wind-turbine-beta',
      name: 'Wind Turbine Beta',
      description: 'Offshore wind farm with 30 turbines generating clean energy',
      assetType: 'WIND',
      totalSupply: 15000000,
      availableSupply: 3200000,
      pricePerToken: 0.72,
      marketCap: 10800000,
      myHoldings: 85000,
      myHoldingsValue: 61200,
      dividends: {
        token: 'WATT',
        apr: 9.2,
        frequency: 'monthly'
      },
      metadata: {
        location: 'North Sea, Europe',
        capacity: 120,
        efficiency: 88.3,
        certification: 'ISO-14001',
        carbonOffset: 78000
      },
      isActive: true,
      createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000
    },
    {
      id: 'hydro-delta',
      name: 'Hydro Delta Project',
      description: 'Hydroelectric power plant with 200MW capacity',
      assetType: 'HYDRO',
      totalSupply: 20000000,
      availableSupply: 5000000,
      pricePerToken: 0.68,
      marketCap: 13600000,
      myHoldings: 0,
      myHoldingsValue: 0,
      dividends: {
        token: 'WATT',
        apr: 7.8,
        frequency: 'weekly'
      },
      metadata: {
        location: 'Columbia River, USA',
        capacity: 200,
        efficiency: 94.2,
        certification: 'ISO-14001',
        carbonOffset: 120000
      },
      isActive: true,
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000
    },
    {
      id: 'geothermal-gamma',
      name: 'Geothermal Gamma',
      description: 'Geothermal energy plant with consistent baseload power',
      assetType: 'GEOTHERMAL',
      totalSupply: 8000000,
      availableSupply: 1800000,
      pricePerToken: 0.95,
      marketCap: 7600000,
      myHoldings: 45000,
      myHoldingsValue: 42750,
      dividends: {
        token: 'WATT',
        apr: 10.5,
        frequency: 'monthly'
      },
      metadata: {
        location: 'Iceland',
        capacity: 75,
        efficiency: 96.8,
        certification: 'ISO-14001',
        carbonOffset: 35000
      },
      isActive: true,
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000
    },
    {
      id: 'carbon-offset-fund',
      name: 'Carbon Offset Fund',
      description: 'Tokenized carbon credits from reforestation projects',
      assetType: 'CARBON_CREDITS',
      totalSupply: 5000000,
      availableSupply: 1200000,
      pricePerToken: 1.25,
      marketCap: 6250000,
      myHoldings: 25000,
      myHoldingsValue: 31250,
      dividends: {
        token: 'CARBON_CREDITS',
        apr: 12.3,
        frequency: 'quarterly'
      },
      metadata: {
        location: 'Global',
        capacity: 0,
        efficiency: 0,
        certification: 'Verified Carbon Standard',
        carbonOffset: 250000
      },
      isActive: true,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000
    }
  ]

  const mockHoldings: FractionalOwnership[] = [
    {
      assetId: 'solar-farm-alpha',
      shares: 125000,
      percentageOwned: 1.25,
      value: 106250,
      dividendsEarned: 8925,
      lastDividendClaim: Date.now() - 15 * 24 * 60 * 60 * 1000,
      votingPower: 125
    },
    {
      assetId: 'wind-turbine-beta',
      shares: 85000,
      percentageOwned: 0.57,
      value: 61200,
      dividendsEarned: 5628,
      lastDividendClaim: Date.now() - 20 * 24 * 60 * 60 * 1000,
      votingPower: 85
    },
    {
      assetId: 'geothermal-gamma',
      shares: 45000,
      percentageOwned: 0.56,
      value: 42750,
      dividendsEarned: 4489,
      lastDividendClaim: Date.now() - 25 * 24 * 60 * 60 * 1000,
      votingPower: 45
    },
    {
      assetId: 'carbon-offset-fund',
      shares: 25000,
      percentageOwned: 0.5,
      value: 31250,
      dividendsEarned: 3844,
      lastDividendClaim: Date.now() - 10 * 24 * 60 * 60 * 1000,
      votingPower: 25
    }
  ]

  const getAssetById = (id: string) => mockTokenizedAssets.find(asset => asset.id === id)

  const getTokenIcon = (token: EnergyAssetType) => {
    const icons = {
      'WATT': <Zap className="w-4 h-4" />,
      'SOLAR': <Sun className="w-4 h-4" />,
      'WIND': <Wind className="w-4 h-4" />,
      'HYDRO': <Droplet className="w-4 h-4" />,
      'GEOTHERMAL': <Flame className="w-4 h-4" />,
      'BIOMASS': <Leaf className="w-4 h-4" />,
      'NATURAL_GAS': <Flame className="w-4 h-4" />,
      'COAL': <Flame className="w-4 h-4" />,
      'NUCLEAR': <Zap className="w-4 h-4" />,
      'CARBON_CREDITS': <Leaf className="w-4 h-4" />
    }
    return icons[token] || <Zap className="w-4 h-4" />
  }

  const handleBuy = async () => {
    if (!selectedAsset || !buyAmount) {
      toast.error('Please enter a valid buy amount')
      return
    }

    try {
      await buyTokens({
        assetId: selectedAsset,
        amount: parseFloat(buyAmount)
      })
      
      toast.success('Tokens purchased successfully')
      setShowBuyModal(false)
      setBuyAmount('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Purchase failed')
    }
  }

  const handleSell = async () => {
    if (!selectedAsset || !sellAmount) {
      toast.error('Please enter a valid sell amount')
      return
    }

    try {
      await sellTokens({
        assetId: selectedAsset,
        amount: parseFloat(sellAmount),
        percentage: parseFloat(sellPercentage)
      })
      
      toast.success('Tokens sold successfully')
      setShowSellModal(false)
      setSellAmount('')
      setSellPercentage('100')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sale failed')
    }
  }

  const handleClaimDividends = async (assetId: string) => {
    try {
      await claimDividends(assetId)
      toast.success('Dividends claimed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to claim dividends')
    }
  }

  const totalPortfolioValue = mockHoldings.reduce((sum, holding) => sum + holding.value, 0)
  const totalDividendsEarned = mockHoldings.reduce((sum, holding) => sum + holding.dividendsEarned, 0)
  const totalVotingPower = mockHoldings.reduce((sum, holding) => sum + holding.votingPower, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <PieChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asset Tokenization</h2>
            <p className="text-sm text-gray-600">Fractional ownership of energy assets down to 0.001%</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Portfolio Value</p>
            <p className="text-xl font-bold text-gray-900">${totalPortfolioValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Dividends Earned</p>
            <p className="text-xl font-bold text-green-600">${totalDividendsEarned.toLocaleString()}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Create Asset
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'marketplace' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Marketplace ({mockTokenizedAssets.filter(a => a.isActive).length})
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'portfolio' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Portfolio ({mockHoldings.length})
        </button>
      </div>

      {activeTab === 'marketplace' ? (
        <div className="space-y-4">
          {mockTokenizedAssets.map((asset) => (
            <div key={asset.id} className={`bg-gray-50 rounded-lg p-4 ${!asset.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    {getTokenIcon(asset.assetType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-600">{asset.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {asset.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {asset.metadata.location}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                        {asset.metadata.capacity}MW
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Token Price</p>
                    <p className="font-semibold text-gray-900">${asset.pricePerToken}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Market Cap</p>
                    <p className="font-semibold text-gray-900">${(asset.marketCap / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Dividend APR</p>
                    <p className="font-semibold text-green-600">{asset.dividends.apr}%</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAsset(asset.id)
                      setShowBuyModal(true)
                    }}
                    disabled={!asset.isActive}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Buy Tokens
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Available Supply</p>
                  <p className="font-medium text-gray-900">
                    {(asset.availableSupply / 1000000).toFixed(1)}M / {(asset.totalSupply / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">My Holdings</p>
                  <p className="font-medium text-gray-900">
                    {asset.myHoldings.toLocaleString()} ({((asset.myHoldings / asset.totalSupply) * 100).toFixed(3)}%)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Efficiency</p>
                  <p className="font-medium text-gray-900">{asset.metadata.efficiency}%</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Carbon Offset</p>
                  <p className="font-medium text-gray-900">{(asset.metadata.carbonOffset / 1000).toFixed(0)}K tons/year</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {mockHoldings.map((holding) => {
            const asset = getAssetById(holding.assetId)
            return (
              <div key={holding.assetId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      {getTokenIcon(asset?.assetType || 'WATT')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{asset?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {holding.percentageOwned.toFixed(3)}% ownership • {holding.votingPower} voting power
                      </p>
                      <p className="text-xs text-orange-600">
                        Last dividend: {new Date(holding.lastDividendClaim).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Shares</p>
                      <p className="font-semibold text-gray-900">{holding.shares.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="font-semibold text-gray-900">${holding.value.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Dividends</p>
                      <p className="font-semibold text-green-600">${holding.dividendsEarned.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaimDividends(holding.assetId)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Claim
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAsset(holding.assetId)
                          setShowSellModal(true)
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Asset Performance</p>
                    <p className="font-medium text-gray-900">
                      APR: {asset?.dividends.apr}% ({asset?.dividends.frequency})
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Asset Details</p>
                    <p className="font-medium text-gray-900">
                      {asset?.metadata.capacity}MW • {asset?.metadata.efficiency}% efficiency
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Environmental Impact</p>
                    <p className="font-medium text-gray-900">
                      {(asset?.metadata.carbonOffset / 1000).toFixed(0)}K tons CO₂ offset/year
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Buy {getAssetById(selectedAsset)?.name} Tokens</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tokens
                </label>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Purchase Summary</p>
                <p className="text-sm font-medium text-gray-900">
                  Tokens: {buyAmount || '0'}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Cost: ${((parseFloat(buyAmount || '0') * (getAssetById(selectedAsset)?.pricePerToken || 0))).toFixed(2)}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Ownership: {(((parseFloat(buyAmount || '0') / (getAssetById(selectedAsset)?.totalSupply || 1)) * 100).toFixed(6))}%
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBuy}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Buy Tokens
                </button>
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sell {getAssetById(selectedAsset)?.name} Tokens</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tokens
                </label>
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage ({sellPercentage}%)
                </label>
                <input
                  type="range"
                  value={sellPercentage}
                  onChange={(e) => setSellPercentage(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sale Summary</p>
                <p className="text-sm font-medium text-gray-900">
                  Tokens: {sellAmount || '0'}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Proceeds: ${((parseFloat(sellAmount || '0') * (getAssetById(selectedAsset)?.pricePerToken || 0))).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSell}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sell Tokens
                </button>
                <button
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Tokenized Asset</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                  <input
                    type="text"
                    placeholder="Enter asset name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="SOLAR">Solar</option>
                    <option value="WIND">Wind</option>
                    <option value="HYDRO">Hydro</option>
                    <option value="GEOTHERMAL">Geothermal</option>
                    <option value="CARBON_CREDITS">Carbon Credits</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe your energy asset"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Supply</label>
                  <input
                    type="number"
                    placeholder="10000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Token ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dividend APR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="8.0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toast.success('Asset creation submitted for review')
                    setShowCreateModal(false)
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create Asset
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
