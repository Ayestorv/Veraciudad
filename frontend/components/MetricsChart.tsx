import React from 'react';
import { Line } from 'react-chartjs-2';

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
};

type MetricsChartProps = {
  selectedSensor: string | null;
  readings: Record<string, Reading[]>;
  activeMetricTab: string;
  setActiveMetricTab: (tab: string) => void;
};

const MetricsChart: React.FC<MetricsChartProps> = ({ 
  selectedSensor, 
  readings, 
  activeMetricTab, 
  setActiveMetricTab 
}) => {
  // Memoize the sensor type to prevent unnecessary recalculations on refresh
  const getSensorType = React.useCallback((sensorId: string): string => {
    if (!sensorId || !readings[sensorId] || readings[sensorId].length === 0) return 'unknown';
    return readings[sensorId][0].sensorType || 'unknown';
  }, [readings]);

  // When tab is changed, update parent state and localStorage
  const handleTabChange = React.useCallback((tab: string) => {
    if (selectedSensor) {
      const type = getSensorType(selectedSensor);
      
      // Skip changes for valve and environmental sensors
      if (type === 'valve' || type === 'environmental') {
        return; // These sensors only support the primary tab
      }
    }
    
    // For all other cases, update in this order:
    console.log('Tab changed to:', tab);
    
    // 1. Update the local ref
    lastValidTabRef.current = tab;
    
    // 2. Update localStorage
    localStorage.setItem('activeMetricTab', tab);
    
    // 3. Update parent state
    setActiveMetricTab(tab);
  }, [setActiveMetricTab, selectedSensor, getSensorType]);
  
  // Keep track of the last valid tab state to prevent unwanted resets
  const lastValidTabRef = React.useRef(activeMetricTab);
  
  // Combined effect to handle tab state on mount and sensor type changes
  React.useEffect(() => {
    // Update the ref with the current active tab
    lastValidTabRef.current = activeMetricTab;
    
    if (selectedSensor) {
      const type = getSensorType(selectedSensor);
      
      // For valve and environmental sensors, always use primary
      if ((type === 'valve' || type === 'environmental')) {
        if (activeMetricTab !== 'primary') {
          console.log('Forcing primary tab for valve/environmental sensor');
          handleTabChange('primary');
        }
      } else {
        // For other sensor types, update localStorage with current tab
        localStorage.setItem('activeMetricTab', activeMetricTab);
      }
    }
  }, [selectedSensor, activeMetricTab, getSensorType, handleTabChange]);
  
  // Determine which tab should be active based on sensor type and last valid tab
  const getEffectiveTab = React.useCallback(() => {
    if (selectedSensor) {
      const type = getSensorType(selectedSensor);
      // For valve and environmental sensors, always use primary data
      if (type === 'valve' || type === 'environmental') {
        return 'primary';
      }
    }
    // Use the lastValidTabRef for non-special sensor types
    return lastValidTabRef.current || activeMetricTab;
  }, [selectedSensor, activeMetricTab, getSensorType]);
  
  // Prepare chart data for the selected sensor
  const getChartData = () => {
    if (!selectedSensor || !readings[selectedSensor]) {
      return {
        labels: [],
        datasets: [
          {
            label: 'No Data',
            data: [],
            borderColor: '#007BFF',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
          },
        ],
      };
    }

    const sensorReadings = readings[selectedSensor];
    const sensorType = getSensorType(selectedSensor);
    const labels = sensorReadings.map(r => new Date(r.timestamp).toLocaleTimeString());
    
    // Different datasets based on sensor type and active tab
    if (sensorType === 'water-quality') {
      if (getEffectiveTab() === 'primary') {
        return {
          labels,
          datasets: [
            {
              label: 'Turbidity (NTU)',
              data: sensorReadings.map(r => r.turbidity),
              borderColor: '#007BFF',
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              yAxisID: 'y',
            },
            {
              label: 'pH',
              data: sensorReadings.map(r => r.pH),
              borderColor: '#28A745',
              backgroundColor: 'rgba(40, 167, 69, 0.2)',
              yAxisID: 'pH',
            },
            {
              label: 'Temperature (°C)',
              data: sensorReadings.map(r => r.temperature),
              borderColor: '#DC3545',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              yAxisID: 'temp',
            },
            {
              label: 'Conductivity (μS/cm)',
              data: sensorReadings.map(r => r.conductivity),
              borderColor: '#FFC107',
              backgroundColor: 'rgba(255, 193, 7, 0.2)',
              yAxisID: 'conductivity',
            },
          ],
        };
      } else {
        return {
          labels,
          datasets: [
            {
              label: 'Chlorine (mg/L)',
              data: sensorReadings.map(r => r.chlorineResidual),
              borderColor: '#6610f2',
              backgroundColor: 'rgba(102, 16, 242, 0.2)',
              yAxisID: 'y',
            },
            {
              label: 'TDS (mg/L)',
              data: sensorReadings.map(r => r.tds),
              borderColor: '#fd7e14',
              backgroundColor: 'rgba(253, 126, 20, 0.2)',
              yAxisID: 'tds',
            },
            {
              label: 'Dissolved Oxygen (mg/L)',
              data: sensorReadings.map(r => r.dissolvedOxygen),
              borderColor: '#20c997',
              backgroundColor: 'rgba(32, 201, 151, 0.2)',
              yAxisID: 'do',
            },
            {
              label: 'ORP (mV)',
              data: sensorReadings.map(r => r.orp),
              borderColor: '#17a2b8',
              backgroundColor: 'rgba(23, 162, 184, 0.2)',
              yAxisID: 'orp',
            },
          ],
        };
      }
    } else if (sensorType === 'pump') {
      if (getEffectiveTab() === 'primary') {
        return {
          labels,
          datasets: [
            {
              label: 'Flow Rate (L/min)',
              data: sensorReadings.map(r => r.flowRate),
              borderColor: '#007BFF',
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              yAxisID: 'y',
            },
            {
              label: 'Pressure (bar)',
              data: sensorReadings.map(r => r.pressure),
              borderColor: '#28A745',
              backgroundColor: 'rgba(40, 167, 69, 0.2)',
              yAxisID: 'pressure',
            },
            {
              label: 'Vibration (mm/s)',
              data: sensorReadings.map(r => r.vibration),
              borderColor: '#DC3545',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              yAxisID: 'vibration',
            },
          ],
        };
      } else {
        return {
          labels,
          datasets: [
            {
              label: 'Motor Current (A)',
              data: sensorReadings.map(r => r.motorCurrent),
              borderColor: '#6f42c1',
              backgroundColor: 'rgba(111, 66, 193, 0.2)',
              yAxisID: 'y',
            },
            {
              label: 'Energy (kWh)',
              data: sensorReadings.map(r => r.energyConsumption),
              borderColor: '#fd7e14',
              backgroundColor: 'rgba(253, 126, 20, 0.2)',
              yAxisID: 'energy',
            },
            {
              label: 'Bearing Temp (°C)',
              data: sensorReadings.map(r => r.bearingTemperature),
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              yAxisID: 'temp',
            },
          ],
        };
      }
    } else if (sensorType === 'tank') {
      if (getEffectiveTab() === 'primary') {
        return {
          labels,
          datasets: [
            {
              label: 'Tank Level (%)',
              data: sensorReadings.map(r => r.tankLevel),
              borderColor: '#007BFF',
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              yAxisID: 'y',
            },
            {
              label: 'Volume (m³)',
              data: sensorReadings.map(r => r.currentVolume),
              borderColor: '#17a2b8',
              backgroundColor: 'rgba(23, 162, 184, 0.2)',
              yAxisID: 'volume',
            },
            {
              label: 'Temperature (°C)',
              data: sensorReadings.map(r => r.temperature),
              borderColor: '#DC3545',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              yAxisID: 'temp',
            },
          ],
        };
      } else {
        // For tanks, we'll show inflow/outflow prediction metrics
        const waterDepthData = sensorReadings.map(r => r.waterDepth);
        
        // Simplified time to empty calculation
        const timeToEmpty = sensorReadings.map((r, i, arr) => {
          if (i < 2) return null;
          const levelChange = (r.tankLevel || 0) - (arr[i-2].tankLevel || 0);
          const timeChange = (r.timestamp - arr[i-2].timestamp) / 1000 / 60;
          const rate = levelChange / timeChange;
          if (rate < 0 && r.tankLevel) {
            return -(r.tankLevel / rate) / 60;
          }
          return null;
        });
        
        return {
          labels,
          datasets: [
            {
              label: 'Water Depth (m)',
              data: waterDepthData,
              borderColor: '#17a2b8',
              backgroundColor: 'rgba(23, 162, 184, 0.2)',
              yAxisID: 'y',
            },
            {
              label: 'Time to Empty (hours)',
              data: timeToEmpty,
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              yAxisID: 'time',
            },
          ],
        };
      }
    } else if (sensorType === 'valve') {
      return {
        labels,
        datasets: [
          {
            label: 'Valve Position (%)',
            data: sensorReadings.map(r => r.valvePosition),
            borderColor: '#007BFF',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            yAxisID: 'y',
          },
          {
            label: 'Flow Rate (L/min)',
            data: sensorReadings.map(r => r.flowRate),
            borderColor: '#28A745',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            yAxisID: 'flow',
          },
          {
            label: 'Pressure (bar)',
            data: sensorReadings.map(r => r.pressure),
            borderColor: '#DC3545',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            yAxisID: 'pressure',
          },
        ],
      };
    } else if (sensorType === 'environmental') {
      return {
        labels,
        datasets: [
          {
            label: 'Rainfall (mm)',
            data: sensorReadings.map(r => r.rainfall),
            borderColor: '#007BFF',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            yAxisID: 'y',
          },
          {
            label: 'Temperature (°C)',
            data: sensorReadings.map(r => r.ambientTemperature),
            borderColor: '#DC3545',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            yAxisID: 'temp',
          },
          {
            label: 'Humidity (%)',
            data: sensorReadings.map(r => r.humidity),
            borderColor: '#6c757d',
            backgroundColor: 'rgba(108, 117, 125, 0.2)',
            yAxisID: 'humidity',
          },
        ],
      };
    } else {
      // Default fallback
      return {
        labels,
        datasets: [
          {
            label: 'Primary Value',
            data: sensorReadings.map(r => 
              r.turbidity ?? r.flowRate ?? r.tankLevel ?? r.valvePosition ?? 0
            ),
            borderColor: '#007BFF',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
          },
        ],
      };
    }
  };
  
  // Get chart options based on sensor type
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0 // Disable animation for better performance with frequent updates
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
          },
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
    };
    
    if (!selectedSensor) return baseOptions;
    
    const sensorType = getSensorType(selectedSensor);
    
    if (sensorType === 'water-quality') {
      if (getEffectiveTab() === 'primary') {
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              position: 'left',
              title: {
                display: true,
                text: 'Turbidity (NTU)',
                color: 'rgba(255, 255, 255, 0.8)',
              },
              max: 100,
            },
            pH: {
              position: 'right',
              title: {
                display: true,
                text: 'pH',
                color: 'rgba(40, 167, 69, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 5,
              max: 9,
              ticks: {
                color: 'rgba(40, 167, 69, 0.8)',
              },
            },
            temp: {
              position: 'right',
              title: {
                display: true,
                text: 'Temperature (°C)',
                color: 'rgba(220, 53, 69, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 30,
              ticks: {
                color: 'rgba(220, 53, 69, 0.8)',
              },
            },
            conductivity: {
              position: 'right',
              title: {
                display: true,
                text: 'Conductivity (μS/cm)',
                color: 'rgba(255, 193, 7, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 1000,
              ticks: {
                color: 'rgba(255, 193, 7, 0.8)',
              },
            },
          },
        };
      } else {
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              position: 'left',
              title: {
                display: true,
                text: 'Chlorine (mg/L)',
                color: 'rgba(102, 16, 242, 0.8)',
              },
              min: 0,
              max: 2,
            },
            tds: {
              position: 'right',
              title: {
                display: true,
                text: 'TDS (mg/L)',
                color: 'rgba(253, 126, 20, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 1000,
              ticks: {
                color: 'rgba(253, 126, 20, 0.8)',
              },
            },
            do: {
              position: 'right',
              title: {
                display: true,
                text: 'Dissolved Oxygen (mg/L)',
                color: 'rgba(32, 201, 151, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 14,
              ticks: {
                color: 'rgba(32, 201, 151, 0.8)',
              },
            },
            orp: {
              position: 'right',
              title: {
                display: true,
                text: 'ORP (mV)',
                color: 'rgba(23, 162, 184, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 500,
              ticks: {
                color: 'rgba(23, 162, 184, 0.8)',
              },
            },
          },
        };
      }
    } else if (sensorType === 'pump') {
      if (getEffectiveTab() === 'primary') {
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              position: 'left',
              title: {
                display: true,
                text: 'Flow Rate (L/min)',
                color: 'rgba(255, 255, 255, 0.8)',
              },
              max: 600,
            },
            pressure: {
              position: 'right',
              title: {
                display: true,
                text: 'Pressure (bar)',
                color: 'rgba(40, 167, 69, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 6,
              ticks: {
                color: 'rgba(40, 167, 69, 0.8)',
              },
            },
            vibration: {
              position: 'right',
              title: {
                display: true,
                text: 'Vibration (mm/s)',
                color: 'rgba(220, 53, 69, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 0.2,
              ticks: {
                color: 'rgba(220, 53, 69, 0.8)',
              },
            },
          },
        };
      } else {
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              position: 'left',
              title: {
                display: true,
                text: 'Motor Current (A)',
                color: 'rgba(111, 66, 193, 0.8)',
              },
              min: 0,
              max: 20,
            },
            energy: {
              position: 'right',
              title: {
                display: true,
                text: 'Energy (kWh)',
                color: 'rgba(253, 126, 20, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 200,
              ticks: {
                color: 'rgba(253, 126, 20, 0.8)',
              },
            },
            temp: {
              position: 'right',
              title: {
                display: true,
                text: 'Bearing Temp (°C)',
                color: 'rgba(220, 53, 69, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 20,
              max: 70,
              ticks: {
                color: 'rgba(220, 53, 69, 0.8)',
              },
            },
          },
        };
      }
    } else if (sensorType === 'tank') {
      if (getEffectiveTab() === 'primary') {
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              position: 'left',
              title: {
                display: true,
                text: 'Tank Level (%)',
                color: 'rgba(255, 255, 255, 0.8)',
              },
              min: 0,
              max: 100,
            },
            volume: {
              position: 'right',
              title: {
                display: true,
                text: 'Volume (m³)',
                color: 'rgba(23, 162, 184, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 1600,
              ticks: {
                color: 'rgba(23, 162, 184, 0.8)',
              },
            },
            temp: {
              position: 'right',
              title: {
                display: true,
                text: 'Temperature (°C)',
                color: 'rgba(220, 53, 69, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 30,
              ticks: {
                color: 'rgba(220, 53, 69, 0.8)',
              },
            },
          },
        };
      } else {
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              position: 'left',
              title: {
                display: true,
                text: 'Water Depth (m)',
                color: 'rgba(23, 162, 184, 0.8)',
              },
              min: 0,
              max: 6,
            },
            time: {
              position: 'right',
              title: {
                display: true,
                text: 'Time to Empty (hours)',
                color: 'rgba(220, 53, 69, 0.8)',
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 72,
              ticks: {
                color: 'rgba(220, 53, 69, 0.8)',
              },
            },
          },
        };
      }
    } else if (sensorType === 'valve') {
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          y: {
            ...baseOptions.scales.y,
            position: 'left',
            title: {
              display: true,
              text: 'Valve Position (%)',
              color: 'rgba(255, 255, 255, 0.8)',
            },
            min: 0,
            max: 100,
          },
          flow: {
            position: 'right',
            title: {
              display: true,
              text: 'Flow Rate (L/min)',
              color: 'rgba(40, 167, 69, 0.8)',
            },
            grid: {
              display: false,
            },
            min: 0,
            max: 600,
            ticks: {
              color: 'rgba(40, 167, 69, 0.8)',
            },
          },
          pressure: {
            position: 'right',
            title: {
              display: true,
              text: 'Pressure (bar)',
              color: 'rgba(220, 53, 69, 0.8)',
            },
            grid: {
              display: false,
            },
            min: 0,
            max: 6,
            ticks: {
              color: 'rgba(220, 53, 69, 0.8)',
            },
          },
        },
      };
    } else if (sensorType === 'environmental') {
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          y: {
            ...baseOptions.scales.y,
            position: 'left',
            title: {
              display: true,
              text: 'Rainfall (mm)',
              color: 'rgba(0, 123, 255, 0.8)',
            },
            min: 0,
            max: 25,
          },
          temp: {
            position: 'right',
            title: {
              display: true,
              text: 'Temperature (°C)',
              color: 'rgba(220, 53, 69, 0.8)',
            },
            grid: {
              display: false,
            },
            min: 0,
            max: 40,
            ticks: {
              color: 'rgba(220, 53, 69, 0.8)',
            },
          },
          humidity: {
            position: 'right',
            title: {
              display: true,
              text: 'Humidity (%)',
              color: 'rgba(108, 117, 125, 0.8)',
            },
            grid: {
              display: false,
            },
            min: 0,
            max: 100,
            ticks: {
              color: 'rgba(108, 117, 125, 0.8)',
            },
          },
        },
      };
    } else {
      // Default fallback
      return baseOptions;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Metrics</h2>
        {selectedSensor && (
          <>
            {/* Only show tabs for sensor types that have secondary metrics */}
            {getSensorType(selectedSensor) !== 'valve' && getSensorType(selectedSensor) !== 'environmental' && (
              <div className="flex p-1 bg-slate-800/60 rounded-lg">
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeMetricTab === 'primary' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  onClick={() => handleTabChange('primary')}
                >
                  Primary
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeMetricTab === 'secondary' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  onClick={() => handleTabChange('secondary')}
                >
                  Secondary
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex-1">
        {selectedSensor ? (
          <Line data={getChartData()} options={getChartOptions() as any} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Select a sensor to view metrics
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsChart; 