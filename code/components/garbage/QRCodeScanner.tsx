import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import GlassCard from '../GlassCard';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose, isOpen }) => {
  const [error, setError] = useState<string>('');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );

    // Check camera permission
    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setCameraPermission(true);
        })
        .catch((err) => {
          console.error('Camera permission error:', err);
          setCameraPermission(false);
          setError('Camera permission denied. Please allow camera access to scan QR codes.');
        });
    }

    return () => {
      // Cleanup on unmount
    };
  }, [isOpen]);

  const handleScan = (data: { text: string } | null) => {
    if (data && data.text) {
      onScan(data.text);
    }
  };

  const handleError = (err: Error) => {
    console.error('QR Scanner error:', err);
    setError(`Scanner error: ${err.message}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md relative">
        <div className="absolute top-2 right-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2"
            aria-label="Close scanner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300">
            {error}
          </div>
        )}

        {cameraPermission === false && (
          <div className="text-center p-4">
            <p className="text-red-400 mb-2">Camera permission denied</p>
            <p className="text-gray-300 text-sm">
              Please enable camera access in your browser settings to scan QR codes.
            </p>
          </div>
        )}

        {cameraPermission === true && (
          <div className="rounded-md overflow-hidden border-2 border-green-500/50">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
              constraints={
                isMobile
                  ? { facingMode: { exact: 'environment' } }
                  : { facingMode: 'user' }
              }
            />
          </div>
        )}

        <div className="mt-4 text-center text-gray-300 text-sm">
          <p>Position the QR code within the scanner frame</p>
          <p className="text-gray-400 mt-1">The scan will happen automatically</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default QRCodeScanner; 