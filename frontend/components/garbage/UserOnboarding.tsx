import React, { useState, useEffect } from 'react';
import { USERS, blockchainAdapter } from '../../utils/garbageDummyData';
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

const UserOnboarding: React.FC = () => {
  // State for form inputs
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Load users on component mount
  useEffect(() => {
    setUsers([...USERS]);
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
      
      // Update local state
      setUsers(prevUsers => [newUser, ...prevUsers]);
      
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
    } catch (error) {
      console.error('Error registering user:', error);
      setErrorMessage(error.message || 'Failed to register user');
    } finally {
      setIsSubmitting(false);
    }
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
              {users.slice(0, 10).map((user) => (
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
        
        {users.length > 10 && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing 10 of {users.length} users
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default UserOnboarding; 