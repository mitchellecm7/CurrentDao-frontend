import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  TransactionHistoryProps, 
  StellarTransaction, 
  StellarOperation 
} from '@/types/wallet';
import { formatAddress, formatBalance } from '@/lib/stellar';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading = false,
  error = null,
  className = '',
  maxItems = 10,
  showLoadMore = false,
  onLoadMore,
}) => {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const getOperationIcon = (operation: StellarOperation) => {
    switch (operation.type) {
      case 'payment':
        if (operation.from === operation.to) return null; // Self payment
        
        // Check if it's incoming or outgoing based on account comparison
        // This would need the current wallet address to determine direction
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      
      case 'create_account':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      
      case 'set_options':
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
      
      case 'change_trust':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      
      case 'manage_sell_offer':
      case 'manage_buy_offer':
        return <ArrowUpRight className="w-4 h-4 text-orange-600" />;
      
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOperationDescription = (operation: StellarOperation) => {
    switch (operation.type) {
      case 'payment':
        const asset = operation.asset_code || 'XLM';
        const amount = formatBalance(operation.amount || '0');
        return `${asset} ${amount}`;
      
      case 'create_account':
        return 'Account Created';
      
      case 'set_options':
        return 'Account Options Updated';
      
      case 'change_trust':
        const trustAsset = operation.asset_code || 'Unknown';
        return `Trust Line Added: ${trustAsset}`;
      
      case 'manage_sell_offer':
        return 'Sell Offer Created';
      
      case 'manage_buy_offer':
        return 'Buy Offer Created';
      
      default:
        return operation.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
  };

  const getStatusIcon = (successful: boolean) => {
    if (successful) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const toggleExpanded = (txId: string) => {
    setExpandedTx(expandedTx === txId ? null : txId);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatFee = (fee: string) => {
    const feeNum = parseFloat(fee);
    return feeNum > 0 ? `${feeNum.toFixed(7)} XLM` : '0 XLM';
  };

  const displayedTransactions = transactions.slice(0, maxItems);

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Transactions
          </h3>
          <p className="text-sm text-gray-600 text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Transaction History
        </h2>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {transactions.length} transactions
          </span>
          
          {onLoadMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && displayedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-gray-600">Loading transactions...</p>
        </div>
      ) : (
        /* Transactions List */
        <div className="divide-y divide-gray-100">
          {displayedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Transactions
              </h3>
              <p className="text-sm text-gray-600">
                Your transaction history will appear here once you start trading energy.
              </p>
            </div>
          ) : (
            displayedTransactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Transaction Header */}
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(tx.successful)}
                      
                      <div>
                        <p className="font-medium text-gray-900">
                          {tx.memo || 'No Memo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(tx.id)}
                      className="p-1"
                    >
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedTx === tx.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Button>
                  </div>

                  {/* Transaction Fee */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Fee</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatFee(tx.fee_paid)}
                    </p>
                  </div>
                </div>

                {/* Expanded Operations */}
                {expandedTx === tx.id && (
                  <div className="mt-4 pl-7 border-l-2 border-gray-200">
                    <div className="space-y-3">
                      {tx.operations.map((operation, index) => (
                        <div key={operation.id} className="flex items-center gap-3">
                          {getOperationIcon(operation)}
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {getOperationDescription(operation)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {operation.from && operation.to && (
                                <>
                                  {formatAddress(operation.from)} → {formatAddress(operation.to)}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transaction Hash */}
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-mono">
                    TX: {formatAddress(tx.hash, false)}
                  </p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(
                      `https://stellar.expert/explorer/tx/${tx.hash}`,
                      '_blank'
                    )}
                    className="p-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )
        )}
      </div>
      )}

      {/* Load More */}
      {showLoadMore && transactions.length > maxItems && (
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More Transactions
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
