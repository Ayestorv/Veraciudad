import React, { useState, useEffect } from 'react';
import { USERS, BLOCKCHAIN_EVENTS } from '../../utils/garbageDummyData';
import { 
  getUsers, 
  getBlockchainEvents,
  type User,
  type BlockchainEvent
} from '../../utils/garbageLocalStorage';
import GlassCard from '../GlassCard';

const PointsDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(10);
  
  // Load users and events from localStorage or use dummy data
  useEffect(() => {
    const persistedUsers = getUsers(USERS);
    const persistedEvents = getBlockchainEvents(BLOCKCHAIN_EVENTS);
    
    setUsers(persistedUsers);
    setEvents(persistedEvents);
  }, []);
  
  // Calculate total stats
  const getTotalStats = () => {
    const stats = {
      totalPoints: 0,
      totalFines: 0,
      totalUsers: users.length,
      totalDisposals: 0,
      correctDisposals: 0,
      businessUsers: 0,
      citizenUsers: 0,
      averagePointsPerUser: 0,
      averageFinesPerUser: 0,
      topPointsHolder: { name: 'N/A', points: 0 },
      mostFined: { name: 'N/A', fines: 0 }
    };
    
    users.forEach(user => {
      stats.totalPoints += user.pointsBalance;
      stats.totalFines += user.finesBalance;
      
      // Count user types
      if (user.userType === 'business') {
        stats.businessUsers++;
      } else {
        stats.citizenUsers++;
      }
      
      // Track top points holder
      if (user.pointsBalance > stats.topPointsHolder.points) {
        stats.topPointsHolder = { name: user.name, points: user.pointsBalance };
      }
      
      // Track most fined user
      if (user.finesBalance > stats.mostFined.fines) {
        stats.mostFined = { name: user.name, fines: user.finesBalance };
      }
    });
    
    events.forEach(event => {
      if (event.eventType === 'disposal') {
        stats.totalDisposals++;
        if (event.correct) {
          stats.correctDisposals++;
        }
      }
    });
    
    // Calculate averages
    if (users.length > 0) {
      stats.averagePointsPerUser = Math.round(stats.totalPoints / users.length);
      stats.averageFinesPerUser = Math.round(stats.totalFines / users.length);
    }
    
    return stats;
  };
  
  // Filter users by type
  const filteredUsers = () => {
    if (filterType === 'all') return users;
    return users.filter(user => user.userType === filterType);
  };
  
  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers().slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers().length / usersPerPage);
  
  // Change page handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Get user recent activity (points and fines)
  const getUserActivity = (userId: string) => {
    return events
      .filter(event => event.userId === userId && 
        (event.eventType === 'reward' || event.eventType === 'fine'))
      .slice(0, 5); // Get 5 most recent
  };
  
  // Render pagination controls
  const renderPaginationControls = () => {
    const pageNumbers = [];
    
    // Show at most 5 page numbers (current, 2 before, 2 after, if available)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 text-sm rounded ${
            currentPage === 1 
              ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          &laquo;
        </button>
        
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 text-sm rounded ${
            currentPage === 1 
              ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          &lsaquo;
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-3 py-1 text-sm rounded ${
              currentPage === number 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {number}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 text-sm rounded ${
            currentPage === totalPages 
              ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          &rsaquo;
        </button>
        
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 text-sm rounded ${
            currentPage === totalPages 
              ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          &raquo;
        </button>
      </div>
    );
  };
  
  const stats = getTotalStats();
  
  return (
    <div className="flex flex-col gap-5">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Points & Fines Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
          <div className="bg-slate-800 p-3 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500/50 h-full w-1"></div>
            <div className="text-3xl font-semibold text-blue-400">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Points</div>
            <div className="text-sm text-blue-300 mt-1">{stats.averagePointsPerUser} avg/user</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500/50 h-full w-1"></div>
            <div className="text-3xl font-semibold text-red-400">${stats.totalFines.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Fines</div>
            <div className="text-sm text-red-300 mt-1">${stats.averageFinesPerUser} avg/user</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500/50 h-full w-1"></div>
            <div className="text-3xl font-semibold text-purple-400">{stats.totalUsers}</div>
            <div className="text-xs text-gray-400">Total Users</div>
            <div className="text-sm text-purple-300 mt-1">
              <span className="text-green-400">{stats.citizenUsers}</span> citizens, 
              <span className="text-indigo-400 ml-1">{stats.businessUsers}</span> businesses
            </div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500/50 h-full w-1"></div>
            <div className="text-3xl font-semibold text-yellow-400">{stats.totalDisposals}</div>
            <div className="text-xs text-gray-400">Total Disposals</div>
            <div className="text-sm text-yellow-300 mt-1">
              <span className="text-green-400">{stats.correctDisposals}</span> correct, 
              <span className="text-red-400 ml-1">{stats.totalDisposals - stats.correctDisposals}</span> incorrect
            </div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500/50 h-full w-1"></div>
            <div className="text-3xl font-semibold text-green-400">
              {stats.totalDisposals ? Math.round((stats.correctDisposals / stats.totalDisposals) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400">Disposal Compliance</div>
            <div className="text-sm text-green-300 mt-1">
              Goal: 95%
            </div>
          </div>
        </div>
        
        {/* Leaders Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-indigo-900/30 border border-indigo-900 p-3 rounded-lg">
            <h3 className="text-indigo-300 font-medium text-sm mb-1">Top Points Holder</h3>
            <div className="text-xl font-semibold text-white">{stats.topPointsHolder.name}</div>
            <div className="text-blue-400 font-semibold">{stats.topPointsHolder.points} points</div>
          </div>
          
          <div className="bg-red-900/30 border border-red-900 p-3 rounded-lg">
            <h3 className="text-red-300 font-medium text-sm mb-1">Most Fined User</h3>
            <div className="text-xl font-semibold text-white">{stats.mostFined.name}</div>
            <div className="text-red-400 font-semibold">${stats.mostFined.fines}</div>
          </div>
        </div>
        
        {/* User Type Filter */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md ${
              filterType === 'all' 
                ? 'bg-slate-600 text-white' 
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilterType('citizen')}
            className={`px-3 py-1 rounded-md ${
              filterType === 'citizen' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Citizens
          </button>
          <button
            onClick={() => setFilterType('business')}
            className={`px-3 py-1 rounded-md ${
              filterType === 'business' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Businesses
          </button>
        </div>
        
        {/* User Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-gray-300">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-center">Type</th>
                <th className="px-4 py-2 text-center">Points Balance</th>
                <th className="px-4 py-2 text-center">Fines Balance</th>
                <th className="px-4 py-2 text-center">Net Balance</th>
                <th className="px-4 py-2 text-left">Recent Activity</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-700 hover:bg-slate-800 cursor-pointer"
                >
                  <td className="px-4 py-2">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{user.walletAddress}</div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.userType === 'business'
                        ? 'bg-indigo-900/50 text-indigo-300'
                        : 'bg-green-900/50 text-green-300'
                    }`}>
                      {user.userType || 'citizen'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="font-medium text-blue-400">
                      {user.pointsBalance.toLocaleString()} pts
                    </div>
                    <div className="text-xs">
                      {Math.round(user.pointsBalance / (stats.totalPoints || 1) * 100)}% of total
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="font-medium text-red-400">
                      ${user.finesBalance.toLocaleString()}
                    </div>
                    <div className="text-xs">
                      {Math.round(user.finesBalance / (stats.totalFines || 1) * 100)}% of total
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`font-medium px-2 py-1 rounded ${
                      user.pointsBalance - user.finesBalance > 0 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {user.pointsBalance - user.finesBalance > 0 ? '+' : ''}
                      {user.pointsBalance - user.finesBalance}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                      {getUserActivity(user.id).map((activity, index) => (
                        <div 
                          key={index} 
                          className={`text-xs px-2 py-1 rounded-sm ${
                            activity.eventType === 'reward' 
                              ? 'bg-green-900/20 text-green-300' 
                              : 'bg-red-900/20 text-red-300'
                          }`}
                        >
                          {activity.eventType === 'reward' 
                            ? `+${activity.pointsAwarded || 0} pts` 
                            : `-$${activity.fineAmount || 0}`}
                          <span className="ml-1 text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {getUserActivity(user.id).length === 0 && (
                        <div className="text-xs text-gray-500">No recent activity</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers().length)} of {filteredUsers().length} users
          </div>
        )}
        
        {filteredUsers().length > usersPerPage && renderPaginationControls()}
      </GlassCard>
    </div>
  );
};

export default PointsDashboard; 