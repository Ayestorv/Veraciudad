import React, { useState, useMemo } from 'react';

// Enhanced Reading type with all possible metrics
type Reading = {
  sensorId: string;
  timestamp: number;
  sensorType: string;
  latitude?: number;
  longitude?: number;
  txHash?: string;
  
  // Water Quality
  turbidity?: number;
  pH?: number;
  temperature?: number;
  conductivity?: number;
  tds?: number;
  dissolvedOxygen?: number;
  chlorineResidual?: number;
  orp?: number;
  nitrates?: number;
  phosphates?: number;
  ammonia?: number;
  hardness?: number;
  
  // Flow & Hydraulic
  flowRate?: number;
  pressure?: number;
  velocity?: number;
  cumulativeVolume?: number;
  
  // Tank
  tankLevel?: number;
  waterDepth?: number;
  currentVolume?: number;
  
  // Pump
  pumpStatus?: boolean;
  runtime?: number;
  startStopCount?: number;
  motorCurrent?: number;
  motorVoltage?: number;
  vibration?: number;
  bearingTemperature?: number;
  energyConsumption?: number;
  
  // Valve
  valvePosition?: number;
  
  // Network & Environmental
  signalStrength?: number;
  uptime?: number;
  batteryLevel?: number;
  rainfall?: number;
  ambientTemperature?: number;
  humidity?: number;
  soilMoisture?: number;
};

type SensorMapProps = {
  sensors: string[];
  readings: Record<string, Reading[]>;
  selectedSensor: string | null;
  onSensorSelect: (sensorId: string) => void;
};

// Enhanced map with different sensor types and visualizations
const SensorMap: React.FC<SensorMapProps> = ({ 
  sensors, 
  readings, 
  selectedSensor, 
  onSensorSelect 
}) => {
  const [mapMode, setMapMode] = useState<string>('all');
  
  // Get the latest reading for each sensor
  const getLatestReading = (sensorId: string): Reading | null => {
    const sensorReadings = readings[sensorId];
    if (!sensorReadings || sensorReadings.length === 0) {
      return null;
    }
    return sensorReadings[sensorReadings.length - 1];
  };

  // Cache sensor types to make the component less sensitive to reading updates
  const sensorTypes = useMemo(() => {
    const types: Record<string, string> = {};
    sensors.forEach(sensorId => {
      const reading = getLatestReading(sensorId);
      types[sensorId] = reading?.sensorType || 'unknown';
    });
    return types;
  }, [sensors, readings]); // Include readings for initial type detection, but not for position updates

  // Get sensor type from the cached map
  const getSensorType = (sensorId: string): string => {
    return sensorTypes[sensorId] || 'unknown';
  };

  // Determine the color based on water quality parameters
  const getWaterQualityColor = (reading: Reading | null): string => {
    if (!reading) return '#888888'; // Gray for no data
    
    // Prioritize critical parameters
    if (reading.pH && (reading.pH < 6.5 || reading.pH > 8.5)) return '#DC3545'; // Red for bad pH
    if (reading.turbidity && reading.turbidity > 60) return '#DC3545'; // Red for high turbidity
    if (reading.chlorineResidual && reading.chlorineResidual < 0.2) return '#DC3545'; // Red for low chlorine
    
    // Check for warning thresholds
    if (reading.pH && (reading.pH < 6.8 || reading.pH > 8.0)) return '#FFC107'; // Yellow for borderline pH
    if (reading.turbidity && reading.turbidity > 30) return '#FFC107'; // Yellow for moderate turbidity
    if (reading.tds && reading.tds > 500) return '#FFC107'; // Yellow for high TDS
    
    return '#28A745'; // Green for good parameters
  };

  // Determine color for pump status
  const getPumpColor = (reading: Reading | null): string => {
    if (!reading) return '#888888'; // Gray for no data
    
    if (reading.pumpStatus === true) {
      // Running pump - check for issues
      if (reading.vibration && reading.vibration > 0.15) return '#DC3545'; // Red for high vibration
      if (reading.bearingTemperature && reading.bearingTemperature > 55) return '#DC3545'; // Red for high temp
      return '#28A745'; // Green for healthy running pump
    } else {
      return '#6c757d'; // Dark gray for stopped pump
    }
  };

  // Determine color for tank level
  const getTankLevelColor = (reading: Reading | null): string => {
    if (!reading || reading.tankLevel === undefined) return '#888888'; // Gray for no data
    
    const level = reading.tankLevel;
    if (level < 20) return '#DC3545'; // Red for low level
    if (level < 40) return '#FFC107'; // Yellow for medium-low level
    return '#28A745'; // Green for good level
  };

  // Determine color for valve status
  const getValveColor = (reading: Reading | null): string => {
    if (!reading || reading.valvePosition === undefined) return '#888888'; // Gray for no data
    
    // For valves, we use blue when open and gray when closed
    const position = reading.valvePosition;
    if (position < 5) return '#6c757d'; // Almost closed
    if (position > 90) return '#007BFF'; // Almost fully open
    return '#17a2b8'; // Partially open
  };

  // Get primary metric to display based on sensor type
  const getPrimaryMetric = (reading: Reading | null): { value: string, label: string } => {
    if (!reading) return { value: 'N/A', label: '' };
    
    switch (reading.sensorType) {
      case 'water-quality':
        return { 
          value: reading.turbidity?.toFixed(1) || 'N/A', 
          label: 'NTU' 
        };
      case 'pump':
        return { 
          value: reading.pumpStatus ? 'ON' : 'OFF',
          label: reading.flowRate ? `${reading.flowRate.toFixed(0)} L/m` : ''
        };
      case 'tank':
        return { 
          value: reading.tankLevel?.toFixed(0) || 'N/A',
          label: '%'
        };
      case 'valve':
        return { 
          value: reading.valvePosition?.toFixed(0) || 'N/A',
          label: '% open'
        };
      case 'environmental':
        return { 
          value: reading.rainfall?.toFixed(1) || 'N/A',
          label: 'mm'
        };
      default:
        return { value: 'N/A', label: '' };
    }
  };

  // Get the appropriate icon based on sensor type
  const getSensorIcon = (sensorType: string, reading: Reading | null, sensorId: string): JSX.Element => {
    const isSelected = sensorId === selectedSensor;
    
    switch (sensorType) {
      case 'water-quality':
        return (
          <circle
            r={isSelected ? 12 : 8}
            fill={getWaterQualityColor(reading)}
            stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
            strokeWidth={isSelected ? 3 : 1}
          />
        );
      case 'pump':
        return (
          <g>
            <rect
              x={isSelected ? -14 : -10}
              y={isSelected ? -14 : -10}
              width={isSelected ? 28 : 20}
              height={isSelected ? 28 : 20}
              rx="4"
              fill={getPumpColor(reading)}
              stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
              strokeWidth={isSelected ? 3 : 1}
            />
            {/* Simple pump icon */}
            <path
              d={isSelected ? 
                "M-7,-3 L-7,3 L0,3 L0,7 L7,0 L0,-7 L0,-3 Z" : 
                "M-5,-2 L-5,2 L0,2 L0,5 L5,0 L0,-5 L0,-2 Z"}
              fill="white"
            />
          </g>
        );
      case 'tank':
        const tankLevel = reading?.tankLevel || 0;
        const tankHeight = isSelected ? 24 : 18;
        const tankWidth = isSelected ? 20 : 16;
        const tankX = isSelected ? -10 : -8;
        const tankY = isSelected ? -12 : -9;
        const fillHeight = (tankLevel / 100) * tankHeight;
        const fillY = tankY + tankHeight - fillHeight;
        
        return (
          <g>
            {/* Tank outline */}
            <rect
              x={tankX}
              y={tankY}
              width={tankWidth}
              height={tankHeight}
              rx="2"
              fill="none"
              stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
              strokeWidth={isSelected ? 3 : 1}
            />
            {/* Tank fill level */}
            <rect
              x={tankX}
              y={fillY}
              width={tankWidth}
              height={fillHeight}
              rx="2"
              fill={getTankLevelColor(reading)}
            />
          </g>
        );
      case 'valve':
        return (
          <g>
            <polygon
              points={isSelected ? "-12,0 0,-12 12,0 0,12" : "-9,0 0,-9 9,0 0,9"}
              fill={getValveColor(reading)}
              stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
              strokeWidth={isSelected ? 3 : 1}
            />
            {/* Valve position indicator */}
            {reading?.valvePosition !== undefined && (
              <line
                x1="0"
                y1="0"
                x2={Math.cos((reading.valvePosition / 100) * Math.PI) * (isSelected ? 8 : 6)}
                y2={Math.sin((reading.valvePosition / 100) * Math.PI) * (isSelected ? 8 : 6)}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      case 'environmental':
        return (
          <g>
            <polygon
              points={isSelected ? "0,-12 -10,6 10,6" : "0,-9 -8,4 8,4"}
              fill="#17a2b8"
              stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
              strokeWidth={isSelected ? 3 : 1}
            />
            {/* Raindrops */}
            <path
              d={isSelected ? 
                "M-4,0 Q-4,3 -2,3 Q0,3 0,0 Q0,-3 -2,-3 Q-4,-3 -4,0 M4,0 Q4,3 6,3 Q8,3 8,0 Q8,-3 6,-3 Q4,-3 4,0" : 
                "M-3,0 Q-3,2 -1.5,2 Q0,2 0,0 Q0,-2 -1.5,-2 Q-3,-2 -3,0 M3,0 Q3,2 4.5,2 Q6,2 6,0 Q6,-2 4.5,-2 Q3,-2 3,0"}
              fill="#007BFF"
            />
          </g>
        );
      default:
        return (
          <circle
            r={isSelected ? 12 : 8}
            fill="#888888"
            stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
            strokeWidth={isSelected ? 3 : 1}
          />
        );
    }
  };

  // Calculate display positions for sensors - memoized with stable dependencies
  const calculateSensorPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    // Organize by sensor types
    const sensorsByType: Record<string, string[]> = {};
    
    sensors.forEach(sensorId => {
      const type = getSensorType(sensorId);
      if (!sensorsByType[type]) {
        sensorsByType[type] = [];
      }
      sensorsByType[type].push(sensorId);
    });
    
    // Basic layout grid - simplfied for fixed positions
    const grid = {
      'water-quality': { startX: 100, startY: 80, spacingX: 80, spacingY: 60, cols: 3 },
      'pump': { startX: 150, startY: 160, spacingX: 100, spacingY: 50, cols: 2 },
      'tank': { startX: 100, startY: 230, spacingX: 80, spacingY: 60, cols: 2 },
      'valve': { startX: 250, startY: 220, spacingX: 70, spacingY: 50, cols: 2 },
      'environmental': { startX: 320, startY: 80, spacingX: 60, spacingY: 50, cols: 1 },
      'unknown': { startX: 200, startY: 150, spacingX: 50, spacingY: 50, cols: 2 }
    };
    
    // Position each sensor based on type - using a more stable approach
    Object.entries(sensorsByType).forEach(([type, sensorIds]) => {
      const layout = grid[type] || grid['unknown'];
      
      sensorIds.forEach((sensorId, index) => {
        const col = index % layout.cols;
        const row = Math.floor(index / layout.cols);
        
        // Use simple grid layout for demo purposes - more reliable than trying
        // to convert lat/lng for this demo
        const x = layout.startX + (col * layout.spacingX);
        const y = layout.startY + (row * layout.spacingY);
        
        positions[sensorId] = { x, y };
      });
    });
    
    return positions;
  }, [sensors, getSensorType]); // Only recalculate when sensors array or types change

  // Filter sensors based on current map mode
  const filteredSensors = useMemo(() => {
    return mapMode === 'all' 
      ? sensors 
      : sensors.filter(sensorId => getSensorType(sensorId) === mapMode);
  }, [sensors, mapMode, sensorTypes]); // Add sensorTypes as dependency instead of recalculating

  // Now calculateSensorPositions is the actual positions, not a function
  const sensorPositions = calculateSensorPositions;

  // Create stable filtered sensor positions
  const filteredSensorPositions = useMemo(() => {
    return Object.fromEntries(
      filteredSensors.map(sensorId => [
        sensorId, 
        sensorPositions[sensorId] || { x: 200, y: 150 }
      ])
    );
  }, [filteredSensors, sensorPositions]);

  // Render sensors with simple rendered dots and more visibility
  return (
    <div className="w-full h-full bg-white/5 rounded-lg overflow-hidden relative">
      {/* Layer control buttons */}
      <div className="flex flex-wrap gap-1 mb-2 px-2">
        <button 
          className={`text-xs px-2 py-1 rounded ${mapMode === 'all' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
          onClick={() => setMapMode('all')}
        >
          All
        </button>
        <button 
          className={`text-xs px-2 py-1 rounded ${mapMode === 'water-quality' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
          onClick={() => setMapMode('water-quality')}
        >
          Water Quality
        </button>
        <button 
          className={`text-xs px-2 py-1 rounded ${mapMode === 'pump' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
          onClick={() => setMapMode('pump')}
        >
          Pumps
        </button>
        <button 
          className={`text-xs px-2 py-1 rounded ${mapMode === 'tank' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
          onClick={() => setMapMode('tank')}
        >
          Tanks
        </button>
        <button 
          className={`text-xs px-2 py-1 rounded ${mapMode === 'valve' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
          onClick={() => setMapMode('valve')}
        >
          Valves
        </button>
      </div>
      
      {/* Debug overlay */}
      {sensors.length === 0 && (
        <div className="absolute top-10 left-0 right-0 text-center text-white bg-red-500/50 p-2">
          No sensors available
        </div>
      )}
      
      <svg width="100%" height="calc(100% - 28px)" viewBox="0 0 400 300">
        {/* Background with water network */}
        <rect
          x="0"
          y="0"
          width="400"
          height="300"
          fill="#1e293b"
        />
        
        <path
          d="M50,150 C100,100 200,200 350,150 L350,250 C200,300 100,200 50,250 Z"
          fill="#0066AA"
          fillOpacity="0.2"
          stroke="#0066AA"
          strokeWidth="2"
        />
        
        {/* Flow pipes - simplified network */}
        <path
          d="M100,80 L150,160 L100,230 M300,150 L250,220 M150,160 L250,220 M320,80 L300,150"
          stroke="#0066AA"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.6"
          fill="none"
        />

        {/* Fallback sensors if no positions calculated */}
        {filteredSensors.length > 0 && Object.keys(sensorPositions).length === 0 && (
          <g>
            {filteredSensors.map((sensorId, idx) => {
              // Simple grid layout
              const col = idx % 3;
              const row = Math.floor(idx / 3);
              const x = 100 + (col * 100);
              const y = 100 + (row * 70);
              const reading = getLatestReading(sensorId);
              const sensorType = sensorTypes[sensorId] || 'unknown';
              const isSelected = sensorId === selectedSensor;
              
              return (
                <g 
                  key={`fallback-${sensorId}`} 
                  transform={`translate(${x}, ${y})`}
                  onClick={() => onSensorSelect(sensorId)}
                  style={{ cursor: 'pointer' }}
                >
                  {getSensorIcon(sensorType, reading, sensorId)}
                  <text
                    y="20"
                    textAnchor="middle"
                    fill="white"
                    fontSize={isSelected ? "12" : "10"}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {sensorId.split('-').pop()}
                  </text>
                  <text
                    y="35"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    {getPrimaryMetric(reading).value} {getPrimaryMetric(reading).label}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Render sensors with positions */}
        {filteredSensors.map(sensorId => {
          const position = sensorPositions[sensorId] || { x: 200, y: 150 };
          const reading = getLatestReading(sensorId);
          const sensorType = sensorTypes[sensorId] || 'unknown';
          const isSelected = sensorId === selectedSensor;
          const primaryMetric = getPrimaryMetric(reading);

          return (
            <g 
              key={sensorId} 
              transform={`translate(${position.x}, ${position.y})`}
              onClick={() => onSensorSelect(sensorId)}
              style={{ cursor: 'pointer' }}
            >
              {/* Highlight selected sensor */}
              {isSelected && (
                <circle
                  r="20"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              )}
              
              {/* Render appropriate sensor icon */}
              {getSensorIcon(sensorType, reading, sensorId)}
              
              {/* Sensor ID */}
              <text
                y="20"
                textAnchor="middle"
                fill="white"
                fontSize={isSelected ? "12" : "10"}
                fontWeight={isSelected ? 'bold' : 'normal'}
              >
                {sensorId.split('-').pop()}
              </text>
              
              {/* Primary metric value */}
              <text
                y="35"
                textAnchor="middle"
                fill="white"
                fontSize="10"
              >
                {primaryMetric.value} {primaryMetric.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SensorMap;
