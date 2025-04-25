// Add global declaration for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import GlassCard from '../components/GlassCard';
import SensorMap from '../components/SensorMap';
import Timeline from '../components/Timeline';
import SensorDetails from '../components/SensorDetails';
import MetricsChart from '../components/MetricsChart';
import { SENSOR_IDS, generateDummyReadings, generateDummyEvents, PANAMA_CITY_SENSORS } from '../utils/dummyData';

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

// Enhanced Reading type with all possible metrics
type Reading = {
  sensorId: string;
  timestamp: number;
  sensorType: string;
  latitude?: number;
  longitude?: number;
  txHash?: string;
  
  // Water Quality
  turbidity?: number;
  pH?: number;
  temperature?: number;
  conductivity?: number;
  tds?: number;
  dissolvedOxygen?: number;
  chlorineResidual?: number;
  orp?: number;
  nitrates?: number;
  phosphates?: number;
  ammonia?: number;
  hardness?: number;
  
  // Flow & Hydraulic
  flowRate?: number;
  pressure?: number;
  velocity?: number;
  cumulativeVolume?: number;
  
  // Tank
  tankLevel?: number;
  waterDepth?: number;
  currentVolume?: number;
  
  // Pump
  pumpStatus?: boolean;
  runtime?: number;
  startStopCount?: number;
  motorCurrent?: number;
  motorVoltage?: number;
  vibration?: number;
  bearingTemperature?: number;
  energyConsumption?: number;
  
  // Valve
  valvePosition?: number;
  
  // Network & Environmental
  signalStrength?: number;
  uptime?: number;
  batteryLevel?: number;
  rainfall?: number;
  ambientTemperature?: number;
  humidity?: number;
  soilMoisture?: number;
};

// Define the event type
type BlockchainEvent = {
  sensorId: string;
  value: number;
  timestamp: number;
  txHash: string;
  metricType?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  'event ReadingRecorded(bytes32 indexed sensorId, uint256 value, uint256 ts)',
];

const Dashboard = () => {
  const [readings, setReadings] = useState<Record<string, Reading[]>>({});
  const [sensors, setSensors] = useState<string[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState<string>('primary');
  const [alertCount, setAlertCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const selectedSensorRef = useRef<string | null>(null); // Use ref to track selected sensor
  const activeMetricTabRef = useRef<string>('primary'); // Add ref to track the current tab
  
  // Keep the ref in sync with state
  useEffect(() => {
    activeMetricTabRef.current = activeMetricTab;
  }, [activeMetricTab]);
  
  // Create a stable callback for sensor selection
  const handleSensorSelect = useCallback((sensorId: string) => {
    console.log('User selected sensor:', sensorId);
    setSelectedSensor(sensorId);
    // Also update the ref to track selected sensor
    selectedSensorRef.current = sensorId;
    // Save selected sensor to localStorage for persistence
    localStorage.setItem('selectedSensor', sensorId);
  }, []);

  // Fetch data and initialize polling
  useEffect(() => {
    console.log('Initial data fetch');
    
    // Initial data fetch with loading state
    setIsLoading(true);
    
    // Try to restore previously selected sensor from localStorage
    const savedSensor = localStorage.getItem('selectedSensor');
    if (savedSensor) {
      setSelectedSensor(savedSensor);
      selectedSensorRef.current = savedSensor; // Also set the ref
    }
    
    // Restore previously selected metric tab from localStorage
    const savedMetricTab = localStorage.getItem('activeMetricTab');
    if (savedMetricTab) {
      setActiveMetricTab(savedMetricTab);
    }
    
    fetchReadings()
      .then(() => {
        console.log('Sensors loaded:', sensors);
        if (sensors.length === 0) {
          console.log('No sensors detected, using dummy data with IDs:', SENSOR_IDS);
          setSensors(SENSOR_IDS);
          // Only set selected sensor if nothing is currently selected
          if (selectedSensor === null) {
            const newSelectedSensor = savedSensor && SENSOR_IDS.includes(savedSensor) 
              ? savedSensor 
              : SENSOR_IDS[0];
            setSelectedSensor(newSelectedSensor);
            localStorage.setItem('selectedSensor', newSelectedSensor);
          }
        }
      })
      .finally(() => setIsLoading(false));

    // Set up polling for readings
    pollingInterval.current = setInterval(() => {
      // Capture current states
      const currentSensor = selectedSensorRef.current;
      const currentTab = activeMetricTabRef.current;
      
      console.log('Before fetching - Tab state:', currentTab);
      
      // Store states in localStorage for persistence
      if (currentTab) {
        localStorage.setItem('activeMetricTab', currentTab);
      }
      
      // Fetch new readings data
      fetchReadings().then(() => {
        console.log('After fetching - Restoring state - Tab:', currentTab, 'Sensor:', currentSensor);
        
        // Explicitly restore states to prevent loss during re-renders
        if (currentSensor && currentSensor !== selectedSensorRef.current) {
          setSelectedSensor(currentSensor);
          selectedSensorRef.current = currentSensor;
        }
        
        // Only restore tab if it's different from the current state
        // This prevents unnecessary re-renders and state flushes
        if (currentTab && currentTab !== activeMetricTabRef.current) {
          console.log('Restoring tab state after fetch to:', currentTab);
          setActiveMetricTab(currentTab);
        }
      });
      
      // Update last updated timestamp
      setLastUpdated(new Date());
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

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
            // Increment alert count when new events come in
            setAlertCount(prev => prev + 1);
          });
        }
        
        setIsWalletConnected(true);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      alert('Please install MetaMask to use this feature');
    }
  };

  // Fetch readings from API
  const fetchReadings = async () => {
    // IMPORTANT: Save current state BEFORE any state changes
    const currentSelectedSensor = selectedSensorRef.current || selectedSensor;
    const currentMetricTab = activeMetricTabRef.current;
    
    console.log('fetchReadings - Initial tab state:', currentMetricTab, 'Sensor:', currentSelectedSensor);
    
    try {
      // Try to fetch readings for all sensors from API
      const readingsData: Record<string, Reading[]> = {};
      let apiSuccessful = true;
      
      // Fetch all sensors if we don't have any yet
      if (sensors.length === 0) {
        try {
          const sensorsResponse = await axios.get(`${API_URL}/readings/sensors`);
          console.log('Sensor API response:', sensorsResponse.data);
          
          // Update sensors list
          setSensors(sensorsResponse.data);
          
          // Get saved sensor from localStorage
          const savedSensor = localStorage.getItem('selectedSensor');
          
          if (currentSelectedSensor === null) {
            // If no sensor is selected, try to use the saved one or default to the first one
            if (savedSensor && sensorsResponse.data.includes(savedSensor)) {
              setSelectedSensor(savedSensor);
            } else if (sensorsResponse.data.length > 0) {
              setSelectedSensor(sensorsResponse.data[0]);
              localStorage.setItem('selectedSensor', sensorsResponse.data[0]);
            }
          } else if (!sensorsResponse.data.includes(currentSelectedSensor) && sensorsResponse.data.length > 0) {
            // If the currently selected sensor is not in the new list, select the first one
            setSelectedSensor(sensorsResponse.data[0]);
            localStorage.setItem('selectedSensor', sensorsResponse.data[0]);
          }
          // If currentSelectedSensor exists in the new list, don't change it
        } catch (error) {
          console.log('API error - Using dummy sensor data', SENSOR_IDS.length, 'sensors');
          
          // Ensure we're using the latest sensor IDs from dummyData.js
          setSensors(SENSOR_IDS);
          
          // Keep existing selection if possible, otherwise use first sensor
          if (selectedSensor === null && SENSOR_IDS.length > 0) {
            const newSensor = SENSOR_IDS[0];
            setSelectedSensor(newSensor);
            selectedSensorRef.current = newSensor;
          } else if (selectedSensor && SENSOR_IDS.includes(selectedSensor)) {
            // Make sure the ref is updated to match current sensor
            selectedSensorRef.current = selectedSensor;
          } else if (SENSOR_IDS.length > 0) {
            // If current selection is not in the new sensor list, use the first one
            const newSensor = SENSOR_IDS[0];
            setSelectedSensor(newSensor);
            selectedSensorRef.current = newSensor;
          }
          apiSuccessful = false;
        }
      }
      
      // If we have sensors, try to fetch their readings
      if (apiSuccessful) {
        const currentSensors = sensors.length > 0 ? sensors : SENSOR_IDS;
        
        for (const sensorId of currentSensors) {
          try {
            const response = await axios.get(`${API_URL}/readings?sensorId=${sensorId}`);
            readingsData[sensorId] = response.data;
          } catch (error) {
            apiSuccessful = false;
            break;
          }
        }
      }
      
      // Use dummy data if API failed or no readings found
      if (!apiSuccessful || Object.keys(readingsData).length === 0) {
        console.log('Using dummy reading data for', SENSOR_IDS.length, 'sensors');
        const dummyReadings = generateDummyReadings() as Record<string, Reading[]>;
        
        // Make sure sensors state is updated with the latest SENSOR_IDS
        if (JSON.stringify(sensors) !== JSON.stringify(SENSOR_IDS)) {
          setSensors(SENSOR_IDS);
        }
        
        // Only update readings if they've actually changed
        setReadings(prevReadings => {
          if (JSON.stringify(prevReadings) !== JSON.stringify(dummyReadings)) {
            return dummyReadings;
          }
          return prevReadings;
        });
        
        // Use dummy events if no real events exist
        if (events.length === 0) {
          setEvents(generateDummyEvents());
          setAlertCount(generateDummyEvents().length);
        }
      } else {
        console.log('Using API data readings:', Object.keys(readingsData).length, 'sensors');
        // Only update readings if they've actually changed
        setReadings(prevReadings => {
          if (JSON.stringify(prevReadings) !== JSON.stringify(readingsData)) {
            return readingsData;
          }
          return prevReadings;
        });
      }
      
      // Update alert count by checking for threshold breaches in the new readings
      let newAlertCount = 0;
      Object.values(readingsData).forEach(sensorReadings => {
        if (sensorReadings.length > 0) {
          const latestReading = sensorReadings[sensorReadings.length - 1];
          if (
            (latestReading.turbidity && latestReading.turbidity > 70) ||
            (latestReading.vibration && latestReading.vibration > 0.15) ||
            (latestReading.tankLevel && latestReading.tankLevel < 20)
          ) {
            newAlertCount++;
          }
        }
      });
      
      if (newAlertCount > 0) {
        setAlertCount(newAlertCount);
      }
      
    } catch (error) {
      console.error('Error fetching readings:', error);
      
      // Fallback to dummy data
      const dummyReadings = generateDummyReadings() as Record<string, Reading[]>;
      
      // Make sure sensors state is updated with the latest SENSOR_IDS
      if (JSON.stringify(sensors) !== JSON.stringify(SENSOR_IDS)) {
        setSensors(SENSOR_IDS);
      }
      
      setReadings(dummyReadings);
      if (events.length === 0) {
        setEvents(generateDummyEvents());
      }
    } finally {
      // CRITICAL: Always restore the selected sensor and active tab that were saved at the beginning
      console.log('fetchReadings completed - Restoring tab state:', currentMetricTab, 'Sensor:', currentSelectedSensor);
      
      if (currentSelectedSensor && currentSelectedSensor !== selectedSensorRef.current) {
        setSelectedSensor(currentSelectedSensor);
        selectedSensorRef.current = currentSelectedSensor;
      }
      
      // Only restore the tab state if it actually changed during the fetch operation
      // or if it doesn't match what's currently in the ref
      if (currentMetricTab && activeMetricTabRef.current !== currentMetricTab) {
        console.log('Tab state changed during fetch, restoring to:', currentMetricTab);
        setActiveMetricTab(currentMetricTab);
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} text-white p-4 md:p-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with improved styling */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center">
              <div className="mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-blue-400">
                  <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                  <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                  <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Water Quality Monitor</h1>
                <div className={`flex items-center mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">{sensors.length} sensors online</span>
                  {alertCount > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="flex items-center text-sm text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        {alertCount} alerts
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {/* Home button */}
              <a 
                href="/" 
                className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </a>
              
              {/* Theme toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-700 text-yellow-300' : 'bg-blue-100 text-slate-700'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.06 1.06l1.06 1.06z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              {/* Wallet connection button */}
              {!isWalletConnected ? (
                <button
                  onClick={connectWallet}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                    theme === 'dark' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Connect Wallet
                </button>
              ) : (
                <div className={`flex items-center px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Wallet Connected
                </div>
              )}
            </div>
          </div>
        </header>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content area - 2/3 width on large screens */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sensor Map with improved height */}
              <GlassCard className={`${theme === 'dark' ? '' : 'bg-white/80 text-slate-800 border border-slate-200'}`}>
                <div className="h-[380px]">
                  <SensorMap
                    sensors={sensors}
                    readings={readings}
                    selectedSensor={selectedSensor}
                    onSensorSelect={handleSensorSelect}
                  />
                </div>
              </GlassCard>
              
              {/* Metrics Chart */}
              <GlassCard className={`${theme === 'dark' ? '' : 'bg-white/80 text-slate-800 border border-slate-200'}`}>
                <div className="h-[300px]">
                  {/* Don't use a key at all to prevent remounting */}
                  <MetricsChart 
                    selectedSensor={selectedSensor}
                    readings={readings}
                    activeMetricTab={activeMetricTab}
                    setActiveMetricTab={setActiveMetricTab}
                  />
                </div>
              </GlassCard>
            </div>
            
            {/* Sidebar - 1/3 width on large screens */}
            <div className="space-y-6">
              {/* Sensor Details */}
              <GlassCard className={`${theme === 'dark' ? '' : 'bg-white/80 text-slate-800 border border-slate-200'}`}>
                <div className="h-[380px]">
                  <SensorDetails
                    selectedSensor={selectedSensor}
                    sensors={sensors}
                    readings={readings}
                    onSensorSelect={handleSensorSelect}
                  />
                </div>
              </GlassCard>
              
              {/* Blockchain Events */}
              <GlassCard className={`${theme === 'dark' ? '' : 'bg-white/80 text-slate-800 border border-slate-200'}`}>
                <div className="h-[300px] flex flex-col">
                  <h2 className="text-lg font-semibold mb-3">Blockchain Events</h2>
                  <div className="flex-1 overflow-hidden">
                    <Timeline events={events} />
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
        
        <footer className={`mt-8 text-center text-sm pb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
          <p>Water Quality Monitoring System — {new Date().getFullYear()}</p>
          <p className="mt-1 text-xs">Secure monitoring with blockchain verification</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;