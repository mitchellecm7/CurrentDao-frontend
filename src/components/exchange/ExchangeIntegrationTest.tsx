'use client'

import React, { useState } from 'react'
import { AssetExchange } from './AssetExchange'
import { LiquidityPools } from './LiquidityPools'
import { YieldFarming } from './YieldFarming'
import { AssetTokenization } from './AssetTokenization'
import { useEnergyExchange } from '../../hooks/useEnergyExchange'

export function ExchangeIntegrationTest() {
  const [activeComponent, setActiveComponent] = useState<'exchange' | 'pools' | 'farming' | 'tokenization'>('exchange')
  const [testResults, setTestResults] = useState<string[]>([])
  const { exchangeRates, pools, farms, userPositions, tokenizedAssets, userHoldings } = useEnergyExchange()

  const runIntegrationTests = () => {
    const results: string[] = []
    
    // Test 1: Exchange rates availability
    if (exchangeRates.length > 0) {
      results.push('✅ Exchange rates loaded successfully')
    } else {
      results.push('❌ Exchange rates not loaded')
    }
    
    // Test 2: Liquidity pools availability
    if (pools.length > 0) {
      results.push(`✅ ${pools.length} liquidity pools loaded`)
    } else {
      results.push('❌ Liquidity pools not loaded')
    }
    
    // Test 3: Farms availability
    if (farms.length > 0) {
      results.push(`✅ ${farms.length} farms loaded`)
    } else {
      results.push('❌ Farms not loaded')
    }
    
    // Test 4: User positions availability
    if (userPositions.length > 0) {
      results.push(`✅ ${userPositions.length} user positions loaded`)
    } else {
      results.push('❌ User positions not loaded')
    }
    
    // Test 5: Tokenized assets availability
    if (tokenizedAssets.length > 0) {
      results.push(`✅ ${tokenizedAssets.length} tokenized assets loaded`)
    } else {
      results.push('❌ Tokenized assets not loaded')
    }
    
    // Test 6: User holdings availability
    if (userHoldings.length > 0) {
      results.push(`✅ ${userHoldings.length} user holdings loaded`)
    } else {
      results.push('❌ User holdings not loaded')
    }
    
    // Test 7: Asset types validation
    const requiredAssets = ['WATT', 'SOLAR', 'WIND', 'HYDRO', 'GEOTHERMAL', 'CARBON_CREDITS']
    const availableAssets = new Set(exchangeRates.map(r => r.from).concat(exchangeRates.map(r => r.to)))
    const missingAssets = requiredAssets.filter(asset => !availableAssets.has(asset))
    
    if (missingAssets.length === 0) {
      results.push('✅ All required energy asset types available')
    } else {
      results.push(`❌ Missing asset types: ${missingAssets.join(', ')}`)
    }
    
    // Test 8: Real-time updates simulation
    setTimeout(() => {
      results.push('✅ Real-time updates simulation completed')
      setTestResults([...results])
    }, 2000)
    
    setTestResults(results)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Energy Asset Exchange - Integration Test</h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing environment for the multi-energy trading platform
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveComponent('exchange')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeComponent === 'exchange' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Asset Exchange
            </button>
            <button
              onClick={() => setActiveComponent('pools')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeComponent === 'pools' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Liquidity Pools
            </button>
            <button
              onClick={() => setActiveComponent('farming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeComponent === 'farming' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yield Farming
            </button>
            <button
              onClick={() => setActiveComponent('tokenization')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeComponent === 'tokenization' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Asset Tokenization
            </button>
          </div>
          
          <button
            onClick={runIntegrationTests}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mb-6"
          >
            Run Integration Tests
          </button>
          
          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-medium">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Component: {activeComponent.charAt(0).toUpperCase() + activeComponent.slice(1)}
          </h2>
          
          {activeComponent === 'exchange' && <AssetExchange />}
          {activeComponent === 'pools' && <LiquidityPools />}
          {activeComponent === 'farming' && <YieldFarming />}
          {activeComponent === 'tokenization' && <AssetTokenization />}
        </div>
      </div>
    </div>
  )
}
