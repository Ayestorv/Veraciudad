import React, { useState, useEffect } from 'react';
import { USERS, BLOCKCHAIN_EVENTS } from '../../utils/garbageDummyData';
import GlassCard from '../GlassCard';

type User = {
  id: string;
  name: string;
  address: string;
  walletAddress: string;
  pointsBalance: number;
  finesBalance: number;
  onboardedAt: number;
};

type BlockchainEvent = {
  id: string;
  timestamp: number;
  txHash: string;
  eventType: string;
  userId?: string;
  bagId?: string;
  sensorId?: string;
  amount?: number;
  correct?: boolean;
  pointsAwarded?: number;
  fineAmount?: number;
};

const PointsDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [filteredEvents, setFilteredEvents] = useState<BlockchainEvent[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  
  // Load users and events
  useEffect(() => {
    setUsers(USERS);
    setEvents(BLOCKCHAIN_EVENTS);
  }, []);
  
  // Filter events based on selected user and event type
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
    
    // Sort by timestamp descending (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    setFilteredEvents(filtered);
  }, [events, selectedUser, eventTypeFilter]);
  
  // Get event icon
  const getEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'user-registration':
        return '👤';
      case 'bag-issuance':
        return '🛍️';
      case 'disposal':
        return '🗑️';
      case 'reward':
        return '🏆';
      case 'fine':
        return '💸';
      default:
        return '📝';
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  
  // Get user name by ID
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  
  // Get event description
  const getEventDescription = (event: BlockchainEvent): string => {
    const userName = event.userId ? getUserName(event.userId) : 'Unknown User';
    
    switch (event.eventType) {
      case 'user-registration':
        return `${userName} registered`;
      case 'bag-issuance':
        return `${userName} was issued a new bag`;
      case 'disposal':
        if (event.correct) {
          return `${userName} correctly disposed waste`;
        } else {
          return `${userName} incorrectly disposed waste`;
        }
      case 'reward':
        return `${userName} earned ${event.pointsAwarded} points`;
      case 'fine':
        return `${userName} was fined ${formatCurrency(event.fineAmount || 0)}`;
      default:
        return 'Unknown event';
    }
  };
  
  // Calculate total stats
  const getTotalStats = () => {
    const stats = {
      totalPoints: 0,
      totalFines: 0,
      totalUsers: users.length,
      totalDisposals: 0,
      correctDisposals: 0
    };
    
    users.forEach(user => {
      stats.totalPoints += user.pointsBalance;
      stats.totalFines += user.finesBalance;
    });
    
    events.forEach(event => {
      if (event.eventType === 'disposal') {
        stats.totalDisposals++;
        if (event.correct) {
          stats.correctDisposals++;
        }
      }
    });
    
    return stats;
  };
  
  const stats = getTotalStats();
  
  return (
    <div className="flex flex-col gap-5">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Points & Fines Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-3xl font-semibold text-blue-400">{stats.totalPoints}</div>
            <div className="text-xs text-gray-400">Total Points</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-3xl font-semibold text-red-400">${stats.totalFines}</div>
            <div className="text-xs text-gray-400">Total Fines</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-3xl font-semibold text-purple-400">{stats.totalUsers}</div>
            <div className="text-xs text-gray-400">Total Users</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-3xl font-semibold text-yellow-400">{stats.totalDisposals}</div>
            <div className="text-xs text-gray-400">Total Disposals</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-3xl font-semibold text-green-400">
              {stats.totalDisposals ? Math.round((stats.correctDisposals / stats.totalDisposals) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400">Correct Disposal Rate</div>
          </div>
        </div>
        
        {/* User Table */}
        <div className="w-full overflow-x-auto mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-gray-300">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-right">Points Balance</th>
                <th className="px-4 py-2 text-right">Fines Balance</th>
                <th className="px-4 py-2 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-700 hover:bg-slate-800 cursor-pointer"
                  onClick={() => setSelectedUser(user.id === selectedUser ? 'all' : user.id)}
                >
                  <td className="px-4 py-2">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{user.walletAddress}</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-blue-400 font-medium">{user.pointsBalance} pts</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-red-400 font-medium">${user.finesBalance}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={`font-medium ${
                      user.pointsBalance - user.finesBalance > 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {user.pointsBalance - user.finesBalance > 0 ? '+' : ''}
                      {user.pointsBalance - user.finesBalance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      
      {/* Blockchain Events Timeline */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Blockchain Timeline</h2>
          
          <div className="flex gap-2">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md p-1 text-sm text-white"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
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
        
        {filteredEvents.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No events to display
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map(event => (
              <div key={event.id} className="p-3 bg-slate-800 rounded-md">
                <div className="flex">
                  <div className="mr-3 text-2xl">{getEventIcon(event.eventType)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{getEventDescription(event)}</div>
                    <div className="text-xs text-gray-400">{formatDate(event.timestamp)}</div>
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
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default PointsDashboard; 