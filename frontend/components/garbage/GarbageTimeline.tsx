import React from 'react';

type GarbageBlockchainEvent = {
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

type GarbageTimelineProps = {
  events: GarbageBlockchainEvent[];
};

const GarbageTimeline: React.FC<GarbageTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300">
        <p>No blockchain events yet</p>
        <p className="text-sm mt-2">Events will appear here when actions are recorded on-chain</p>
      </div>
    );
  }

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
  const getEventColorClass = (event: GarbageBlockchainEvent): string => {
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
  const getEventDescription = (event: GarbageBlockchainEvent): string => {
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

  return (
    <div className="h-full overflow-auto pr-2">
      <div className="space-y-4">
        {events.map((event, index) => (
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
    </div>
  );
};

export default GarbageTimeline; 