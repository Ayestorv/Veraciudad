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
import Timeline from '../../components/Timeline';
import GlassCard from '../../components/GlassCard';
import { SENSOR_IDS, generateDummyReadings, PANAMA_CITY_SENSORS, generateDummyEvents } from '../../utils/dummyData';

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
  [key: string]: any; // Allow for any other properties
};

// Event type for blockchain timeline
type BlockchainEvent = {
  sensorId: string;
  value: number;
  timestamp: number;
  txHash: string;
  metricType?: string;
};

// Mock contract settings
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Dummy address
const CONTRACT_ABI = [
  'event ReadingRecorded(bytes32 indexed sensorId, uint256 value, uint256 ts)',
];

const TestDashboard = () => {
  // Basic state management
  const [readings, setReadings] = useState<Record<string, Reading[]>>({});
  const [sensors, setSensors] = useState<string[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [activeMetricTab, setActiveMetricTab] = useState<string>('primary');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  
  // State for sensor details view
  const [showModal, setShowModal] = useState<boolean>(false);
  const [viewingSensorId, setViewingSensorId] = useState<string | null>(null);
  
  // References to prevent state loss during re-renders
  const selectedSensorRef = useRef<string | null>(null);
  const activeMetricTabRef = useRef<string>('primary');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Create a stable callback for sensor selection
  const handleSensorSelect = useCallback((sensorId: string) => {
    console.log('User selected sensor:', sensorId);
    setSelectedSensor(sensorId);
    selectedSensorRef.current = sensorId;
  }, []);
  
  // Handle view details click
  const handleViewDetails = useCallback((sensorId: string) => {
    console.log('View details for sensor:', sensorId);
    setViewingSensorId(sensorId);
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
          contract.on('ReadingRecorded', (sensorId, value, ts, event) => {
            const decodedSensorId = ethers.decodeBytes32String(sensorId);
            const newEvent: BlockchainEvent = {
              sensorId: decodedSensorId,
              value: Number(value),
              timestamp: Number(ts),
              txHash: event.transactionHash,
            };
            
            setEvents(prev => [newEvent, ...prev].slice(0, 20));
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
      if (Math.random() > 0.5 || events.length === 0) {
        const newEvents = generateDummyEvents();
        
        // Always accumulate events regardless of whether we're viewing a specific sensor
        setEvents(prevEvents => {
          // Add new events to existing ones
          const combinedEvents = [...newEvents, ...prevEvents];
          
          // Deduplicate by txHash
          const unique = combinedEvents.filter((event, index, self) =>
            index === self.findIndex(e => e.txHash === event.txHash)
          );
          
          // Sort by timestamp (newest first)
          unique.sort((a, b) => b.timestamp - a.timestamp);
          
          // Keep up to 50 events to prevent too much accumulation
          return unique.slice(0, 50);
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
        setSensors(SENSOR_IDS);
        
        // Select first sensor by default
        if (SENSOR_IDS.length > 0) {
          setSelectedSensor(SENSOR_IDS[0]);
          selectedSensorRef.current = SENSOR_IDS[0];
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

  // Update events when viewing sensor changes
  useEffect(() => {
    // Always fetch readings when the modal is closed to ensure we keep accumulating events
    if (!viewingSensorId) {
      fetchReadings();
    }
  }, [viewingSensorId]);

  // Get the selected sensor info
  const getSelectedSensorPosition = () => {
    if (!selectedSensor) return null;
    const sensorInfo = PANAMA_CITY_SENSORS.find(s => s.id === selectedSensor);
    return sensorInfo ? { lat: sensorInfo.lat, lng: sensorInfo.lng } : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-800 text-white">
      {/* Main content with map */}
      <div className="relative">
        {/* Full-screen map container - absolute but lower z-index */}
        <div className="absolute inset-0 z-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <div className="h-full pt-16">
              <SensorMap
                sensors={sensors}
                readings={readings}
                selectedSensor={selectedSensor}
                onSensorSelect={handleSensorSelect}
              />
            </div>
          )}
        </div>
        
        {/* Navbar */}
        <div className="relative z-10 bg-slate-900/80 backdrop-blur-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-400">
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                <path d="M13.06 15.473a48.45 48.45 0f 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Water Quality Monitor</h1>
            <div className="ml-4 text-sm text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
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
            
            {/* View Details Button - appears when a sensor is selected */}
            {selectedSensor && (
              <button
                onClick={() => handleViewDetails(selectedSensor)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center"
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
      
      {/* Modal with sensor details, metrics and timeline */}
      {showModal && viewingSensorId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sensor Details: {viewingSensorId}</h2>
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
                        selectedSensor={viewingSensorId}
                        readings={readings}
                        activeMetricTab={activeMetricTab}
                        setActiveMetricTab={setActiveMetricTab}
                      />
                    </div>
                  </GlassCard>
                </div>
                
                {/* Second row - Sensor details and Blockchain events side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Left column - Sensor details */}
                  <div className="h-80">
                    <GlassCard>
                      <div className="h-full overflow-y-auto">
                        <SensorDetails
                          selectedSensor={viewingSensorId}
                          sensors={sensors}
                          readings={readings}
                          onSensorSelect={handleSensorSelect}
                        />
                      </div>
                    </GlassCard>
                  </div>
                  
                  {/* Right column - Blockchain events */}
                  <div className="h-80">
                    <GlassCard>
                      <div className="h-full flex flex-col">
                        <h2 className="text-lg font-semibold mb-3">
                          Blockchain Events
                          <span className="ml-2 bg-blue-500/20 text-blue-300 text-sm py-0.5 px-2 rounded-full">
                            {events.filter(event => event.sensorId === viewingSensorId).length}
                          </span>
                        </h2>
                        <div className="flex-1 overflow-hidden">
                          <Timeline events={events.filter(event => event.sensorId === viewingSensorId)} />
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

export default TestDashboard;