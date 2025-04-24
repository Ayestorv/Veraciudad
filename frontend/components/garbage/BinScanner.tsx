import React, { useState, useEffect } from 'react';
import { BAGS, USERS, blockchainAdapter } from '../../utils/garbageDummyData';
import GlassCard from '../GlassCard';

type Bag = {
  id: string;
  userId: string;
  bagType: string;
  qrCode: string;
  rfid: string;
  issuedAt: number;
  txHash: string;
};

type User = {
  id: string;
  name: string;
  address: string;
  walletAddress: string;
  pointsBalance: number;
  finesBalance: number;
  onboardedAt: number;
};

type BinScannerProps = {
  selectedBin: string | null;
  binType: string | null;
  onScanComplete?: (disposalData: any) => void;
};

const BinScanner: React.FC<BinScannerProps> = ({ 
  selectedBin, 
  binType, 
  onScanComplete 
}) => {
  const [scanInput, setScanInput] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string>('');
  const [scannedBag, setScannedBag] = useState<Bag | null>(null);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [randomBags, setRandomBags] = useState<Bag[]>([]);
  
  // Load random bags for demo purposes
  useEffect(() => {
    const getRandomBags = () => {
      // Get 5 random bags from the BAGS array
      const shuffled = [...BAGS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    };
    
    setRandomBags(getRandomBags());
  }, []);
  
  // Reset scan input when bin changes
  useEffect(() => {
    setScanInput('');
    setScanResult(null);
    setScanError('');
    setScannedBag(null);
    setScannedUser(null);
  }, [selectedBin, binType]);
  
  // Handle scan input change
  const handleScanInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanInput(e.target.value);
  };
  
  // Handle quick selection of a bag for demo
  const handleQuickSelect = (bagIdOrCode: string) => {
    setScanInput(bagIdOrCode);
  };
  
  // Process scan to find the bag
  const findBagByIdOrCode = (query: string): Bag | null => {
    return BAGS.find(
      bag => bag.id === query || bag.qrCode === query || bag.rfid === query
    ) || null;
  };
  
  // Find user by ID
  const findUserById = (userId: string): User | null => {
    return USERS.find(user => user.id === userId) || null;
  };
  
  // Handle scan submission
  const handleScan = async () => {
    if (!scanInput.trim()) {
      setScanError('Please enter a bag ID, QR code, or RFID');
      return;
    }
    
    if (!selectedBin || !binType) {
      setScanError('No bin selected');
      return;
    }
    
    setScanning(true);
    setScanResult(null);
    setScanError('');
    
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find bag by ID, QR, or RFID
      const bag = findBagByIdOrCode(scanInput);
      
      if (!bag) {
        throw new Error('Invalid or unknown bag identifier');
      }
      
      // Find user
      const user = findUserById(bag.userId);
      
      if (!user) {
        throw new Error('User not found for this bag');
      }
      
      // Set scanned bag and user
      setScannedBag(bag);
      setScannedUser(user);
      
      // Record disposal via blockchain adapter
      const disposalData = {
        sensorId: selectedBin,
        userId: bag.userId,
        bagId: bag.id,
        timestamp: Date.now()
      };
      
      const result = blockchainAdapter.recordDisposal(disposalData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Determine points or fine
      if (result.correct) {
        // Award points (1-5 points for correct disposal)
        const points = Math.floor(Math.random() * 5) + 1;
        const rewardResult = blockchainAdapter.issueReward(bag.userId, points);
        
        // Update result with points
        result.points = points;
        result.rewardTxHash = rewardResult.txHash;
      } else {
        // Issue fine ($5-$20 for incorrect disposal)
        const fineAmount = (Math.floor(Math.random() * 4) + 1) * 5;
        const fineResult = blockchainAdapter.issueFine(bag.userId, fineAmount);
        
        // Update result with fine
        result.fineAmount = fineAmount;
        result.fineTxHash = fineResult.txHash;
      }
      
      // Set scan result
      setScanResult(result);
      
      // Call onScanComplete callback if provided
      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setScanError(error.message || 'An error occurred during scanning');
    } finally {
      setScanning(false);
    }
  };
  
  // Return appropriate text for bag type
  const getBagTypeText = (type: string) => {
    switch (type) {
      case 'general-waste':
        return 'General Waste';
      case 'recyclable':
        return 'Recyclable';
      case 'organic':
        return 'Organic';
      default:
        return type;
    }
  };
  
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">
        Manual Bag Scanner
        {binType && <span className="ml-2 text-sm text-gray-400">({getBagTypeText(binType)} Bin)</span>}
      </h2>
      
      {!selectedBin || !binType ? (
        <div className="p-4 text-center text-gray-400">
          Please select a bin to enable scanning
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-3">
              This scanner simulates the process of manually scanning waste bags when they are 
              disposed at bins. Operators can scan bags by ID, QR code, or RFID to record proper disposal 
              and assign rewards or fines based on correct sorting.
            </p>
            
            <label htmlFor="scanInput" className="block text-sm font-medium text-gray-300 mb-1">
              Scan Bag (ID, QR Code, or RFID)
            </label>
            <div className="flex">
              <input
                type="text"
                id="scanInput"
                value={scanInput}
                onChange={handleScanInputChange}
                disabled={scanning}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-l-md p-2 text-white"
                placeholder="Enter bag ID, QR code, or RFID"
              />
              <button
                onClick={handleScan}
                disabled={scanning || !scanInput.trim()}
                className={`px-4 rounded-r-md ${
                  scanning || !scanInput.trim()
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium transition-colors`}
              >
                {scanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          </div>
          
          {scanError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300">
              {scanError}
            </div>
          )}
          
          {/* Quick selection for demo purposes */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">Quick Select for Demo:</div>
            <div className="flex flex-wrap gap-2">
              {randomBags.map(bag => (
                <button
                  key={bag.id}
                  onClick={() => handleQuickSelect(bag.id)}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                >
                  {bag.id}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scan result */}
          {scanResult && (
            <div className={`p-4 rounded-md ${
              scanResult.correct 
                ? 'bg-green-500/20 border border-green-500' 
                : 'bg-red-500/20 border border-red-500'
            }`}>
              <div className="flex items-center mb-3">
                <div className={`text-2xl mr-2 ${
                  scanResult.correct ? 'text-green-400' : 'text-red-400'
                }`}>
                  {scanResult.correct ? '✓' : '✗'}
                </div>
                <div className="text-lg font-medium">
                  {scanResult.correct 
                    ? 'Correct Disposal' 
                    : 'Incorrect Disposal'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <span className="text-gray-400 text-sm">User:</span>
                  <div>{scannedUser?.name}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Bag ID:</span>
                  <div>{scannedBag?.id}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Bag Type:</span>
                  <div className="capitalize">{scannedBag?.bagType.replace('-', ' ')}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Bin Type:</span>
                  <div className="capitalize">{binType.replace('-', ' ')}</div>
                </div>
              </div>
              
              {scanResult.correct ? (
                <div className="text-green-300 font-medium">
                  +{scanResult.points} points awarded
                  <div className="text-xs mt-1">
                    <a 
                      href={`https://etherscan.io/tx/${scanResult.rewardTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View reward on Etherscan ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-red-300 font-medium">
                  ${scanResult.fineAmount} fine issued
                  <div className="text-xs mt-1">
                    <a 
                      href={`https://etherscan.io/tx/${scanResult.fineTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View fine on Etherscan ↗
                    </a>
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-400">
                Disposal recorded on blockchain:
                <a 
                  href={`https://etherscan.io/tx/${scanResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-400 hover:underline"
                >
                  View on Etherscan ↗
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
};

export default BinScanner; 