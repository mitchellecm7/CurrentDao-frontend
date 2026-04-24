import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';

interface QRGeneratorProps {
  value: string; // The XDR string or JSON payload
  label: string;
  size?: number;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  offline?: boolean;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({
  value,
  label,
  size = 200,
  errorLevel = 'H',
  offline = false,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${Date.now()}.png`;
      link.click();
      toast.success('QR code downloaded');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('QR data copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="text-center mb-4">
        <span className="text-gray-700 font-bold text-lg">{label}</span>
        {offline && (
          <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 border border-green-500 text-green-700 text-xs rounded-full">
            ✓ Offline Compatible
          </div>
        )}
      </div>

      {/* QR Code */}
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-lg border-2 border-gray-300 mb-4"
      >
        <QRCodeCanvas
          value={value}
          size={size}
          level={errorLevel}
          marginSize={4}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          title="Download QR code as PNG"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
          title="Copy QR data to clipboard"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>

        <button
          onClick={handlePrint}
          className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium text-sm"
          title="Print QR code"
        >
          Print
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Error Correction: {errorLevel} | Size: {size}px
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Valid for 15 minutes • Keep offline safe
        </p>
      </div>
    </div>
  );
};

export default QRGenerator;