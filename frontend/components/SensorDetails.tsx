import React from 'react';

// Define the Reading type
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
  
  // Garbage
  fillLevel?: number;
  doorOpen?: boolean;
  lastCollectionTimestamp?: number;
  binType?: string;
};

type SensorDetailsProps = {
  selectedSensor: string | null;
  sensors: string[];
  readings: Record<string, Reading[]>;
  onSensorSelect: (sensorId: string) => void;
};

const SensorDetails: React.FC<SensorDetailsProps> = ({
  selectedSensor,
  sensors,
  readings,
  onSensorSelect
}) => {
  // Memoize the sensor type to prevent unnecessary recalculations on refresh
  const getSensorType = React.useCallback((sensorId: string): string => {
    if (!sensorId || !readings[sensorId] || readings[sensorId].length === 0) return 'unknown';
    return readings[sensorId][0].sensorType || 'unknown';
  }, [readings]);
  
  // Get the latest reading for the selected sensor
  const getLatestReading = (): Reading | null => {
    if (!selectedSensor || !readings[selectedSensor] || readings[selectedSensor].length === 0) {
      return null;
    }
    return readings[selectedSensor][readings[selectedSensor].length - 1];
  };

  // Get human-readable sensor type label
  const getSensorTypeLabel = (sensorType: string): string => {
    switch (sensorType) {
      case 'water-quality': return 'Water Quality Sensor';
      case 'pump': return 'Pump Station';
      case 'tank': return 'Storage Tank';
      case 'valve': return 'Control Valve';
      case 'environmental': return 'Environment Monitor';
      case 'garbage': return 'Garbage Bin Sensor';
      default: return 'Unknown Sensor';
    }
  };

  // Format date function for collection timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Dynamic sensor status info based on type and readings
  const getSensorStatusInfo = () => {
    if (!selectedSensor) return null;
    
    const latestReading = getLatestReading();
    if (!latestReading) return null;
    
    const sensorType = getSensorType(selectedSensor);
    
    switch (sensorType) {
      case 'water-quality':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">pH</div>
              <div className="text-2xl font-semibold">
                {latestReading.pH?.toFixed(1) || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Turbidity</div>
              <div className="text-2xl font-semibold">
                {latestReading.turbidity?.toFixed(1) || 'N/A'} <span className="text-sm">NTU</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Temperature</div>
              <div className="text-2xl font-semibold">
                {latestReading.temperature?.toFixed(1) || 'N/A'} <span className="text-sm">°C</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">TDS</div>
              <div className="text-2xl font-semibold">
                {latestReading.tds?.toFixed(0) || 'N/A'} <span className="text-sm">mg/L</span>
              </div>
            </div>
          </div>
        );
      case 'pump':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Status</div>
              <div className="text-2xl font-semibold">
                {latestReading.pumpStatus ? 
                  <span className="text-green-500">Running</span> : 
                  <span className="text-gray-500">Stopped</span>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Flow Rate</div>
              <div className="text-2xl font-semibold">
                {latestReading.flowRate?.toFixed(0) || 'N/A'} <span className="text-sm">L/min</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Pressure</div>
              <div className="text-2xl font-semibold">
                {latestReading.pressure?.toFixed(1) || 'N/A'} <span className="text-sm">bar</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Vibration</div>
              <div className="text-2xl font-semibold">
                {latestReading.vibration?.toFixed(2) || 'N/A'} <span className="text-sm">mm/s</span>
              </div>
            </div>
          </div>
        );
      case 'tank':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Level</div>
              <div className="text-2xl font-semibold">
                {latestReading.tankLevel?.toFixed(0) || 'N/A'} <span className="text-sm">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Volume</div>
              <div className="text-2xl font-semibold">
                {latestReading.currentVolume?.toFixed(0) || 'N/A'} <span className="text-sm">m³</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Water Depth</div>
              <div className="text-2xl font-semibold">
                {latestReading.waterDepth?.toFixed(1) || 'N/A'} <span className="text-sm">m</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Temperature</div>
              <div className="text-2xl font-semibold">
                {latestReading.temperature?.toFixed(1) || 'N/A'} <span className="text-sm">°C</span>
              </div>
            </div>
          </div>
        );
      case 'valve':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Position</div>
              <div className="text-2xl font-semibold">
                {latestReading.valvePosition?.toFixed(0) || 'N/A'} <span className="text-sm">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Flow Rate</div>
              <div className="text-2xl font-semibold">
                {latestReading.flowRate?.toFixed(0) || 'N/A'} <span className="text-sm">L/min</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Pressure</div>
              <div className="text-2xl font-semibold">
                {latestReading.pressure?.toFixed(1) || 'N/A'} <span className="text-sm">bar</span>
              </div>
            </div>
          </div>
        );
      case 'environmental':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Rainfall</div>
              <div className="text-2xl font-semibold">
                {latestReading.rainfall?.toFixed(1) || 'N/A'} <span className="text-sm">mm</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Temperature</div>
              <div className="text-2xl font-semibold">
                {latestReading.ambientTemperature?.toFixed(1) || 'N/A'} <span className="text-sm">°C</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Humidity</div>
              <div className="text-2xl font-semibold">
                {latestReading.humidity?.toFixed(0) || 'N/A'} <span className="text-sm">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Battery</div>
              <div className="text-2xl font-semibold">
                {latestReading.batteryLevel?.toFixed(0) || 'N/A'} <span className="text-sm">%</span>
              </div>
            </div>
          </div>
        );
      case 'garbage':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Fill Level</div>
              <div className="text-2xl font-semibold">
                {latestReading.fillLevel?.toFixed(0) || 'N/A'} <span className="text-sm">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Door Status</div>
              <div className="text-2xl font-semibold">
                {latestReading.doorOpen ? 
                  <span className="text-yellow-500">Open</span> : 
                  <span className="text-green-500">Closed</span>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Last Collection</div>
              <div className="text-lg font-semibold">
                {latestReading.lastCollectionTimestamp ? 
                  formatDate(latestReading.lastCollectionTimestamp) : 
                  'Not recorded'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Battery</div>
              <div className="text-2xl font-semibold">
                {latestReading.batteryLevel?.toFixed(0) || 'N/A'} <span className="text-sm">%</span>
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <div className="text-gray-400 text-sm">Bin Type</div>
              <div className="text-lg font-semibold capitalize">
                {latestReading.binType?.replace('-', ' ') || 'General Waste'}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-4 text-center text-gray-400">
            Sensor details not available
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-3">Sensor Details</h2>
      <div className="flex-1 overflow-y-auto">
        {selectedSensor ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-medium">
                  {selectedSensor}
                </h3>
                <p className="text-slate-400 text-sm">
                  {getSensorTypeLabel(getSensorType(selectedSensor))}
                </p>
              </div>
              <div className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 text-xs">
                Online
              </div>
            </div>
            {getSensorStatusInfo()}
          </>
        ) : (
          <div className="text-center py-8 text-slate-400 h-full flex items-center justify-center">
            Select a sensor to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorDetails; 