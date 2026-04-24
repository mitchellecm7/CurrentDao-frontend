'use client'

import React, { useState } from 'react';
import QRGenerator from './QRGenerator';
import { QRService } from '../services/qr/qr-service';
import { QRActionType } from '../types/qr';
import toast from 'react-hot-toast';

interface TradingQRProps {
  asset: string;
  amount: string;
  price: string;
  recipient?: string;
  expiresInMinutes?: number;
}

const TradingQR: React.FC<TradingQRProps> = ({
  asset,
  amount,
  price,
  recipient,
  expiresInMinutes = 15,
}) => {
  const [qrPayload, setQrPayload] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQR = async () => {
    try {
      setIsGenerating(true);

      const tradeData = {
        asset,
        amount,
        price,
        timestamp: Date.now(),
        recipient: recipient || '',
      };

      const qrData = QRService.generateQRPayload(
        QRActionType.TRADE,
        tradeData,
        expiresInMinutes
      );

      setQrPayload(JSON.stringify(qrData));
      toast.success('QR code generated successfully');
    } catch (error) {
      toast.error('Failed to generate QR code');
      console.error('QR generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-dashed border-gray-300 rounded-lg text-center bg-gradient-to-br from-gray-50 to-white">
      <div>
        <h4 className="text-lg font-bold text-blue-600 mb-2">Energy Trading QR</h4>
        <p className="text-sm text-gray-600">
          Generate a QR code for instant energy trading
        </p>
      </div>

      {!qrPayload ? (
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Trade Details:
            </p>
            <div className="text-left space-y-1 text-sm">
              <p>
                <span className="font-medium">Asset:</span> {asset}
              </p>
              <p>
                <span className="font-medium">Amount:</span> {amount}
              </p>
              <p>
                <span className="font-medium">Price:</span> {price} XLM
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Expires in {expiresInMinutes} minutes
              </p>
            </div>
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
              'Generate QR Code'
            )}
          </button>
        </div>
      ) : (
        <QRGenerator
          value={qrPayload}
          label={`${amount} ${asset} @ ${price} XLM`}
          offline={true}
        />
      )}

      {qrPayload && (
        <button
          onClick={() => setQrPayload('')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Generate New QR Code
        </button>
      )}
    </div>
  );
};

export default TradingQR;