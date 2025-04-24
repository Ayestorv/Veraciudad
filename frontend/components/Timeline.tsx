import React from 'react';

type BlockchainEvent = {
  sensorId: string;
  value: number;
  timestamp: number;
  txHash: string;
  metricType?: string;
};

type TimelineProps = {
  events: BlockchainEvent[];
};

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-300">
        <p>No blockchain events yet</p>
        <p className="text-sm mt-2">Events will appear here when readings are recorded on-chain</p>
      </div>
    );
  }

  // Helper to get metric type name
  const getMetricName = (event: BlockchainEvent): string => {
    if (event.metricType) return event.metricType;
    
    // Determine based on sensorId
    if (event.sensorId.includes('wq-sensor')) {
      return 'Turbidity';
    } else if (event.sensorId.includes('pump')) {
      return 'Flow Rate';
    } else if (event.sensorId.includes('tank')) {
      return 'Tank Level';
    } else if (event.sensorId.includes('valve')) {
      return 'Valve Position';
    } else if (event.sensorId.includes('env')) {
      return 'Rainfall';
    }
    
    return 'Measurement';
  };
  
  // Helper to get units
  const getMetricUnit = (event: BlockchainEvent): string => {
    const metricName = getMetricName(event);
    
    switch (metricName) {
      case 'Turbidity': return 'NTU';
      case 'Flow Rate': return 'L/min';
      case 'Tank Level': return '%';
      case 'Valve Position': return '% open';
      case 'Rainfall': return 'mm';
      default: return '';
    }
  };
  
  // Helper to get color class for the measurement
  const getValueColorClass = (event: BlockchainEvent): string => {
    const metricName = getMetricName(event);
    const value = event.value;
    
    if (metricName === 'Turbidity' && value > 70) return 'text-red-400';
    if (metricName === 'Turbidity' && value > 40) return 'text-yellow-400';
    if (metricName === 'Tank Level' && value < 30) return 'text-red-400';
    
    return 'text-green-400';
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="space-y-4">
        {events.map((event, index) => (
          <div 
            key={`${event.txHash}-${index}`}
            className="relative pl-6 border-l border-blue-500/50"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500"></div>
            
            {/* Event content */}
            <div className="mb-2">
              <h4 className="text-white text-sm font-medium">
                Reading from {event.sensorId}
              </h4>
              <p className="text-gray-300 text-xs">
                {new Date(event.timestamp).toLocaleString()}
              </p>
              <p className="text-white text-sm mt-1">
                {getMetricName(event)}: <span className={`font-medium ${getValueColorClass(event)}`}>
                  {event.value.toFixed(1)} {getMetricUnit(event)}
                </span>
              </p>
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

export default Timeline;
