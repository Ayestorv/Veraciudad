import React, { useState, useMemo, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { SENSOR_IDS, PANAMA_CITY_SENSORS, PANAMA_CITY_CENTER, NETWORK_CONNECTIONS } from '../utils/dummyData';
// Dynamically import garbage-related data using require to avoid issues
// with server-side rendering
let GARBAGE_BINS: any[] = [];
let BIN_NETWORK_CONNECTIONS: any[] = [];
if (typeof window !== 'undefined') {
  try {
    const garbageData = require('../utils/garbageDummyData');
    GARBAGE_BINS = garbageData.GARBAGE_BINS;
    BIN_NETWORK_CONNECTIONS = garbageData.BIN_NETWORK_CONNECTIONS;
  } catch (e) {
    console.warn('Failed to load garbage data:', e);
  }
}
import L from 'leaflet';

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
  
  // Garbage
  fillLevel?: number;
  doorOpen?: boolean;
  lastCollectionTimestamp?: number;
  binType?: string;
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
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  
  // Generate network connections dynamically
  const generateNetworkConnections = () => {
    // Check if we're dealing with garbage bins
    if (sensors.length > 0 && sensors[0].startsWith('bin-')) {
      try {
        // For garbage bins, use the bin connections
        return BIN_NETWORK_CONNECTIONS;
      } catch (e) {
        console.error('Error loading bin connections:', e);
        return [];
      }
    }
    
    // Otherwise, use water system connections
    // Start with base connections from dummyData.js
    const baseConnections = [...NETWORK_CONNECTIONS];
    
    // Add connections for additional dynamic sensors
    const waterQualitySensors = PANAMA_CITY_SENSORS.filter(s => s.type === 'water-quality');
    const pumpSensors = PANAMA_CITY_SENSORS.filter(s => s.type === 'pump');
    const tankSensors = PANAMA_CITY_SENSORS.filter(s => s.type === 'tank');
    const valveSensors = PANAMA_CITY_SENSORS.filter(s => s.type === 'valve');
    
    // Add connections in a more organic way - each water quality sensor should connect to the nearest pump or valve
    waterQualitySensors.forEach(wq => {
      if (!baseConnections.some(conn => conn.from === wq.id || conn.to === wq.id)) {
        // Find closest pump or valve
        let closestSensor = null;
        let minDistance = Infinity;
        
        const potentialTargets = [...pumpSensors, ...valveSensors];
        potentialTargets.forEach(target => {
          const distance = Math.sqrt(
            Math.pow(wq.lat - target.lat, 2) + 
            Math.pow(wq.lng - target.lng, 2)
          );
          
          if (distance < minDistance && distance < 0.02) { // Only connect if within ~2km
            minDistance = distance;
            closestSensor = target;
          }
        });
        
        if (closestSensor) {
          baseConnections.push({ from: wq.id, to: closestSensor.id });
        }
      }
    });
    
    // Connect pumps to nearest tanks if not already connected
    pumpSensors.forEach(pump => {
      if (!baseConnections.some(conn => conn.from === pump.id && tankSensors.some(t => t.id === conn.to))) {
        // Find closest tank
        let closestTank = null;
        let minDistance = Infinity;
        
        tankSensors.forEach(tank => {
          const distance = Math.sqrt(
            Math.pow(pump.lat - tank.lat, 2) + 
            Math.pow(pump.lng - tank.lng, 2)
          );
          
          if (distance < minDistance && distance < 0.03) { // Only connect if within ~3km
            minDistance = distance;
            closestTank = tank;
          }
        });
        
        if (closestTank) {
          baseConnections.push({ from: pump.id, to: closestTank.id });
        }
      }
    });
    
    return baseConnections;
  };

  // Network connections between sensors
  const networkConnections = useMemo(() => generateNetworkConnections(), []);

  // Reference to the network lines layer
  const linesLayer = useRef<any>(null);

  // Draw network connections
  const drawConnections = () => {
    if (!leafletMap.current || !linesLayer.current) return;
    
    // Clear existing lines
    linesLayer.current.clearLayers();
    
    import('leaflet').then((L) => {
      // Only show connections between sensors that match the current filter
      networkConnections.forEach(connection => {
        // Get locations for both sensors
        const fromSensor = findSensorById(connection.from);
        const toSensor = findSensorById(connection.to);
        
        // Skip if either sensor is not found
        if (!fromSensor || !toSensor) return;
        
        // Skip if either sensor doesn't match the current filter
        if (mapMode !== 'all') {
          const fromType = fromSensor.type;
          const toType = toSensor.type;
          if (fromType !== mapMode && toType !== mapMode) return;
        }
        
        // Get readings to determine flow status
        const fromReading = getLatestReading(connection.from);
        const toReading = getLatestReading(connection.to);
        
        // Flow is active if:
        // - From is a pump that's running OR a valve that's open
        // - OR destination is a storage tank
        let flowActive = false;
        let flowColor = '#0066AA';
        let dashArray = null;
        
        if (fromSensor.type === 'pump' && fromReading?.pumpStatus) {
          flowActive = true;
        } else if (fromSensor.type === 'valve' && fromReading?.valvePosition && fromReading.valvePosition > 20) {
          flowActive = true;
        } else if (toSensor.type === 'tank') {
          flowActive = true;
          dashArray = '5, 5';
        }
        
        // Change color based on water quality if flowing from a water quality sensor
        if (flowActive && fromSensor.type === 'water-quality') {
          flowColor = getWaterQualityColor(fromReading);
        }
        
        // Draw line if flow is active
        if (flowActive) {
          // Create polyline between the two points
          const line = L.polyline(
            [[fromSensor.lat, fromSensor.lng], [toSensor.lat, toSensor.lng]],
            { 
              color: flowColor,
              weight: 3,
              opacity: 0.7,
              dashArray: dashArray
            }
          ).addTo(linesLayer.current);
        }
      });
    });
  };
  
  // Initialize map
  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !leafletMap.current) {
      // Dynamically import Leaflet to avoid SSR issues
      import('leaflet').then((L) => {
        // Determine if we're showing garbage bins
        const isGarbageDashboard = sensors.length > 0 && sensors[0].startsWith('bin-');
        
        // Create map instance with a darker style suitable for a water network
        leafletMap.current = L.map(mapRef.current).setView([PANAMA_CITY_CENTER.lat, PANAMA_CITY_CENTER.lng], 13);
        
        // Add a dark-themed map tile layer - CartoDB Dark Matter
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(leafletMap.current);
        
        // Create layer groups
        linesLayer.current = L.layerGroup().addTo(leafletMap.current);
        markersLayer.current = L.layerGroup().addTo(leafletMap.current);
        
        // Initial update
        drawConnections();
        updateMarkers();
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Redraw connections when map mode changes
  useEffect(() => {
    drawConnections();
  }, [mapMode]);
  
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

  // Get fill level color for garbage bins
  const getFillLevelColor = (reading: Reading | null): string => {
    if (!reading || reading.fillLevel === undefined) return '#cccccc';
    
    // Based on garbage bin fill level
    if (reading.fillLevel > 90) return '#DC3545'; // Red - nearly full
    if (reading.fillLevel > 70) return '#FFC107'; // Yellow - medium fill level
    return '#28A745'; // Green - low fill level
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
      case 'garbage':
        // For garbage bins, show fill level
        return { 
          value: reading.fillLevel?.toFixed(0) || 'N/A', 
          label: '%' 
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
      case 'garbage':
        // For garbage bins, we'll create a bin icon with fill level
        const binFillLevel = reading?.fillLevel || 0;
        const binHeight = isSelected ? 24 : 18;
        const binWidth = isSelected ? 20 : 16;
        const binX = isSelected ? -10 : -8;
        const binY = isSelected ? -12 : -9;
        const binFillHeight = (binFillLevel / 100) * binHeight;
        const binFillY = binY + binHeight - binFillHeight;
        const doorOpen = reading?.doorOpen || false;
        
        return (
          <g>
            {/* Bin body outline */}
            <rect
              x={binX}
              y={binY}
              width={binWidth}
              height={binHeight}
              rx="2"
              fill="none"
              stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
              strokeWidth={isSelected ? 3 : 1}
            />
            {/* Bin fill level */}
            <rect
              x={binX}
              y={binFillY}
              width={binWidth}
              height={binFillHeight}
              rx="2"
              fill={getFillLevelColor(reading)}
            />
            {/* Bin lid - show angled if door is open */}
            <rect
              x={binX - 2}
              y={binY - 3}
              width={binWidth + 4}
              height={2}
              fill="white"
              transform={doorOpen ? `rotate(30, ${binX + binWidth/2}, ${binY - 2})` : ''}
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

  // Update markers on map based on current state
  const updateMarkers = () => {
    if (!markersLayer.current || !leafletMap.current) return;

    // Clear existing markers
    markersLayer.current.clearLayers();

    // Apply current filter
    const sensorsToDisplay = mapMode === 'all' 
      ? sensors 
      : sensors.filter(sensorId => getSensorType(sensorId) === mapMode);

    // Find each sensor in our Panama City locations array or use lat/lng from readings
    import('leaflet').then((L) => {
      sensorsToDisplay.forEach(sensorId => {
        // Try to find sensor in our predefined locations
        let sensorLocation = findSensorById(sensorId);
        const reading = getLatestReading(sensorId);
        const sensorType = getSensorType(sensorId);
        
        // If not found in our predefined locations, check if the reading has coordinates
        if (!sensorLocation && reading && reading.latitude && reading.longitude) {
          sensorLocation = {
            id: sensorId,
            name: sensorId.split('-').join(' ').toUpperCase(),
            lat: reading.latitude,
            lng: reading.longitude,
            type: sensorType
          };
        }
        
        // If we have coordinates for this sensor from either source
        if (sensorLocation) {
          // Create custom icon
          const isSelected = sensorId === selectedSensor;
          let color = '#888888'; // Default gray
          
          // Determine color based on sensor type and reading status
          switch (sensorType) {
            case 'water-quality':
              color = getWaterQualityColor(reading);
              break;
            case 'pump':
              color = getPumpColor(reading);
              break;
            case 'tank':
              color = getTankLevelColor(reading);
              break;
            case 'valve':
              color = getValveColor(reading);
              break;
            case 'environmental':
              color = '#17a2b8'; // Teal for environmental sensors
              break;
            case 'garbage':
              color = getFillLevelColor(reading);
              break;
          }
          
          // Create an icon with associated CSS classes
          const iconHtml = `<div class="sensor-icon ${sensorType}-icon" style="background-color: ${color}; width: ${isSelected ? '20px' : '14px'}; height: ${isSelected ? '20px' : '14px'}; border-radius: ${sensorType === 'water-quality' ? '50%' : '3px'}; border: ${isSelected ? '3px' : '1px'} solid white;"></div>`;
          
          const sensorIcon = L.divIcon({
            html: iconHtml,
            className: `sensor-marker ${isSelected ? 'selected' : ''}`,
            iconSize: [isSelected ? 24 : 16, isSelected ? 24 : 16],
            iconAnchor: [isSelected ? 12 : 8, isSelected ? 12 : 8]
          });
          
          // Create marker and add click handler
          const marker = L.marker([sensorLocation.lat, sensorLocation.lng], { 
            icon: sensorIcon,
            zIndexOffset: isSelected ? 1000 : 0
          }).addTo(markersLayer.current);
          
          // Add popup with sensor information
          const primaryMetric = getPrimaryMetric(reading);
          marker.bindTooltip(`
            <div class="sensor-tooltip">
              <div class="sensor-name">${sensorLocation.name}</div>
              <div class="sensor-id">${sensorId}</div>
              <div class="sensor-reading">${primaryMetric.value} ${primaryMetric.label}</div>
            </div>
          `);
          
          // Add click handler
          marker.on('click', () => {
            onSensorSelect(sensorId);
          });
        }
      });
    });
  };
  
  // Filter sensors based on current map mode
  const filteredSensors = useMemo(() => {
    return mapMode === 'all' 
      ? sensors 
      : sensors.filter(sensorId => getSensorType(sensorId) === mapMode);
  }, [sensors, mapMode, sensorTypes]); // Add sensorTypes as dependency instead of recalculating

  // Update markers when filtered sensors change
  useEffect(() => {
    updateMarkers();
  }, [filteredSensors, selectedSensor]);

  // Now calculateSensorPositions is the actual positions, not a function
  const sensorPositions = calculateSensorPositions;

  // Helper to find a sensor by ID
  const findSensorById = (sensorId: string) => {
    // Check if this is a garbage bin ID
    if (sensorId.startsWith('bin-')) {
      // Dynamically import and use GARBAGE_BINS
      return GARBAGE_BINS.find(s => s.id === sensorId);
    }
    
    // Otherwise use water system sensors
    return PANAMA_CITY_SENSORS.find(s => s.id === sensorId);
  };

  // Get sensor coordinates if available from our Panama City dataset
  const getSensorCoordinates = (sensorId: string) => {
    const sensor = findSensorById(sensorId);
    if (sensor) {
      return { lat: sensor.lat, lng: sensor.lng };
    }
    return null;
  };
  
  // Focus the map on a specific sensor
  const focusOnSensor = (sensorId: string) => {
    if (!leafletMap.current) return;
    const sensor = findSensorById(sensorId);
    if (!sensor) return;

    const currentZoom = leafletMap.current.getZoom();
    leafletMap.current.setView(
      [sensor.lat, sensor.lng],
      currentZoom,            // ← reuse whatever zoom you're already at
      { animate: true }       // optional, for smooth animation
    );
  };
  
  /* Alternative implementation using panTo (Option B)
  const focusOnSensor = (sensorId: string) => {
    if (!leafletMap.current) return;
    const sensor = findSensorById(sensorId);
    if (!sensor) return;

    leafletMap.current.panTo(
      [sensor.lat, sensor.lng],
      { animate: true }       // optional, for smooth animation
    );
  };
  */
  
  // When selected sensor changes, focus the map on it
  useEffect(() => {
    if (selectedSensor) {
      focusOnSensor(selectedSensor);
    }
  }, [selectedSensor]);
  
  // Create stable filtered sensor positions for legacy SVG rendering
  // (kept for backwards compatibility but not actively used)
  const filteredSensorPositions = useMemo(() => {
    return Object.fromEntries(
      filteredSensors.map(sensorId => [
        sensorId, 
        sensorPositions[sensorId] || { x: 200, y: 150 }
      ])
    );
  }, [filteredSensors, sensorPositions]);

  // Render with Leaflet map
  return (
    <div className="w-full h-full bg-white/5 rounded-lg overflow-hidden flex flex-col relative">
      {/* Layer control buttons */}
      <div className="flex flex-wrap gap-1 mb-2 px-2 py-2 bg-slate-800 z-10">
        <button 
          className={`text-xs px-2 py-1 rounded ${mapMode === 'all' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
          onClick={() => {
            setMapMode('all');
          }}
        >
          All
        </button>
        <button 
          className={`text-xs px-2 py-1 rounded ${mapMode === 'garbage' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70'}`}
          onClick={() => {
            setMapMode('garbage');
          }}
        >
          Garbage
        </button>
      </div>
      
      {/* Debug overlay */}
      {sensors.length === 0 && (
        <div className="absolute top-10 left-0 right-0 text-center text-white bg-red-500/50 p-2 z-20">
          No sensors available
        </div>
      )}
      
      {/* Map legend */}
      <div className="absolute bottom-4 right-4 bg-slate-800/80 p-3 rounded-lg z-10 text-white text-xs">
        <div className="font-bold mb-1">Sensor Types</div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Garbage Bin</span>
        </div>
      </div>
      
      {/* The actual map container */}
      <div 
        ref={mapRef} 
        className="flex-grow w-full relative"
        style={{ minHeight: "calc(100% - 40px)" }}
      />
      
      {/* Custom CSS for map markers - added inline for demonstration */}
      <style jsx global>{`
        .sensor-marker {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .sensor-icon {
          border-radius: 50%;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        .water-quality-icon {
          border-radius: 50%;
        }
        
        .pump-icon {
          border-radius: 3px;
        }
        
        .tank-icon {
          border-radius: 3px;
        }
        
        .valve-icon {
          transform: rotate(45deg);
        }
        
        .environmental-icon {
          border-radius: 0;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        
        .selected {
          z-index: 1000;
        }
        
        .sensor-tooltip {
          padding: 5px;
        }
        
        .sensor-name {
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .sensor-id {
          font-size: 0.8em;
          opacity: 0.8;
          margin-bottom: 3px;
        }
        
        .sensor-reading {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default SensorMap;
