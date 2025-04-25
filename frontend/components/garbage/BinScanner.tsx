import React, { useState, useEffect } from 'react';
import { BAGS, USERS, blockchainAdapter } from '../../utils/garbageDummyData';
import { 
  getUsers, 
  saveUsers, 
  getBags, 
  saveBags, 
  getBlockchainEvents, 
  saveBlockchainEvents, 
  addBlockchainEvent,
  type User,
  type Bag,
  type BlockchainEvent
} from '../../utils/garbageLocalStorage';
import GlassCard from '../GlassCard';
import QRCodeScanner from './QRCodeScanner';

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
  const [users, setUsers] = useState<User[]>([]);
  const [bags, setBags] = useState<Bag[]>([]);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  
  // Load users and bags from localStorage
  useEffect(() => {
    const persistedUsers = getUsers(USERS);
    const persistedBags = getBags(BAGS);
    
    setUsers(persistedUsers);
    setBags(persistedBags);
    
    // Get 5 random bags for quick select demo
    const getRandomBags = () => {
      const shuffled = [...persistedBags].sort(() => 0.5 - Math.random());
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
    return bags.find(
      bag => bag.id === query || bag.qrCode === query || bag.rfid === query
    ) || null;
  };
  
  // Find user by ID
  const findUserById = (userId: string): User | null => {
    return users.find(user => user.id === userId) || null;
  };
  
  // Handle QR scan result
  const handleQRScan = (data: string) => {
    setIsQRScannerOpen(false);
    if (data) {
      setScanInput(data);
      // Auto-submit the scan
      setTimeout(() => handleScan(), 500);
    }
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
      
      // Get current blockchain events
      const events = getBlockchainEvents([]);
      
      // Create disposal event
      const disposalEvent = {
        id: `event-${events.length + 1}`,
        timestamp: result.timestamp,
        txHash: result.txHash,
        eventType: 'disposal',
        userId: bag.userId,
        bagId: bag.id,
        sensorId: selectedBin,
        correct: result.correct
      };
      
      // Add disposal event to blockchain events
      let updatedEvents = [disposalEvent, ...events];
      
      // Determine points or fine
      if (result.correct) {
        // Award points (1-5 points for correct disposal)
        const points = Math.floor(Math.random() * 5) + 1;
        const rewardResult = blockchainAdapter.issueReward(bag.userId, points);
        
        // Update user's points
        const updatedUsers = users.map(u => {
          if (u.id === bag.userId) {
            return {
              ...u,
              pointsBalance: u.pointsBalance + points
            };
          }
          return u;
        });
        
        // Save updated users
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        
        // Create reward event
        const rewardEvent = {
          id: `event-${events.length + 2}`,
          timestamp: rewardResult.timestamp,
          txHash: rewardResult.txHash,
          eventType: 'reward',
          userId: bag.userId,
          pointsAwarded: points
        };
        
        // Add reward event to blockchain events
        updatedEvents = [rewardEvent, ...updatedEvents];
        
        // Update result with points
        result.points = points;
        result.rewardTxHash = rewardResult.txHash;
      } else {
        // Issue fine ($5-$20 for incorrect disposal)
        const fineAmount = (Math.floor(Math.random() * 4) + 1) * 5;
        const fineResult = blockchainAdapter.issueFine(bag.userId, fineAmount);
        
        // Update user's fines
        const updatedUsers = users.map(u => {
          if (u.id === bag.userId) {
            return {
              ...u,
              finesBalance: u.finesBalance + fineAmount
            };
          }
          return u;
        });
        
        // Save updated users
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        
        // Create fine event
        const fineEvent = {
          id: `event-${events.length + 2}`,
          timestamp: fineResult.timestamp,
          txHash: fineResult.txHash,
          eventType: 'fine',
          userId: bag.userId,
          fineAmount: fineAmount
        };
        
        // Add fine event to blockchain events
        updatedEvents = [fineEvent, ...updatedEvents];
        
        // Update result with fine
        result.fineAmount = fineAmount;
        result.fineTxHash = fineResult.txHash;
      }
      
      // Persist updated blockchain events
      saveBlockchainEvents(updatedEvents);
      
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
              Enter a bag ID, QR code, or RFID to simulate scanning a bag for waste disposal.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={handleScanInputChange}
                disabled={scanning}
                placeholder="Enter bag ID, QR code, or RFID"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
              />
              
              <button
                onClick={() => setIsQRScannerOpen(true)}
                disabled={scanning}
                className={`px-3 py-2 rounded-md ${
                  scanning
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium transition-colors`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </button>
              
              <button
                onClick={handleScan}
                disabled={scanning || !scanInput.trim()}
                className={`px-4 py-2 rounded-md ${
                  scanning || !scanInput.trim()
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium transition-colors`}
              >
                {scanning ? 'Scanning...' : 'Scan Bag'}
              </button>
            </div>
            
            {scanError && (
              <div className="mt-2 text-red-400 text-sm">
                {scanError}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Quick Demo: Click to select a bag</p>
            <div className="flex flex-wrap gap-2">
              {randomBags.map(bag => (
                <button
                  key={bag.id}
                  onClick={() => handleQuickSelect(bag.id)}
                  disabled={scanning}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-md"
                >
                  {bag.id} ({getBagTypeText(bag.bagType)})
                </button>
              ))}
            </div>
          </div>
          
          {scanResult && (
            <div className={`mt-6 p-4 rounded-md border ${
              scanResult.correct 
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <h3 className={`text-lg font-medium mb-3 ${
                scanResult.correct ? 'text-green-400' : 'text-red-400'
              }`}>
                {scanResult.correct ? 'Correct Disposal' : 'Incorrect Disposal'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-sm text-gray-400">User</p>
                  <p className="text-white">{scannedUser?.name || scanResult.userId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Bag ID</p>
                  <p className="text-white">{scanResult.bagId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Waste Type</p>
                  <p className="text-white capitalize">{scanResult.bagType.replace('-', ' ')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Bin Type</p>
                  <p className="text-white capitalize">{scanResult.wasteType.replace('-', ' ')}</p>
                </div>
              </div>
              
              {scanResult.correct ? (
                <div className="bg-green-500/20 p-3 rounded-md text-green-300 flex items-center">
                  <span className="text-xl mr-2">🏆</span>
                  <div>
                    <p className="font-medium">Reward: {scanResult.points} points awarded</p>
                    <a 
                      href={`https://etherscan.io/tx/${scanResult.rewardTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-400 hover:underline"
                    >
                      View transaction ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/20 p-3 rounded-md text-red-300 flex items-center">
                  <span className="text-xl mr-2">💸</span>
                  <div>
                    <p className="font-medium">Fine: ${scanResult.fineAmount} penalty applied</p>
                    <a 
                      href={`https://etherscan.io/tx/${scanResult.fineTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-400 hover:underline"
                    >
                      View transaction ↗
                    </a>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-400">
                <p>Disposal transaction recorded on-chain:</p>
                <a 
                  href={`https://etherscan.io/tx/${scanResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {scanResult.txHash}
                </a>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* QR Code Scanner Modal */}
      <QRCodeScanner 
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />
    </GlassCard>
  );
};

export default BinScanner; 