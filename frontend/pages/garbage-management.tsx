import React, { useState, useEffect } from 'react';
import { BIN_IDS, GARBAGE_BINS, BLOCKCHAIN_EVENTS } from '../utils/garbageDummyData';
import GlassCard from '../components/GlassCard';
import UserOnboarding from '../components/garbage/UserOnboarding';
import BagAssignment from '../components/garbage/BagAssignment';
import BinScanner from '../components/garbage/BinScanner';
import PointsDashboard from '../components/garbage/PointsDashboard';

const GarbageManagement = () => {
  const [activeTab, setActiveTab] = useState<string>('userOnboarding');
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [binType, setBinType] = useState<string | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  
  // Initialize with first bin on mount
  useEffect(() => {
    if (BIN_IDS.length > 0) {
      setSelectedBin(BIN_IDS[0]);
      
      // Get bin type from GARBAGE_BINS
      const binInfo = GARBAGE_BINS.find(bin => bin.id === BIN_IDS[0]);
      if (binInfo) {
        setBinType(binInfo.binType);
      }
    }
    
    // Initialize blockchain events
    setFilteredEvents(BLOCKCHAIN_EVENTS);
  }, []);
  
  // Filter events when filters change
  useEffect(() => {
    let filtered = [...BLOCKCHAIN_EVENTS];
    
    // Filter by user
    if (selectedUser !== 'all') {
      filtered = filtered.filter(event => event.userId === selectedUser);
    }
    
    // Filter by event type
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }
    
    setFilteredEvents(filtered);
  }, [selectedUser, eventTypeFilter]);
  
  // Handle bin selection change
  const handleBinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const binId = e.target.value;
    setSelectedBin(binId);
    
    // Update bin type
    const binInfo = GARBAGE_BINS.find(bin => bin.id === binId);
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
                      {BIN_IDS.map(binId => (
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
                    className="bg-slate-800 border border-slate-700 rounded-md p-1 text-sm text-white"
                  >
                    <option value="all">All Users</option>
                    {Array.from(new Set(BLOCKCHAIN_EVENTS.map(event => event.userId)))
                      .filter(Boolean)
                      .map(userId => {
                        const userEvent = BLOCKCHAIN_EVENTS.find(e => e.userId === userId);
                        const userName = userEvent?.userId || 'Unknown';
                        return (
                          <option key={userId} value={userId}>{userName}</option>
                        );
                      })}
                  </select>
                  
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-md p-1 text-sm text-white"
                  >
                    <option value="all">All Events</option>
                    <option value="user-registration">User Registration</option>
                    <option value="bag-issuance">Bag Issuance</option>
                    <option value="disposal">Disposal</option>
                    <option value="reward">Rewards</option>
                    <option value="fine">Fines</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-300 text-sm mb-4">
                  Viewing all blockchain events and registry entries in the waste management system. 
                  Each entry represents an immutable record on the blockchain.
                </p>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredEvents.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No events to display
                    </div>
                  ) : (
                    filteredEvents.map(event => (
                      <div key={event.id} className="p-3 bg-slate-800 rounded-md">
                        <div className="flex">
                          <div className="mr-3 text-2xl">
                            {event.eventType === 'user-registration' && '👤'}
                            {event.eventType === 'bag-issuance' && '🛍️'}
                            {event.eventType === 'disposal' && '🗑️'}
                            {event.eventType === 'reward' && '🏆'}
                            {event.eventType === 'fine' && '💸'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {event.eventType === 'user-registration' && `User registered: ${event.userId}`}
                              {event.eventType === 'bag-issuance' && `Bag issued: ${event.bagId} to ${event.userId}`}
                              {event.eventType === 'disposal' && `Waste disposal: ${event.correct ? 'Correct' : 'Incorrect'} by ${event.userId}`}
                              {event.eventType === 'reward' && `Reward issued: ${event.pointsAwarded} points to ${event.userId}`}
                              {event.eventType === 'fine' && `Fine issued: $${event.fineAmount} to ${event.userId}`}
                            </div>
                            <div className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</div>
                            <div className="flex mt-1">
                              {event.eventType === 'disposal' && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  event.correct
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}>
                                  {event.correct ? 'Correct' : 'Incorrect'} Disposal
                                </span>
                              )}
                              {event.eventType === 'reward' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                                  +{event.pointsAwarded} Points
                                </span>
                              )}
                              {event.eventType === 'fine' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                                  ${event.fineAmount} Fine
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <a 
                              href={`https://etherscan.io/tx/${event.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="text-xs text-blue-400 hover:underline"
                            >
                              View Transaction ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
          
          <div>
            <a href="/test/garbage-dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Garbage Dashboard
            </a>
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