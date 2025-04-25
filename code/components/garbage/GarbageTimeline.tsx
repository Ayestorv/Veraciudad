import React, { useState, useEffect } from 'react';
import { type BlockchainEvent } from '../../utils/garbageLocalStorage';

// Remove type definition since we're importing it
// type GarbageBlockchainEvent = {
//   id: string;
//   timestamp: number;
//   txHash: string;
//   eventType: string;
//   userId?: string;
//   bagId?: string;
//   sensorId?: string;
//   amount?: number;
//   correct?: boolean;
//   pointsAwarded?: number;
//   fineAmount?: number;
// };

type GarbageTimelineProps = {
  events: BlockchainEvent[];
};

const GarbageTimeline: React.FC<GarbageTimelineProps> = ({ events }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [eventsPerPage] = useState<number>(5);
  
  // Reset to page 1 when events change
  useEffect(() => {
    setCurrentPage(1);
  }, [events]);
  
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300">
        <p>No blockchain events yet</p>
        <p className="text-sm mt-2">Events will appear here when actions are recorded on-chain</p>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);
  
  // Change page handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
      case 'fillLevelAlert':
        return '📊';
      case 'collectionConfirmed':
        return '♻️';
      case 'doorOpenAlert':
        return '🚪';
      case 'batteryLow':
        return '🔋';
      default:
        return '📝';
    }
  };
  
  // Helper to get color class for the event
  const getEventColorClass = (event: BlockchainEvent): string => {
    switch (event.eventType) {
      case 'disposal':
        return event.correct ? 'text-green-400' : 'text-red-400';
      case 'reward':
        return 'text-blue-400';
      case 'fine':
        return 'text-red-400';
      case 'fillLevelAlert':
        return 'text-yellow-400';
      case 'batteryLow':
        return 'text-red-400';
      case 'collectionConfirmed':
        return 'text-green-400';
      case 'doorOpenAlert':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  // Helper to format event description
  const getEventDescription = (event: BlockchainEvent): string => {
    switch (event.eventType) {
      case 'user-registration':
        return `User registered`;
      case 'bag-issuance':
        return `Bag issued: ${event.bagId}`;
      case 'disposal':
        return `Waste disposal: ${event.correct ? 'Correct' : 'Incorrect'}`;
      case 'reward':
        return `Reward: ${event.pointsAwarded} points`;
      case 'fine':
        return `Fine: $${event.fineAmount}`;
      case 'fillLevelAlert':
        return 'Fill level alert';
      case 'collectionConfirmed':
        return 'Bin emptied';
      case 'doorOpenAlert':
        return 'Door opened';
      case 'batteryLow':
        return 'Low battery';
      default:
        return event.eventType;
    }
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
      <div className="flex justify-center mt-6 space-x-2">
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
    <div className="h-full overflow-auto pr-2">
      <div className="space-y-4">
        {currentEvents.map((event, index) => (
          <div 
            key={`${event.txHash}-${index}`}
            className="relative pl-6 border-l border-green-500/50"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500"></div>
            
            {/* Event content */}
            <div className="mb-2">
              <div className="flex items-center">
                <span className="mr-2 text-xl">{getEventIcon(event.eventType)}</span>
                <h4 className="text-white text-sm font-medium">
                  {getEventDescription(event)}
                </h4>
              </div>
              <p className="text-gray-300 text-xs mt-1">
                {new Date(event.timestamp).toLocaleString()}
              </p>
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
              <a
                href={`https://etherscan.io/tx/${event.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline mt-1 inline-block"
              >
                View on Etherscan ↗
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {events.length > eventsPerPage && (
        <>
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, events.length)} of {events.length} events
          </div>
          {renderPaginationControls()}
        </>
      )}
    </div>
  );
};

export default GarbageTimeline; 