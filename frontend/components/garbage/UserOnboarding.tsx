import React, { useState, useEffect } from 'react';
import { USERS, blockchainAdapter } from '../../utils/garbageDummyData';
import { 
  getUsers, 
  saveUsers, 
  addBlockchainEvent, 
  getBlockchainEvents, 
  saveBlockchainEvents,
  type User,
  type BlockchainEvent
} from '../../utils/garbageLocalStorage';
import GlassCard from '../GlassCard';

const UserOnboarding: React.FC = () => {
  // State for form inputs
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(5);
  
  // Load users from localStorage or initialize with dummy data on component mount
  useEffect(() => {
    const persistedUsers = getUsers(USERS);
    setUsers(persistedUsers);
  }, []);
  
  // Generate a random wallet address
  const generateRandomWallet = () => {
    const characters = '0123456789abcdef';
    let wallet = '0x';
    for (let i = 0; i < 40; i++) {
      wallet += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setWalletAddress(wallet);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      if (!name || !address || !walletAddress) {
        throw new Error('All fields are required');
      }
      
      // Call blockchain adapter to register user
      const newUser = blockchainAdapter.registerUser({
        name,
        address,
        walletAddress,
        pointsBalance: 0,
        finesBalance: 0
      });
      
      // Update local state with the new user
      const updatedUsers = [newUser, ...users];
      setUsers(updatedUsers);
      
      // Persist to localStorage
      saveUsers(updatedUsers);
      
      // Add user registration event to blockchain events
      const events = getBlockchainEvents([]);
      const registrationEvent = {
        id: `event-${events.length + 1}`,
        timestamp: newUser.onboardedAt,
        txHash: newUser.txHash,
        eventType: 'user-registration',
        userId: newUser.id
      };
      
      saveBlockchainEvents([registrationEvent, ...events]);
      
      // Reset form
      setName('');
      setAddress('');
      setWalletAddress('');
      
      // Show success message
      setSuccessMessage(`User ${newUser.name} successfully registered with ID: ${newUser.id}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      // Set to first page to see the new user
      setCurrentPage(1);
    } catch (error) {
      console.error('Error registering user:', error);
      setErrorMessage(error.message || 'Failed to register user');
    } finally {
      setIsSubmitting(false);
    }
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
  
  return (
    <div className="flex flex-col space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Register New User</h2>
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-300">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
              Home Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
              placeholder="Enter home address"
            />
          </div>
          
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-1">
              Wallet Address
            </label>
            <div className="flex">
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-l-md p-2 text-white"
                placeholder="Enter Ethereum wallet address"
              />
              <button
                type="button"
                onClick={generateRandomWallet}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-r-md"
              >
                Generate
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded-md ${
                isSubmitting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-medium transition-colors`}
            >
              {isSubmitting ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </form>
      </GlassCard>
      
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Registered Users</h2>
          <div className="text-sm text-gray-400">
            Total: {users.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fines
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Onboarded
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {user.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {user.address.length > 25 ? `${user.address.substring(0, 25)}...` : user.address}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {`${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-400">
                    {user.pointsBalance} pts
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-400">
                    ${user.finesBalance}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {new Date(user.onboardedAt).toLocaleDateString()}
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
      </GlassCard>
    </div>
  );
};

export default UserOnboarding; 