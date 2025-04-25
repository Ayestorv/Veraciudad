import React, { useState, useEffect } from 'react';
import { BIN_IDS, GARBAGE_BINS, BLOCKCHAIN_EVENTS, BAGS, USERS } from '../utils/garbageDummyData';
import { 
  getBins, 
  saveBins, 
  getBinIds, 
  saveBinIds, 
  getBlockchainEvents, 
  saveBlockchainEvents, 
  getBags, 
  saveBags, 
  getUsers, 
  saveUsers,
  type User,
  type Bag,
  type Bin,
  type BlockchainEvent
} from '../utils/garbageLocalStorage';
import GlassCard from '../components/GlassCard';
import UserOnboarding from '../components/garbage/UserOnboarding';
import BagAssignment from '../components/garbage/BagAssignment';
import BinScanner from '../components/garbage/BinScanner';
import PointsDashboard from '../components/garbage/PointsDashboard';
import GarbageTimeline from '../components/garbage/GarbageTimeline';

const GarbageManagement = () => {
  const [activeTab, setActiveTab] = useState<string>('userOnboarding');
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [binType, setBinType] = useState<string | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<BlockchainEvent[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  // MetaMask states
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [binIds, setBinIds] = useState<string[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  
  // Initialize localStorage and data on mount
  useEffect(() => {
    // Initialize localStorage with dummy data if it doesn't exist
    initializeLocalStorage();
    
    // Load data from localStorage
    const storedBinIds = getBinIds(BIN_IDS);
    const storedBins = getBins(GARBAGE_BINS);
    const storedEvents = getBlockchainEvents(BLOCKCHAIN_EVENTS);
    
    setBinIds(storedBinIds);
    setBins(storedBins);
    setEvents(storedEvents);
    
    // Initialize with first bin
    if (storedBinIds.length > 0) {
      setSelectedBin(storedBinIds[0]);
      
      // Get bin type from stored bins
      const binInfo = storedBins.find(bin => bin.id === storedBinIds[0]);
      if (binInfo) {
        setBinType(binInfo.binType);
      }
    }
    
    // Initialize filtered events
    setFilteredEvents(storedEvents);
    
    // Check if MetaMask is already connected
    checkIfWalletIsConnected();
  }, []);
  
  // Initialize localStorage with dummy data if empty
  const initializeLocalStorage = () => {
    // Check and initialize users
    const storedUsers = getUsers(null);
    if (!storedUsers || storedUsers.length === 0) {
      saveUsers(USERS);
    }
    
    // Check and initialize bags
    const storedBags = getBags(null);
    if (!storedBags || storedBags.length === 0) {
      saveBags(BAGS);
    }
    
    // Check and initialize bins
    const storedBins = getBins(null);
    if (!storedBins || storedBins.length === 0) {
      saveBins(GARBAGE_BINS);
    }
    
    // Check and initialize bin IDs
    const storedBinIds = getBinIds(null);
    if (!storedBinIds || storedBinIds.length === 0) {
      saveBinIds(BIN_IDS);
    }
    
    // Check and initialize blockchain events
    const storedEvents = getBlockchainEvents(null);
    if (!storedEvents || storedEvents.length === 0) {
      saveBlockchainEvents(BLOCKCHAIN_EVENTS);
    }
  };
  
  // Check if MetaMask is already connected
  const checkIfWalletIsConnected = async () => {
    try {
      // Check if window.ethereum is available (MetaMask installed)
      const { ethereum } = window as any;
      
      if (!ethereum) {
        console.log("MetaMask not installed!");
        return;
      }
      
      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        // User has previously authorized, we can grab the first account
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error checking if wallet is connected:", error);
    }
  };
  
  // Connect wallet handler
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      const { ethereum } = window as any;
      
      if (!ethereum) {
        setConnectionError("MetaMask not found! Please install MetaMask extension.");
        setIsConnecting(false);
        return;
      }
      
      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Set the first account as current account
      setAccount(accounts[0]);
      setIsConnecting(false);
      
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      setConnectionError(error.message || "Failed to connect to wallet");
      setIsConnecting(false);
    }
  };
  
  // Disconnect handler (for UI purposes only - doesn't actually disconnect MetaMask)
  const disconnectWallet = () => {
    setAccount(null);
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Filter events when filters change
  useEffect(() => {
    let filtered = [...events];
    
    // Filter by user
    if (selectedUser !== 'all') {
      filtered = filtered.filter(event => event.userId === selectedUser);
    }
    
    // Filter by event type
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }
    
    setFilteredEvents(filtered);
  }, [selectedUser, eventTypeFilter, events]);
  
  // Handle bin selection change
  const handleBinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const binId = e.target.value;
    setSelectedBin(binId);
    
    // Update bin type
    const binInfo = bins.find(bin => bin.id === binId);
    if (binInfo) {
      setBinType(binInfo.binType);
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'userOnboarding':
        return <UserOnboarding />;
      case 'bagAssignment':
        return <BagAssignment />;
      case 'binScanner':
        return (
          <div className="space-y-6">
            <GlassCard>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-4">Selected Bin for Manual Scanning</h2>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="binSelect" className="block text-sm font-medium text-gray-300 mb-1">
                      Bin ID
                    </label>
                    <select
                      id="binSelect"
                      value={selectedBin || ''}
                      onChange={handleBinChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
                    >
                      {binIds.map(binId => (
                        <option key={binId} value={binId}>
                          {binId}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Bin Type
                    </label>
                    <div className="bg-slate-800 border border-slate-700 rounded-md p-2 text-white capitalize">
                      {binType?.replace('-', ' ') || 'Unknown'}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-md p-2">
                      Online
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <BinScanner 
              selectedBin={selectedBin} 
              binType={binType}
            />
          </div>
        );
      case 'pointsDashboard':
        return <PointsDashboard />;
      case 'blockchainTimeline':
        return (
          <div className="space-y-6">
            <GlassCard>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Blockchain Registry Timeline</h2>
                
                <div className="flex gap-2">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-md p-2 text-white text-sm"
                  >
                    <option value="all">All Users</option>
                    {getUsers([]).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-md p-2 text-white text-sm"
                  >
                    <option value="all">All Events</option>
                    <option value="registration">Registration</option>
                    <option value="bagIssuance">Bag Issuance</option>
                    <option value="disposal">Disposal</option>
                    <option value="reward">Reward</option>
                    <option value="fine">Fine</option>
                  </select>
                </div>
              </div>
              
              <GarbageTimeline events={filteredEvents} />
            </GlassCard>
          </div>
        );
      default:
        return <UserOnboarding />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm p-4 border-b border-slate-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-green-400 mr-3">
              <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
              <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 11-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-white">Garbage Management System</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {connectionError && (
              <div className="text-red-400 text-sm">
                {connectionError}
              </div>
            )}
            
            {account ? (
              <div className="flex items-center">
                <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-full px-3 py-1 flex items-center mr-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">{formatAddress(account)}</span>
                </div>
                <button 
                  onClick={disconnectWallet} 
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className={`flex items-center px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors ${isConnecting ? 'opacity-50' : ''}`}
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" fill="currentColor"/>
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            )}
            
            <div className="flex space-x-3 items-center">
              {/* Home button */}
              <a href="/" className="text-gray-400 hover:text-white transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </a>
              
              {/* Garbage Dashboard link */}
              <a href="/test/garbage-dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Garbage Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex overflow-x-auto mb-8 border-b border-slate-700">
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'userOnboarding' 
                ? 'border-green-400 text-green-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('userOnboarding')}
          >
            User Onboarding
          </button>
          
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bagAssignment' 
                ? 'border-green-400 text-green-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('bagAssignment')}
          >
            Bag Assignment
          </button>
          
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'binScanner' 
                ? 'border-green-400 text-green-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('binScanner')}
          >
            Manual Bag Scanner
          </button>
          
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pointsDashboard' 
                ? 'border-green-400 text-green-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('pointsDashboard')}
          >
            Points Dashboard
          </button>
          
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'blockchainTimeline' 
                ? 'border-green-400 text-green-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('blockchainTimeline')}
          >
            Blockchain Registry
          </button>
        </div>
        
        {/* Tab content */}
        {renderTabContent()}
      </main>
    </div>
  );
};

export default GarbageManagement; 