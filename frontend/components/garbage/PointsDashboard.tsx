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
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(20);
  
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
  
  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);
  
  // Change page handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
        <div className="w-full overflow-x-auto">
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
              {currentUsers.map(user => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-700 hover:bg-slate-800 cursor-pointer"
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
        
        {users.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} users
          </div>
        )}
        
        {users.length > usersPerPage && renderPaginationControls()}
        
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>The blockchain timeline has been moved to the Blockchain Registry tab.</p>
          <p>Please check there for all detailed transaction history.</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default PointsDashboard; 