'use client'

import React, { useState } from 'react';
import QRGenerator from './QRGenerator';
import { QRService } from '../services/qr/qr-service';
import { QRActionType } from '../types/qr';
import toast from 'react-hot-toast';
import { Copy, CheckCircle } from 'lucide-react';

interface WalletQRProps {
  publicKey: string;
  network?: 'public' | 'testnet';
}

const WalletQR: React.FC<WalletQRProps> = ({
  publicKey,
  network = 'testnet',
}) => {
  const [qrPayload, setQrPayload] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateQR = async () => {
    try {
      setIsGenerating(true);

      const payload = {
        publicKey,
        network,
        timestamp: Date.now(),
      };

      const qrData = QRService.generateQRPayload(
        QRActionType.WALLET_CONNECT,
        payload,
        60 // 1 hour expiry for wallet connection
      );

      setQrPayload(JSON.stringify(qrData));
      toast.success('Wallet QR code generated (3 second connection)');
    } catch (error) {
      toast.error('Failed to generate wallet QR');
      console.error('Wallet QR generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(publicKey).then(() => {
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-dashed border-blue-300 rounded-lg text-center bg-gradient-to-br from-blue-50 to-white">
      <div>
        <h4 className="text-lg font-bold text-blue-600 mb-2">Wallet Connection QR</h4>
        <p className="text-sm text-gray-600">
          Share this QR for quick 3-second wallet connection
        </p>
      </div>

      {!qrPayload ? (
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Public Key:</p>
            <p className="text-xs font-mono text-gray-600 break-all mb-3">
              {publicKey}
            </p>
            <button
              onClick={handleCopyAddress}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Address
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-600">
            <p className="font-medium mb-2">Network: <span className="text-blue-600 font-bold uppercase">{network}</span></p>
          </div>

          <button
            onClick={handleGenerateQR}
            disabled={isGenerating}
            className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Wallet QR'
            )}
          </button>
        </div>
      ) : (
        <QRGenerator
          value={qrPayload}
          label={`Wallet: ${publicKey.slice(0, 8)}...`}
          offline={false}
        />
      )}

      {qrPayload && (
        <button
          onClick={() => setQrPayload('')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Generate New Wallet QR
        </button>
      )}

      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
        <p className="text-xs text-yellow-800">
          <span className="font-semibold">💡 Tip:</span> This QR code can be shared publicly. Recipients can scan to connect wallets in under 3 seconds.
        </p>
      </div>
    </div>
  );
};

export default WalletQR;
