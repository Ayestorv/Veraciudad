import React, { useState, useEffect } from 'react';
import { USERS, BAGS, blockchainAdapter } from '../../utils/garbageDummyData';
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

type Bag = {
  id: string;
  userId: string;
  bagType: string;
  qrCode: string;
  rfid: string;
  issuedAt: number;
  txHash: string;
};

const BagAssignment: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bags, setBags] = useState<Bag[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [filteredBags, setFilteredBags] = useState<Bag[]>([]);
  const [bagType, setBagType] = useState<string>('general-waste');
  const [issuingBag, setIssuingBag] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Load users and bags on component mount
  useEffect(() => {
    setUsers([...USERS]);
    setBags([...BAGS]);
  }, []);
  
  // Filter bags when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      setFilteredBags(bags.filter(bag => bag.userId === selectedUserId));
    } else {
      setFilteredBags(bags.slice(0, 20)); // Show first 20 bags when no user is selected
    }
  }, [selectedUserId, bags]);
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get user by ID
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId) || null;
  };
  
  // Style for bag type badge
  const getBagTypeBadge = (type: string) => {
    switch (type) {
      case 'general-waste':
        return 'bg-gray-500/30 text-gray-300';
      case 'recyclable':
        return 'bg-blue-500/30 text-blue-300';
      case 'organic':
        return 'bg-green-500/30 text-green-300';
      default:
        return 'bg-purple-500/30 text-purple-300';
    }
  };
  
  // Handle issuing a new bag
  const handleIssueBag = async () => {
    if (!selectedUserId) {
      setErrorMessage('Please select a user first');
      return;
    }
    
    setIssuingBag(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Determine next bag number for this user
      const userBags = bags.filter(bag => bag.userId === selectedUserId);
      const nextBagNumber = userBags.length + 1;
      
      // Create new bag data
      const newBagData = {
        id: `bag-${selectedUserId.split('-')[1]}-${nextBagNumber.toString().padStart(2, '0')}`,
        userId: selectedUserId,
        bagType,
        qrCode: `QR-${Math.random().toString(36).substring(2, 14)}`,
        rfid: `RFID-${Math.random().toString(36).substring(2, 18)}`
      };
      
      // Call blockchain adapter to issue bag
      const newBag = blockchainAdapter.issueBag(newBagData);
      
      // Update local state
      setBags(prevBags => [newBag, ...prevBags]);
      
      // Update filtered bags
      if (selectedUserId) {
        setFilteredBags(prevFiltered => [newBag, ...prevFiltered]);
      }
      
      // Show success message
      const user = getUserById(selectedUserId);
      setSuccessMessage(`Successfully issued a new ${bagType} bag to ${user?.name || selectedUserId}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error issuing bag:', error);
      setErrorMessage(error.message || 'Failed to issue bag');
    } finally {
      setIssuingBag(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Issue New Bag</h2>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-300 mb-1">
              Select User
            </label>
            <select
              id="selectedUser"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.id})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="bagType" className="block text-sm font-medium text-gray-300 mb-1">
              Bag Type
            </label>
            <select
              id="bagType"
              value={bagType}
              onChange={(e) => setBagType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
            >
              <option value="general-waste">General Waste</option>
              <option value="recyclable">Recyclable</option>
              <option value="organic">Organic</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleIssueBag}
              disabled={issuingBag || !selectedUserId}
              className={`w-full py-2 px-4 rounded-md ${
                issuingBag || !selectedUserId
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-medium transition-colors`}
            >
              {issuingBag ? 'Issuing...' : 'Issue New Bag'}
            </button>
          </div>
        </div>
        
        {selectedUserId && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-md">
            <h3 className="text-md font-medium text-white mb-2">Selected User Details</h3>
            {(() => {
              const user = getUserById(selectedUserId);
              if (!user) return <p className="text-gray-400">User not found</p>;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span> {user.name}
                  </div>
                  <div>
                    <span className="text-gray-400">ID:</span> {user.id}
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400">Address:</span> {user.address}
                  </div>
                  <div>
                    <span className="text-gray-400">Points:</span> <span className="text-green-400">{user.pointsBalance} pts</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fines:</span> <span className="text-red-400">${user.finesBalance}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </GlassCard>
      
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedUserId 
              ? `Bags for ${getUserById(selectedUserId)?.name || selectedUserId}` 
              : 'All Issued Bags'}
          </h2>
          <div className="flex items-center">
            {selectedUserId && (
              <button
                onClick={() => setSelectedUserId('')}
                className="mr-3 text-sm text-gray-400 hover:text-white"
              >
                Clear Filter
              </button>
            )}
            <div className="text-sm text-gray-400">
              {selectedUserId 
                ? `Showing ${filteredBags.length} bags` 
                : `Showing 20 of ${bags.length} bags`}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Bag ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  RFID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Issued At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  On-chain
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredBags.map((bag) => (
                <tr key={bag.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {bag.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {getUserById(bag.userId)?.name || bag.userId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getBagTypeBadge(bag.bagType)}`}>
                      {bag.bagType.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 font-mono">
                    {bag.qrCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 font-mono">
                    {bag.rfid}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(bag.issuedAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-400">
                    <a
                      href={`https://etherscan.io/tx/${bag.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View on Etherscan ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBags.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No bags found for the selected criteria
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default BagAssignment; 