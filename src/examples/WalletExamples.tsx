import React, { useState } from 'react';
import { 
  WalletConnector, 
  WalletModal, 
  TransactionHistory, 
  BalanceDisplay 
} from '@/components/wallet';
import { useStellarWallet, useWalletInfo } from '@/hooks/useStellarWallet';
import { Button } from '@/components/ui/Button';

export const WalletExamples: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { state } = useStellarWallet();
  const walletInfo = useWalletInfo();

  const handleWalletSelect = async (walletType: 'freighter' | 'albedo') => {
    // The actual connection is handled by the WalletConnector component
    // This is just for demonstration
    console.log(`Selected wallet: ${walletType}`);
    setShowModal(false);
  };

  const sampleTransactions = [
    {
      id: '1',
      hash: 'abc123def456',
      successful: true,
      source_account: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
      created_at: '2024-01-15T10:30:00Z',
      transaction_envelope: 'xdr...',
      memo: 'Energy purchase - Solar Panel #123',
      operations: [
        {
          id: '1',
          type: 'payment',
          source_account: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
          created_at: '2024-01-15T10:30:00Z',
          transaction_hash: 'abc123def456',
          asset_code: 'WATT',
          amount: '500',
          from: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
          to: 'GD7YEH...ABC',
        },
      ],
      fee_paid: '100',
      fee_charged: '100',
    },
    {
      id: '2',
      hash: 'def789ghi012',
      successful: true,
      source_account: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
      created_at: '2024-01-14T15:45:00Z',
      transaction_envelope: 'xdr...',
      memo: 'Energy sale - Wind Energy #456',
      operations: [
        {
          id: '2',
          type: 'payment',
          source_account: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
          created_at: '2024-01-14T15:45:00Z',
          transaction_hash: 'def789ghi012',
          asset_code: 'WATT',
          amount: '250',
          from: 'GD7YEH...ABC',
          to: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
        },
      ],
      fee_paid: '100',
      fee_charged: '100',
    },
  ];

  const sampleBalance = [
    { asset_code: 'WATT', balance: '1250.75', asset_type: 'credit_alphanum4' },
    { asset_code: 'XLM', balance: '45.50', asset_type: 'native' },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Stellar Wallet Integration Examples
        </h1>

        {/* Basic Wallet Connector */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Wallet Connector
          </h2>
          <p className="text-gray-600 mb-6">
            Complete wallet interface with connection, balance display, and transaction history.
          </p>
          <WalletConnector 
            onConnect={(wallet) => console.log('Wallet connected:', wallet)}
            onDisconnect={() => console.log('Wallet disconnected')}
          />
        </div>

        {/* Standalone Wallet Modal */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Standalone Wallet Modal
          </h2>
          <p className="text-gray-600 mb-6">
            Custom wallet selection modal with enhanced UX.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => setShowModal(true)}>
              Open Wallet Modal
            </Button>
          </div>
          
          <WalletModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onWalletSelect={handleWalletSelect}
          />
        </div>

        {/* Balance Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Advanced Balance Display
          </h2>
          <p className="text-gray-600 mb-6">
            Portfolio overview with multiple assets, balance changes, and detailed information.
          </p>
          <BalanceDisplay 
            balance={sampleBalance}
            showAssetDetails={true}
          />
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Transaction History Component
          </h2>
          <p className="text-gray-600 mb-6">
            Complete transaction history with expandable details and operation breakdown.
          </p>
          <TransactionHistory 
            transactions={sampleTransactions}
            maxItems={5}
            showLoadMore={true}
            onLoadMore={() => console.log('Load more transactions')}
          />
        </div>

        {/* Current Wallet State */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Wallet State
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Connected:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                walletInfo?.isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {walletInfo?.isConnected ? 'Yes' : 'No'}
              </span>
            </div>
            
            {walletInfo && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Wallet:</span>
                  <span className="text-gray-900">{walletInfo.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Network:</span>
                  <span className="text-gray-900">{walletInfo.network}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {walletInfo.publicKey.slice(0, 10)}...{walletInfo.publicKey.slice(-4)}
                  </code>
                </div>
              </>
            )}
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Loading:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                state.isLoading 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {state.isLoading ? 'Yes' : 'No'}
              </span>
            </div>
            
            {state.error && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Error:</span>
                <span className="text-red-600">{state.error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Integration Instructions
          </h2>
          <div className="space-y-4 text-sm text-blue-800">
            <p>
              <strong>1. Provider Setup:</strong> The WalletProvider is already configured in app/providers.tsx
            </p>
            <p>
              <strong>2. Import Components:</strong> Use the centralized import from @/components/wallet
            </p>
            <p>
              <strong>3. Hook Usage:</strong> Access wallet state and operations via useStellarWallet()
            </p>
            <p>
              <strong>4. Network Configuration:</strong> Update between testnet and mainnet as needed
            </p>
            <p>
              <strong>5. Error Handling:</strong> All components include comprehensive error handling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletExamples;
