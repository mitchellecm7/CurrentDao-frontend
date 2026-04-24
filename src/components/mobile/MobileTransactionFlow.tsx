'use client'

import React, { useState, useEffect } from 'react'

interface MobileTransactionFlowProps {
  walletAddress: string
  balance: number
  onBack: () => void
  onTransactionComplete?: (transaction: any) => void
}

type TransactionType = 'send' | 'receive' | 'trade' | 'history'
type FlowStep = 'home' | 'send' | 'receive' | 'trade' | 'scanner'

interface TransactionData {
  type: TransactionType
  recipient?: string
  amount: string
  memo?: string
  energyType?: string
}

export const MobileTransactionFlow: React.FC<MobileTransactionFlowProps> = ({
  walletAddress,
  balance,
  onBack,
  onTransactionComplete
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('home')
  const [transactionData, setTransactionData] = useState<TransactionData>({
    type: 'send',
    amount: '',
    recipient: '',
    memo: '',
    energyType: 'solar'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])

  const mockTransactions = [
    {
      id: '1',
      type: 'receive',
      amount: '0.5 XLM',
      from: 'GABC...',
      date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'completed'
    },
    {
      id: '2',
      type: 'send',
      amount: '0.2 XLM',
      to: 'GXYZ...',
      date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'completed'
    },
    {
      id: '3',
      type: 'trade',
      amount: '10 kWh',
      energyType: 'solar',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'completed'
    }
  ]

  useEffect(() => {
    setTransactions(mockTransactions)
  }, [])

  const handleQuickAction = (action: TransactionType) => {
    setTransactionData(prev => ({ ...prev, type: action }))
    
    switch (action) {
      case 'send':
        setCurrentStep('send')
        break
      case 'receive':
        setCurrentStep('receive')
        break
      case 'trade':
        setCurrentStep('trade')
        break
      case 'history':
        setCurrentStep('home')
        break
    }
  }

  const handleConfirmTransaction = async () => {
    setIsProcessing(true)
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newTransaction = {
      id: Date.now().toString(),
      type: transactionData.type,
      amount: transactionData.amount + ' XLM',
      to: transactionData.recipient,
      date: new Date().toISOString(),
      status: 'completed'
    }
    
    setTransactions(prev => [newTransaction, ...prev])
    setIsProcessing(false)
    
    onTransactionComplete?.(newTransaction)
    setCurrentStep('home')
    
    // Reset form
    setTransactionData({
      type: 'send',
      amount: '',
      recipient: '',
      memo: '',
      energyType: 'solar'
    })
  }

  const renderHomeStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90 mb-2">Available Balance</p>
        <h3 className="text-3xl font-bold mb-1">
          {balance.toFixed(2)} <span className="text-lg font-normal">XLM</span>
        </h3>
        <p className="text-sm opacity-90">${(balance * 0.13).toFixed(2)} USD</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleQuickAction('send')}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="text-2xl mb-2">📤</div>
          <span className="text-sm font-medium text-gray-700">Send</span>
        </button>
        
        <button
          onClick={() => handleQuickAction('receive')}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="text-2xl mb-2">📥</div>
          <span className="text-sm font-medium text-gray-700">Receive</span>
        </button>
        
        <button
          onClick={() => handleQuickAction('trade')}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="text-2xl mb-2">⚡</div>
          <span className="text-sm font-medium text-gray-700">Trade Energy</span>
        </button>
        
        <button
          onClick={() => setCurrentStep('scanner')}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="text-2xl mb-2">📷</div>
          <span className="text-sm font-medium text-gray-700">Scan QR</span>
        </button>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Transactions</h4>
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-blue-500 transition-all">
              <div>
                <span className={`text-xs font-medium ${
                  tx.type === 'send' ? 'text-red-600' :
                  tx.type === 'receive' ? 'text-green-600' :
                  'text-blue-600'
                }`}>
                  {tx.type === 'send' ? 'SENT' : tx.type === 'receive' ? 'RECEIVED' : 'ENERGY TRADE'}
                </span>
                <p className={`font-semibold mt-1 ${
                  tx.type === 'send' ? 'text-red-600' :
                  tx.type === 'receive' ? 'text-green-600' :
                  'text-gray-900'
                }`}>
                  {tx.amount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(tx.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSendStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
        <input
          type="text"
          placeholder="G..."
          value={transactionData.recipient}
          onChange={(e) => setTransactionData(prev => ({
            ...prev,
            recipient: e.target.value
          }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (XLM)</label>
        <input
          type="number"
          placeholder="0.00"
          value={transactionData.amount}
          onChange={(e) => setTransactionData(prev => ({
            ...prev,
            amount: e.target.value
          }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Memo (Optional)</label>
        <textarea
          placeholder="Add a note..."
          value={transactionData.memo}
          onChange={(e) => setTransactionData(prev => ({
            ...prev,
            memo: e.target.value
          }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
        />
      </div>

      <button
        onClick={handleConfirmTransaction}
        disabled={!transactionData.recipient || !transactionData.amount || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
        ) : 'Send XLM'}
      </button>

      <button
        onClick={() => setCurrentStep('scanner')}
        className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
      >
        Scan QR Code
      </button>

      <button
        onClick={() => setCurrentStep('home')}
        className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
      >
        Cancel
      </button>
    </div>
  )

  const renderReceiveStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          readOnly
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
        />
      </div>

      <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Copy Address
      </button>

      <button className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
        Share QR Code
      </button>

      <button
        onClick={() => setCurrentStep('home')}
        className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
      >
        Back
      </button>
    </div>
  )

  const renderTradeStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Energy Type</label>
        <select
          value={transactionData.energyType}
          onChange={(e) => setTransactionData(prev => ({
            ...prev,
            energyType: e.target.value
          }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="solar">Solar</option>
          <option value="wind">Wind</option>
          <option value="hydro">Hydro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (kWh)</label>
        <input
          type="number"
          placeholder="0"
          value={transactionData.amount}
          onChange={(e) => setTransactionData(prev => ({
            ...prev,
            amount: e.target.value
          }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        onClick={handleConfirmTransaction}
        disabled={!transactionData.amount || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
        ) : 'Trade Energy'}
      </button>

      <button
        onClick={() => setCurrentStep('home')}
        className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
      >
        Cancel
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white/95 backdrop-blur-sm min-h-screen">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-white">
            {currentStep === 'home' ? 'Wallet' :
             currentStep === 'send' ? 'Send' :
             currentStep === 'receive' ? 'Receive' :
             currentStep === 'trade' ? 'Trade Energy' :
             'Scan QR'}
          </h2>
          <div className="w-11 h-11"></div>
        </div>

        <div className="p-4">
          {currentStep === 'home' && renderHomeStep()}
          {currentStep === 'send' && renderSendStep()}
          {currentStep === 'receive' && renderReceiveStep()}
          {currentStep === 'trade' && renderTradeStep()}
        </div>
      </div>
    </div>
  )
}
