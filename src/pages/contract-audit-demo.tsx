'use client'

import { useState, useEffect } from 'react'
import { SmartContractAuditTrail } from '@/components/audit/SmartContractAuditTrail'

// Mock contract address for demo
const MOCK_CONTRACT_ADDRESS = 'GD5WDJGYFJRYXQD5K2QF5EJZ5Y3YV2X2Z3Q4R5T6Y7U8I9O0P1Q2R3S4T5U6V7W8'

export default function ContractAuditDemo() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Contract Audit Trail Demo
          </h1>
          <p className="text-gray-600">
            Comprehensive audit tracking and verification for smart contracts
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Demo Contract</h2>
            <div className="font-mono text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {MOCK_CONTRACT_ADDRESS}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This is a demonstration of the smart contract audit trail feature using mock data.
            </p>
          </div>
        </div>

        <SmartContractAuditTrail 
          contractAddress={MOCK_CONTRACT_ADDRESS}
          showAlerts={true}
          showDiff={true}
        />
      </div>
    </div>
  )
}
