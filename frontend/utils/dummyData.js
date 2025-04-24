/**
 * Dummy data utility for water quality monitoring system
 * Provides sample data to visualize the dashboard when backend is not available
 */

// Sensor IDs for different types of sensors
export const SENSOR_IDS = [
  'wq-sensor-001', // Water quality sensor
  'pump-station-1', // Pump station
  'storage-tank-a', // Storage tank
  'valve-control-12', // Control valve
  'env-monitor-5' // Environmental monitor
];

// Generate dummy readings for each sensor
export const generateDummyReadings = () => {
  const now = Date.now();
  const readings = {};
  
  // Assign sensor types and generate appropriate data
  const sensorTypes = {
    'wq-sensor-001': 'water-quality',
    'pump-station-1': 'pump',
    'storage-tank-a': 'tank',
    'valve-control-12': 'valve',
    'env-monitor-5': 'environmental'
  };
  
  // For each sensor, generate 30 readings over the last 2.5 hours (5 min intervals)
  SENSOR_IDS.forEach(sensorId => {
    const sensorType = sensorTypes[sensorId];
    
    readings[sensorId] = Array.from({ length: 30 }, (_, i) => {
      const timestamp = now - ((30 - i) * 5 * 60 * 1000);
      const baseReading = {
        sensorId,
        timestamp,
        sensorType
      };
      
      // Add coordinates for mapping
      if (sensorId === 'wq-sensor-001') {
        baseReading.latitude = 34.052235;
        baseReading.longitude = -118.243683;
      } else if (sensorId === 'pump-station-1') {
        baseReading.latitude = 34.049345;
        baseReading.longitude = -118.256738;
      } else if (sensorId === 'storage-tank-a') {
        baseReading.latitude = 34.059124;
        baseReading.longitude = -118.235816;
      } else if (sensorId === 'valve-control-12') {
        baseReading.latitude = 34.046913;
        baseReading.longitude = -118.222437;
      } else if (sensorId === 'env-monitor-5') {
        baseReading.latitude = 34.063561;
        baseReading.longitude = -118.247328;
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
