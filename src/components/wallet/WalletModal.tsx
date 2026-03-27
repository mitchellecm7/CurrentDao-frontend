import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet as WalletIcon, ExternalLink } from 'lucide-react';
import { WalletModalProps, WalletType } from '@/types/wallet';
import { Button } from '@/components/ui/Button';

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onWalletSelect,
  isLoading = false,
  error = null,
}) => {
  const handleWalletSelect = (walletType: WalletType) => {
    onWalletSelect(walletType);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const walletOptions = [
    {
      type: 'freighter' as WalletType,
      name: 'Freighter',
      description: 'Popular browser extension wallet for Stellar',
      icon: (
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">F</span>
        </div>
      ),
      color: 'blue',
      installUrl: 'https://www.freighter.app/',
    },
    {
      type: 'albedo' as WalletType,
      name: 'Albedo',
      description: 'Secure popup-based wallet for Stellar',
      icon: (
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">A</span>
        </div>
      ),
      color: 'purple',
      installUrl: 'https://albedo.link/',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Connect Wallet
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose your preferred Stellar wallet
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-600">Connecting to wallet...</p>
                </div>
              ) : (
                /* Wallet Options */
                <div className="space-y-3">
                  {walletOptions.map((wallet) => (
                    <motion.button
                      key={wallet.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWalletSelect(wallet.type)}
                      className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                    >
                      {wallet.icon}
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {wallet.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {wallet.description}
                        </p>
                      </div>
                      
                      <div className="text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  New to Stellar wallets?
                </p>
                <div className="flex justify-center gap-4">
                  {walletOptions.map((wallet) => (
                    <a
                      key={wallet.type}
                      href={wallet.installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {wallet.name}
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Security Notice */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Security Note:</strong> Never share your private key or recovery phrase. 
                  CurrentDao will never ask for this information.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WalletModal;
