'use client'

import React from 'react'
import { Transaction } from '@/types/explorer'
import { 
  getBlockchainExplorerUrl, 
  getTransactionTypeLabel, 
  getStatusColor,
  formatTransactionAmount 
} from '@/utils/explorerHelpers'
import { 
  ExternalLink, 
  Copy, 
  Clock, 
  User, 
  ArrowRightLeft, 
  Coins,
  FileText,
  Settings
} from 'lucide-react'

interface TransactionDetailsProps {
  transaction: Transaction
  onClose?: () => void
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
  transaction, 
  onClose 
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const explorerUrl = getBlockchainExplorerUrl(transaction.stellarTransactionId, transaction.network)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Transaction Details</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Transaction Overview */}
      <div className="space-y-4 mb-6">
        {/* Status and Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
            <span className="text-gray-600">
              {getTransactionTypeLabel(transaction.type)}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(transaction.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Coins className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Amount</span>
          </div>
          <div className="text-lg font-semibold">
            {formatTransactionAmount(transaction.amount, transaction.asset.code)}
          </div>
        </div>

        {/* Fee */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">Fee</span>
          </div>
          <span className="font-medium">{transaction.fee} stroops</span>
        </div>
      </div>

      {/* Transaction IDs */}
      <div className="space-y-3 mb-6">
        <h4 className="text-md font-medium text-gray-700">Transaction Information</h4>
        
        {/* Stellar Transaction ID */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Stellar Transaction ID</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(transaction.stellarTransactionId)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="font-mono text-sm break-all">
            {transaction.stellarTransactionId}
          </div>
        </div>

        {/* Hash */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Transaction Hash</span>
            <button
              onClick={() => copyToClipboard(transaction.hash)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="font-mono text-sm break-all">
            {transaction.hash}
          </div>
        </div>

        {/* Memo */}
        {transaction.memo && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-1">
              <FileText className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Memo</span>
            </div>
            <div className="text-sm">{transaction.memo}</div>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="space-y-3 mb-6">
        <h4 className="text-md font-medium text-gray-700">Participants</h4>
        
        {/* From */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-1">
            <User className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">From</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-mono text-sm break-all mr-2">
              {transaction.from}
            </div>
            <button
              onClick={() => copyToClipboard(transaction.from)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* To */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-1">
            <ArrowRightLeft className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">To</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-mono text-sm break-all mr-2">
              {transaction.to}
            </div>
            <button
              onClick={() => copyToClipboard(transaction.to)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="space-y-3 mb-6">
        <h4 className="text-md font-medium text-gray-700">
          Operations ({transaction.operations.length})
        </h4>
        
        <div className="space-y-2">
          {transaction.operations.map((operation, index) => (
            <div key={operation.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {operation.type.replace('_', ' ').charAt(0).toUpperCase() + 
                   operation.type.replace('_', ' ').slice(1)}
                </span>
                <span className="text-xs text-gray-500">#{index + 1}</span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                {operation.sourceAccount && (
                  <div>
                    <span className="font-medium">Source:</span>{' '}
                    <span className="font-mono text-xs">
                      {operation.sourceAccount.substring(0, 16)}...
                    </span>
                  </div>
                )}
                
                {operation.amount && operation.asset && (
                  <div>
                    <span className="font-medium">Amount:</span>{' '}
                    {formatTransactionAmount(operation.amount, operation.asset.code)}
                  </div>
                )}
                
                {operation.destination && (
                  <div>
                    <span className="font-medium">Destination:</span>{' '}
                    <span className="font-mono text-xs">
                      {operation.destination.substring(0, 16)}...
                    </span>
                  </div>
                )}
                
                {operation.price && (
                  <div>
                    <span className="font-medium">Price:</span> {operation.price}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-700">Additional Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Network:</span>
            <span className="ml-2 font-medium capitalize">{transaction.network}</span>
          </div>
          
          {transaction.blockHeight && (
            <div>
              <span className="text-gray-600">Block Height:</span>
              <span className="ml-2 font-medium">{transaction.blockHeight}</span>
            </div>
          )}
          
          {transaction.ledgerSequence && (
            <div>
              <span className="text-gray-600">Ledger Sequence:</span>
              <span className="ml-2 font-medium">{transaction.ledgerSequence}</span>
            </div>
          )}
          
          <div>
            <span className="text-gray-600">Asset:</span>
            <span className="ml-2 font-medium">
              {transaction.asset.code}
              {transaction.asset.issuer && (
                <span className="text-xs text-gray-500 ml-1">
                  (Issuer: {transaction.asset.issuer.substring(0, 8)}...)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Metadata */}
        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Metadata</h5>
            <div className="p-3 bg-gray-50 rounded-lg">
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(transaction.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
