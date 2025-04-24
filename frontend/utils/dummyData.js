/**
 * Dummy data utility for water quality monitoring system
 * Provides sample data to visualize the dashboard when backend is not available
 */

// Define coordinates for Panama City
export const PANAMA_CITY_CENTER = {
  lat: 8.9824,
  lng: -79.5199
};

// Generate more sensors around Panama City
export const generateMoreSensors = (baseLocations, count = 50) => {
  const result = [...baseLocations];
  const sensorTypes = ['water-quality', 'pump', 'tank', 'valve', 'environmental'];
  
  // Areas to distribute new sensors
  const areas = [
    { name: 'Punta Pacifica', lat: 8.9813, lng: -79.5069, radius: 0.015 },
    { name: 'San Francisco', lat: 8.9929, lng: -79.5007, radius: 0.012 },
    { name: 'El Cangrejo', lat: 8.9892, lng: -79.5266, radius: 0.01 },
    { name: 'Obarrio', lat: 8.9867, lng: -79.5209, radius: 0.008 },
    { name: 'Marbella', lat: 8.9784, lng: -79.5166, radius: 0.01 },
    { name: 'Bella Vista', lat: 8.9833, lng: -79.5272, radius: 0.01 },
    { name: 'Albrook', lat: 8.9736, lng: -79.5528, radius: 0.018 },
    { name: 'Juan Diaz', lat: 9.0302, lng: -79.4526, radius: 0.02 },
    { name: 'Panama Viejo', lat: 9.0066, lng: -79.4846, radius: 0.015 },
    { name: 'El Dorado', lat: 9.0072, lng: -79.5373, radius: 0.012 }
  ];
  
  for (let i = 0; i < count; i++) {
    // Select random area
    const area = areas[Math.floor(Math.random() * areas.length)];
    
    // Generate random offset within the area's radius
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDistance = Math.random() * area.radius;
    const latOffset = randomDistance * Math.cos(randomAngle);
    const lngOffset = randomDistance * Math.sin(randomAngle);
    
    // Calculate new coordinates
    const newLat = area.lat + latOffset;
    const newLng = area.lng + lngOffset;
    
    // Select random sensor type
    const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
    
    // Create sensor ID based on type and current count
    const typePrefix = sensorType === 'water-quality' ? 'wq-sensor' :
                      sensorType === 'pump' ? 'pump-station' :
                      sensorType === 'tank' ? 'storage-tank' :
                      sensorType === 'valve' ? 'valve-control' : 'env-monitor';
    
    // Count existing sensors of this type to create sequential IDs
    const existingOfType = result.filter(s => s.type === sensorType).length;
    const idNumber = existingOfType + i + 1;
    const formattedNumber = idNumber.toString().padStart(3, '0');
    
    // Create new sensor
    result.push({
      id: `${typePrefix}-${formattedNumber}`,
      name: `${area.name} ${sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} ${idNumber}`,
      lat: newLat,
      lng: newLng,
      type: sensorType
    });
  }
  
  return result;
};

// Panama City sensor locations - extended with more locations to create a rich map
export const PANAMA_CITY_SENSORS = generateMoreSensors([
  // Water distribution network
  { id: 'wq-sensor-001', name: 'Central Treatment Plant', lat: 8.9824, lng: -79.5199, type: 'water-quality' },
  { id: 'wq-sensor-002', name: 'Casco Viejo Line', lat: 8.9507, lng: -79.5368, type: 'water-quality' },
  { id: 'wq-sensor-003', name: 'Miraflores Junction', lat: 8.9978, lng: -79.5908, type: 'water-quality' },
  { id: 'wq-sensor-004', name: 'Via Israel Monitor', lat: 9.0066, lng: -79.5082, type: 'water-quality' },
  { id: 'wq-sensor-005', name: 'Corredor Sur Line', lat: 9.0096, lng: -79.4783, type: 'water-quality' },
  { id: 'wq-sensor-006', name: 'International Airport', lat: 9.0711, lng: -79.3832, type: 'water-quality' },
  { id: 'wq-sensor-007', name: 'Amador Causeway', lat: 8.9175, lng: -79.5429, type: 'water-quality' },
  { id: 'wq-sensor-008', name: 'Balboa Heights', lat: 8.9528, lng: -79.5506, type: 'water-quality' },
  
  // Pump stations
  { id: 'pump-station-1', name: 'Central Pumping Station', lat: 8.9834, lng: -79.5209, type: 'pump' },
  { id: 'pump-station-2', name: 'Costa del Este Pump', lat: 9.0106, lng: -79.4773, type: 'pump' },
  { id: 'pump-station-3', name: 'Tocumen Area Pump', lat: 9.0721, lng: -79.3842, type: 'pump' },
  { id: 'pump-station-4', name: 'Northern Distribution Pump', lat: 9.0278, lng: -79.5183, type: 'pump' },
  { id: 'pump-station-5', name: 'Clayton Pump Station', lat: 9.0088, lng: -79.5843, type: 'pump' },
  { id: 'pump-station-6', name: 'Casco Viejo Booster', lat: 8.9517, lng: -79.5378, type: 'pump' },
  
  // Storage tanks
  { id: 'storage-tank-a', name: 'Main Reservoir', lat: 8.9844, lng: -79.5219, type: 'tank' },
  { id: 'storage-tank-b', name: 'Costa del Este Tank', lat: 9.0116, lng: -79.4783, type: 'tank' },
  { id: 'storage-tank-c', name: 'Clayton Reservoir', lat: 9.0098, lng: -79.5853, type: 'tank' },
  { id: 'storage-tank-d', name: 'Northern District Tank', lat: 9.0288, lng: -79.5193, type: 'tank' },
  { id: 'storage-tank-e', name: 'Tocumen Water Tower', lat: 9.0731, lng: -79.3852, type: 'tank' },
  
  // Control valves
  { id: 'valve-control-12', name: 'Central Distribution Valve', lat: 8.9834, lng: -79.5229, type: 'valve' },
  { id: 'valve-control-13', name: 'Casco Viejo Line Valve', lat: 8.9527, lng: -79.5388, type: 'valve' },
  { id: 'valve-control-14', name: 'Costa Este Junction', lat: 9.0126, lng: -79.4793, type: 'valve' },
  { id: 'valve-control-15', name: 'Airport Line Valve', lat: 9.0701, lng: -79.3852, type: 'valve' },
  { id: 'valve-control-16', name: 'Northern Line Valve', lat: 9.0268, lng: -79.5203, type: 'valve' },
  { id: 'valve-control-17', name: 'Clayton Water Control', lat: 9.0078, lng: -79.5863, type: 'valve' },
  { id: 'valve-control-18', name: 'Amador Line Valve', lat: 8.9195, lng: -79.5439, type: 'valve' },
  
  // Environmental monitors
  { id: 'env-monitor-5', name: 'Central Weather Station', lat: 8.9844, lng: -79.5239, type: 'environmental' },
  { id: 'env-monitor-6', name: 'Costa del Este Monitor', lat: 9.0136, lng: -79.4803, type: 'environmental' },
  { id: 'env-monitor-7', name: 'Airport Rain Gauge', lat: 9.0691, lng: -79.3872, type: 'environmental' },
  { id: 'env-monitor-8', name: 'Clayton Environment Station', lat: 9.0058, lng: -79.5873, type: 'environmental' }
], 30);

// Export all sensor IDs for use in the app
export const SENSOR_IDS = PANAMA_CITY_SENSORS.map(sensor => sensor.id);

// Network connections between sensors for visualization
export const NETWORK_CONNECTIONS = [
  // Main distribution network
  { from: 'wq-sensor-001', to: 'valve-control-12' },
  { from: 'valve-control-12', to: 'pump-station-1' },
  { from: 'pump-station-1', to: 'storage-tank-a' },
  { from: 'pump-station-1', to: 'wq-sensor-002' },
  { from: 'pump-station-1', to: 'wq-sensor-004' },
  
  // Costa del Este branch
  { from: 'wq-sensor-004', to: 'valve-control-14' },
  { from: 'valve-control-14', to: 'pump-station-2' },
  { from: 'pump-station-2', to: 'storage-tank-b' },
  { from: 'storage-tank-b', to: 'wq-sensor-005' },
  
  // Casco Viejo branch
  { from: 'wq-sensor-002', to: 'valve-control-13' },
  { from: 'valve-control-13', to: 'pump-station-6' },
  { from: 'pump-station-6', to: 'wq-sensor-002' },
  
  // Northern branch
  { from: 'wq-sensor-004', to: 'valve-control-16' },
  { from: 'valve-control-16', to: 'pump-station-4' },
  { from: 'pump-station-4', to: 'storage-tank-d' },
  
  // Clayton branch
  { from: 'wq-sensor-003', to: 'valve-control-17' },
  { from: 'valve-control-17', to: 'pump-station-5' },
  { from: 'pump-station-5', to: 'storage-tank-c' }
];

// Generate dummy readings for each sensor
export const generateDummyReadings = () => {
  const now = Date.now();
  const readings = {};
  
  // For each sensor, generate 30 readings over the last 2.5 hours (5 min intervals)
  SENSOR_IDS.forEach(sensorId => {
    // Determine sensor type based on ID prefix
    let sensorType = 'unknown';
    if (sensorId.startsWith('wq-sensor')) {
      sensorType = 'water-quality';
    } else if (sensorId.startsWith('pump-station')) {
      sensorType = 'pump';
    } else if (sensorId.startsWith('storage-tank')) {
      sensorType = 'tank';
    } else if (sensorId.startsWith('valve-control')) {
      sensorType = 'valve';
    } else if (sensorId.startsWith('env-monitor')) {
      sensorType = 'environmental';
    }
    
    // Find sensor in PANAMA_CITY_SENSORS to get coordinates
    const sensorInfo = PANAMA_CITY_SENSORS.find(s => s.id === sensorId);
    
    readings[sensorId] = Array.from({ length: 30 }, (_, i) => {
      const timestamp = now - ((30 - i) * 5 * 60 * 1000);
      const baseReading = {
        sensorId,
        timestamp,
        sensorType
      };
      
      // Add coordinates from PANAMA_CITY_SENSORS
      if (sensorInfo) {
        baseReading.latitude = sensorInfo.lat;
        baseReading.longitude = sensorInfo.lng;
      }
      
      // Add additional data based on sensor type
      if (sensorType === 'water-quality') {
        // Water quality sensor data
        const baseTurbidity = 30 + (i * 0.7) + (Math.sin(i * 0.3) * 5);
        const turbidity = Math.max(0, Math.min(100, baseTurbidity + (Math.random() * 10 - 5)));
        
        return {
          ...baseReading,
          turbidity,
          pH: 7.2 + (Math.sin(i * 0.2) * 0.8) + (Math.random() * 0.4 - 0.2),
          temperature: 22 + (Math.sin(i * 0.1) * 3) + (Math.random() * 2 - 1),
          conductivity: 450 + (i * 2) + (Math.random() * 20 - 10),
          tds: 250 + (i * 1.5) + (Math.random() * 15 - 7.5),
          dissolvedOxygen: 8 + (Math.sin(i * 0.25) * 2) + (Math.random() * 1 - 0.5),
          chlorineResidual: 0.8 + (Math.sin(i * 0.5) * 0.3) + (Math.random() * 0.2 - 0.1),
          orp: 250 + (Math.sin(i * 0.3) * 50) + (Math.random() * 20 - 10),
          nitrates: 0.5 + (Math.sin(i * 0.2) * 0.3) + (Math.random() * 0.1),
          phosphates: 0.2 + (Math.sin(i * 0.15) * 0.1) + (Math.random() * 0.05),
          // Add txHash for readings above threshold (for blockchain events)
          txHash: turbidity > 80 ? `0x${generateRandomHex(64)}` : undefined
        };
      } else if (sensorType === 'pump') {
        // Pump station data
        const pumpStatus = i % 10 !== 0; // Every 10th reading pump is off
        const baseFlowRate = pumpStatus ? 400 + (Math.sin(i * 0.4) * 50) : 0;
        
        return {
          ...baseReading,
          pumpStatus,
          flowRate: baseFlowRate + (pumpStatus ? (Math.random() * 20 - 10) : 0),
          pressure: pumpStatus ? 3.5 + (Math.sin(i * 0.3) * 0.5) + (Math.random() * 0.2 - 0.1) : 0,
          vibration: pumpStatus ? 0.05 + (Math.random() * 0.04) : 0,
          motorCurrent: pumpStatus ? 12 + (Math.random() * 2 - 1) : 0,
          motorVoltage: pumpStatus ? 380 + (Math.random() * 10 - 5) : 0,
          bearingTemperature: pumpStatus ? 35 + (i * 0.1) + (Math.random() * 3 - 1.5) : 25,
          energyConsumption: 50 + (i * 5) + (Math.random() * 3)
        };
      } else if (sensorType === 'tank') {
        // Storage tank data
        const tankDepletion = Math.sin(i * 0.1) * 10;
        const baseTankLevel = 70 - (i * 0.5) + tankDepletion;
        const tankLevel = Math.max(0, Math.min(100, baseTankLevel));
        
        return {
          ...baseReading,
          tankLevel,
          waterDepth: 4 * (tankLevel / 100),
          currentVolume: 1200 * (tankLevel / 100),
          temperature: 18 + (Math.sin(i * 0.2) * 3) + (Math.random() * 1.5 - 0.75)
        };
      } else if (sensorType === 'valve') {
        // Control valve data
        // Valve cycles between open and closed
        const valveCycle = Math.sin(i * 0.2) * 0.5 + 0.5;
        const valvePosition = Math.max(0, Math.min(100, valveCycle * 100));
        
        return {
          ...baseReading,
          valvePosition,
          flowRate: 600 * (valvePosition / 100) * (0.8 + Math.random() * 0.4),
          pressure: 4 - (valvePosition / 100 * 2) + (Math.random() * 0.5 - 0.25)
        };
      } else if (sensorType === 'environmental') {
        // Environmental monitor data
        const rainPattern = Math.max(0, Math.sin(i * 0.3) * 15);
        
        return {
          ...baseReading,
          rainfall: rainPattern + (rainPattern > 0 ? (Math.random() * 2) : 0),
          ambientTemperature: 25 + (Math.sin(i * 0.1) * 8) + (Math.random() * 2 - 1),
          humidity: 60 + (Math.sin(i * 0.2) * 20) + (Math.random() * 5 - 2.5),
          batteryLevel: 100 - (i * 0.3) + (Math.random() * 1 - 0.5)
        };
      }
      
      return baseReading;
    });
  });
  
  return readings;
};

// Generate random blockchain events
export const generateDummyEvents = () => {
  const events = [];
  
  // Generate various types of events
  SENSOR_IDS.forEach(sensorId => {
    // Determine what kind of events to create based on sensor type
    if (sensorId.includes('wq-sensor')) {
      // Add turbidity events for water quality sensors
      events.push({
        sensorId,
        metricType: 'Turbidity',
        value: Math.floor(Math.random() * 20) + 70, // 70-90 range (threshold events)
        timestamp: Date.now() - (Math.random() * 40 * 60 * 1000), // Random in last 40 mins
        txHash: `0x${generateRandomHex(64)}`
      });
      
      // Also add a pH event
      events.push({
        sensorId,
        metricType: 'pH',
        value: 5.8 + (Math.random() * 0.6), // Slightly acidic (threshold event)
        timestamp: Date.now() - (Math.random() * 100 * 60 * 1000), // Random in last 100 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    } 
    else if (sensorId.includes('pump')) {
      // Add flow rate event for pump
      events.push({
        sensorId,
        metricType: 'Flow Rate',
        value: Math.floor(Math.random() * 100) + 500, // 500-600 range (high flow)
        timestamp: Date.now() - (Math.random() * 60 * 60 * 1000), // Random in last 60 mins
        txHash: `0x${generateRandomHex(64)}`
      });
      
      // Also add a vibration alert
      events.push({
        sensorId,
        metricType: 'Vibration',
        value: 0.15 + (Math.random() * 0.05), // High vibration alert
        timestamp: Date.now() - (Math.random() * 120 * 60 * 1000), // Random in last 120 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    else if (sensorId.includes('tank')) {
      // Low tank level alert
      events.push({
        sensorId,
        metricType: 'Tank Level',
        value: Math.floor(Math.random() * 15) + 10, // 10-25% range (low level)
        timestamp: Date.now() - (Math.random() * 80 * 60 * 1000), // Random in last 80 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    else if (sensorId.includes('valve')) {
      // Valve position change
      events.push({
        sensorId,
        metricType: 'Valve Position',
        value: Math.floor(Math.random() * 10) + 90, // 90-100% range (fully open)
        timestamp: Date.now() - (Math.random() * 30 * 60 * 1000), // Random in last 30 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    else if (sensorId.includes('env')) {
      // High rainfall alert
      events.push({
        sensorId,
        metricType: 'Rainfall',
        value: Math.floor(Math.random() * 10) + 20, // 20-30mm range (heavy rain)
        timestamp: Date.now() - (Math.random() * 50 * 60 * 1000), // Random in last 50 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
  });
  
  // Sort by timestamp (newest first)
  events.sort((a, b) => b.timestamp - a.timestamp);
  
  // Return the 10 most recent events
  return events.slice(0, 10);
};

// Helper to generate random hex string
const generateRandomHex = (length) => {
  let result = '';
  const characters = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
