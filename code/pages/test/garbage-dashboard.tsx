import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
} from 'chart.js';
import { ethers } from 'ethers';
import SensorMap from '../../components/SensorMap';
import MetricsChart from '../../components/MetricsChart';
import SensorDetails from '../../components/SensorDetails';
import GlassCard from '../../components/GlassCard';
import GarbageTimeline from '../../components/garbage/GarbageTimeline';
import { BIN_IDS, GARBAGE_BINS, BIN_NETWORK_CONNECTIONS, generateDummyReadings, generateDummyEvents } from '../../utils/garbageDummyData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Add global declaration for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

// Basic Reading type
type Reading = {
  sensorId: string;
  timestamp: number;
  sensorType: string;
  fillLevel?: number;             // 0–100%
  doorOpen?: boolean;             // true if bin lid open
  lastCollectionTimestamp?: number;
  batteryLevel?: number;
  binType?: string;
  latitude?: number;
  longitude?: number;
  txHash?: string;
  [key: string]: any; // Allow for any other properties
};

// Event type for blockchain timeline
type BlockchainEvent = {
  id?: string;          // Added to match GarbageBlockchainEvent
  sensorId: string;
  value: number;
  timestamp: number;
  txHash: string;
  metricType?: string;
  eventType?: string;   // Added to match GarbageBlockchainEvent
  userId?: string;      // Added to match GarbageBlockchainEvent
  bagId?: string;       // Added to match GarbageBlockchainEvent
  correct?: boolean;    // Added to match GarbageBlockchainEvent
  pointsAwarded?: number; // Added to match GarbageBlockchainEvent
  fineAmount?: number;  // Added to match GarbageBlockchainEvent
};

// Mock contract settings
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Dummy address
const CONTRACT_ABI = [
  'event GarbageEvent(string indexed sensorId, uint256 timestamp, uint8 fillLevel, string eventType, bytes32 dataHash)',
];

const GarbageDashboard = () => {
  // Basic state management
  const [readings, setReadings] = useState<Record<string, Reading[]>>({});
  const [bins, setBins] = useState<string[]>([]);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eventsMap, setEventsMap] = useState<Record<string, BlockchainEvent[]>>({});
  const [activeMetricTab, setActiveMetricTab] = useState<string>('primary');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  
  // State for bin details view
  const [showModal, setShowModal] = useState<boolean>(false);
  const [viewingBinId, setViewingBinId] = useState<string | null>(null);
  
  // References to prevent state loss during re-renders
  const selectedBinRef = useRef<string | null>(null);
  const activeMetricTabRef = useRef<string>('primary');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Create a stable callback for bin selection
  const handleBinSelect = useCallback((binId: string) => {
    console.log('User selected bin:', binId);
    setSelectedBin(binId);
    selectedBinRef.current = binId;
  }, []);
  
  // Handle view details click
  const handleViewDetails = useCallback((binId: string) => {
    console.log('View details for bin:', binId);
    setViewingBinId(binId);
    setShowModal(true);
  }, []);
  
  // Close modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Keep the ref in sync with state
  useEffect(() => {
    activeMetricTabRef.current = activeMetricTab;
  }, [activeMetricTab]);

  // Connect to Ethereum provider
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        // Create contract instance
        if (CONTRACT_ADDRESS) {
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            provider
          );
          setContract(contract);
          
          // Listen for events
          contract.on('GarbageEvent', (sensorId, timestamp, fillLevel, eventType, dataHash, event) => {
            const newEvent: BlockchainEvent = {
              sensorId: sensorId,
              value: Number(fillLevel),
              timestamp: Number(timestamp),
              txHash: event.transactionHash,
              metricType: eventType
            };
            
            setEventsMap(prev => {
              const list = prev[sensorId] || [];
              return {
                ...prev,
                [sensorId]: [newEvent, ...list]
              };
            });
          });
        }
        
        setIsWalletConnected(true);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      console.log('MetaMask not installed. Using dummy events instead.');
    }
  };

  // Fetch data (using dummy data for the test dashboard)
  const fetchReadings = async () => {
    try {
      // For testing, use dummy data
      const dummyReadings = generateDummyReadings() as Record<string, Reading[]>;
      
      setReadings(prevReadings => {
        // Only update if there's a difference to avoid unnecessary rerenders
        if (JSON.stringify(prevReadings) !== JSON.stringify(dummyReadings)) {
          return dummyReadings;
        }
        return prevReadings;
      });
      
      // Generate new dummy events more frequently (50% chance instead of 30%)
      if (Math.random() > 0.5 || Object.keys(eventsMap).length === 0) {
        const newEvents = generateDummyEvents();
        
        // Now we need to organize new events by sensorId
        setEventsMap(prevEventsMap => {
          const updatedEventsMap = { ...prevEventsMap };
          
          // Group events by sensorId
          newEvents.forEach(event => {
            const sensorId = event.sensorId;
            if (!updatedEventsMap[sensorId]) {
              updatedEventsMap[sensorId] = [];
            }
            
            // Check if this event already exists for this sensor
            const exists = updatedEventsMap[sensorId].some(e => e.txHash === event.txHash);
            if (!exists) {
              // Add new event to this sensor's list
              // Convert to new event format while adding
              const adaptedEvent: BlockchainEvent = {
                ...event,
                id: `event-${event.timestamp}-${Math.random().toString(36).substring(2, 9)}`,
                eventType: event.metricType || 'measurement',
                // Map common metricTypes to eventTypes
                ...(event.metricType === 'correctDisposal' && { 
                  eventType: 'disposal',
                  correct: true 
                }),
                ...(event.metricType === 'misuseAlert' && { 
                  eventType: 'disposal',
                  correct: false 
                }),
                ...(event.metricType === 'rewardIssued' && { 
                  eventType: 'reward',
                  pointsAwarded: event.points || Math.floor(Math.random() * 5) + 1
                }),
                ...(event.metricType === 'fineIssued' && { 
                  eventType: 'fine',
                  fineAmount: event.amount || (Math.floor(Math.random() * 4) + 1) * 5
                }),
                ...(event.metricType === 'fillLevelAlert' && { 
                  eventType: 'fillLevelAlert' 
                }),
                ...(event.metricType === 'collectionConfirmed' && { 
                  eventType: 'collectionConfirmed' 
                }),
                ...(event.metricType === 'doorOpenAlert' && { 
                  eventType: 'doorOpenAlert' 
                }),
                ...(event.metricType === 'batteryLow' && { 
                  eventType: 'batteryLow' 
                }),
                ...(event.metricType === 'bagIssued' && { 
                  eventType: 'bag-issuance'
                }),
              };
              
              updatedEventsMap[sensorId] = [adaptedEvent, ...updatedEventsMap[sensorId]];
            }
          });
          
          // For each sensor, sort events by timestamp (newest first)
          Object.keys(updatedEventsMap).forEach(sensorId => {
            updatedEventsMap[sensorId].sort((a, b) => b.timestamp - a.timestamp);
            
            // Optional: limit each sensor's events (uncomment if you want to cap per sensor)
            // updatedEventsMap[sensorId] = updatedEventsMap[sensorId].slice(0, 100);
          });
          
          return updatedEventsMap;
        });
      }
      
      // Update last updated timestamp
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('Initial data fetch');
    setIsLoading(true);
    
    // Simple fetch function for now
    const fetchInitialData = async () => {
      try {
        await fetchReadings();
        setBins(BIN_IDS);
        
        // Select first bin by default
        if (BIN_IDS.length > 0) {
          setSelectedBin(BIN_IDS[0]);
          selectedBinRef.current = BIN_IDS[0];
        }
        
        // Try to connect to wallet
        connectWallet();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Set up polling for new data every 5 seconds
    pollingInterval.current = setInterval(() => {
      fetchReadings();
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      
      // Remove contract event listeners if any
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, []);

  // Update events when viewing bin changes
  useEffect(() => {
    // Always fetch readings when the modal is closed to ensure we keep accumulating events
    if (!viewingBinId) {
      fetchReadings();
    }
  }, [viewingBinId]);

  // Get the selected bin info
  const getSelectedBinPosition = () => {
    if (!selectedBin) return null;
    const binInfo = GARBAGE_BINS.find(s => s.id === selectedBin);
    return binInfo ? { lat: binInfo.lat, lng: binInfo.lng } : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-800 text-white">
      {/* Main content with map */}
      <div className="relative">
        {/* Full-screen map container - absolute but lower z-index */}
        <div className="absolute inset-0 z-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            </div>
          ) : (
            <div className="h-full pt-16">
              <SensorMap
                sensors={bins}
                readings={readings}
                selectedSensor={selectedBin}
                onSensorSelect={handleBinSelect}
              />
            </div>
          )}
        </div>
        
        {/* Navbar */}
        <div className="relative z-10 bg-slate-900/80 backdrop-blur-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-green-400">
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 11-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Garbage Collection Monitor</h1>
            <div className="ml-4 text-sm text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Home button - navigation to index */}
            <a 
              href="/" 
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </a>
            
            {/* Navigation to Garbage Management */}
            <a 
              href="/garbage-management" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Garbage Management
            </a>
            
            {/* Wallet connection button */}
            {!isWalletConnected ? (
              <button
                onClick={connectWallet}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center px-4 py-2 rounded-lg bg-green-900/30 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Wallet Connected
              </div>
            )}
            
            {/* View Details Button - appears when a bin is selected */}
            {selectedBin && (
              <button
                onClick={() => handleViewDetails(selectedBin)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View Details
              </button>
            )}
          </div>
        </div>
        
        {/* Invisible full-height container to ensure content takes up the full height */}
        <div className="h-screen w-full pointer-events-none" aria-hidden="true"></div>
      </div>
      
      {/* Modal with bin details, metrics and timeline */}
      {showModal && viewingBinId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bin Details: {viewingBinId}</h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
              <div className="flex flex-col">
                {/* First row - Metrics chart only with larger height */}
                <div className="mb-0">
                  <GlassCard>
                    <div className="h-[450px]">
                      <MetricsChart 
                        selectedSensor={viewingBinId}
                        readings={readings}
                        activeMetricTab={activeMetricTab}
                        setActiveMetricTab={setActiveMetricTab}
                      />
                    </div>
                  </GlassCard>
                </div>
                
                {/* Second row - Bin details and Blockchain events side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Left column - Bin details */}
                  <div className="h-80">
                    <GlassCard className="h-full">
                      <div className="h-full overflow-y-auto">
                        <SensorDetails
                          selectedSensor={viewingBinId}
                          sensors={bins}
                          readings={readings}
                          onSensorSelect={handleBinSelect}
                        />
                      </div>
                    </GlassCard>
                  </div>
                  
                  {/* Right column - Blockchain events */}
                  <div className="h-80">
                    <GlassCard className="h-full">
                      <div className="flex flex-col h-full">
                        <h2 className="text-lg font-semibold mb-3">
                          Blockchain Events
                          <span className="ml-2 bg-green-500/20 text-green-300 text-sm py-0.5 px-2 rounded-full">
                            {(eventsMap[viewingBinId] || []).length}
                          </span>
                        </h2>
                        <div className="flex-1 min-h-0">
                          <GarbageTimeline events={
                            // Convert the events to the format expected by GarbageTimeline
                            (eventsMap[viewingBinId] || []).map(event => ({
                              id: event.id || `event-${event.timestamp}-${Math.random().toString(36).substring(2, 9)}`,
                              timestamp: event.timestamp,
                              txHash: event.txHash,
                              eventType: event.eventType || event.metricType || 'measurement',
                              sensorId: event.sensorId,
                              value: event.value,
                              userId: event.userId,
                              bagId: event.bagId,
                              correct: event.correct,
                              pointsAwarded: event.pointsAwarded,
                              fineAmount: event.fineAmount
                            }))
                          } />
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarbageDashboard; 