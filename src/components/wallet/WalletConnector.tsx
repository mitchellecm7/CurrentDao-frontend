import React, { useState } from 'react';
import { Wallet, WalletInfo, WalletConnectorProps } from '@/types/wallet';
import { useStellarWallet, useWalletAvailability, useWalletInfo, useWalletBalance } from '@/hooks/useStellarWallet';
import { formatAddress } from '@/lib/stellar';
import { Button } from '@/components/ui/Button';
import { Copy, ExternalLink, RefreshCw, Wallet as WalletIcon } from 'lucide-react';

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  onConnect,
  onDisconnect,
  className = '',
  showBalance = true,
  showTransactions = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  const { connectWallet, disconnectWallet, state } = useStellarWallet();
  const { freighterAvailable, albedoAvailable } = useWalletAvailability();
  const walletInfo = useWalletInfo();
  const { balance, isLoading: balanceLoading } = useWalletBalance();

  const handleConnect = async (walletType: 'freighter' | 'albedo') => {
    try {
      await connectWallet(walletType);
      setShowModal(false);
      onConnect?.(walletInfo!);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      onDisconnect?.();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const copyAddress = async () => {
    if (walletInfo?.publicKey) {
      await navigator.clipboard.writeText(walletInfo.publicKey);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const getWATTBalance = () => {
    const wattBalance = balance.find(b => b.asset_code === 'WATT');
    return wattBalance?.balance || '0';
  };

  const getXLMBalance = () => {
    const xlmBalance = balance.find(b => b.asset_code === 'XLM');
    return xlmBalance?.balance || '0';
  };

  if (walletInfo?.isConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
        {/* Wallet Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{walletInfo.name}</h3>
              <p className="text-sm text-gray-500">Connected</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="relative"
            >
              <Copy className="w-4 h-4" />
              {copiedAddress && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://stellar.expert/explorer/public/account/${walletInfo.publicKey}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={state.isLoading}
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Wallet Address</p>
          <p className="font-mono text-sm text-gray-900 break-all">
            {formatAddress(walletInfo.publicKey)}
          </p>
        </div>

        {/* Balance Display */}
        {showBalance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-700 mb-1">WATT Balance</p>
              <p className="text-lg font-semibold text-green-900">
                {balanceLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  getWATTBalance()
                )}
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700 mb-1">XLM Balance</p>
              <p className="text-lg font-semibold text-blue-900">
                {balanceLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  getXLMBalance()
                )}
              </p>
            </div>
          </div>
        )}

        {/* Network Indicator */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${
            walletInfo.network === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm text-gray-700">
            {walletInfo.network === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </span>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}
      </div>
    );
  }

  // Not connected state
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <WalletIcon className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Connect your Stellar wallet to access the CurrentDao energy marketplace
        </p>

        {/* Wallet Options */}
        <div className="space-y-3">
          <Button
            onClick={() => handleConnect('freighter')}
            disabled={!freighterAvailable || state.isLoading}
            className="w-full"
            size="lg"
          >
            {state.isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <div className="w-4 h-4 mr-2 bg-blue-600 rounded" />
            )}
            Connect Freighter
          </Button>

          <Button
            onClick={() => handleConnect('albedo')}
            disabled={!albedoAvailable || state.isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {state.isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <div className="w-4 h-4 mr-2 bg-purple-600 rounded" />
            )}
            Connect Albedo
          </Button>
        </div>

        {/* Wallet Availability Info */}
        <div className="mt-6 text-xs text-gray-500">
          <p className="mb-2">Wallet Availability:</p>
          <div className="flex justify-center gap-4">
            <span className={`flex items-center gap-1 ${
              freighterAvailable ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                freighterAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              Freighter
            </span>
            <span className={`flex items-center gap-1 ${
              albedoAvailable ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                albedoAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              Albedo
            </span>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {/* Help Links */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Don't have a wallet?</p>
          <div className="flex justify-center gap-4 mt-2">
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Install Freighter
            </a>
            <a
              href="https://albedo.link/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              About Albedo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnector;
