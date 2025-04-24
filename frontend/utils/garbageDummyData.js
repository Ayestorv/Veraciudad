/**
 * Dummy data utility for garbage monitoring system
 * Provides sample data to visualize the dashboard when backend is not available
 */

// Import PANAMA_CITY_CENTER for consistency with water system
import { PANAMA_CITY_CENTER } from './dummyData';

// Helper to generate random hex string
const generateRandomHex = (length) => {
  let result = '';
  const characters = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate garbage bins around Panama City
export const generateGarbageBins = (count = 40) => {
  const result = [];
  
  // Areas to distribute garbage bins
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
  
  // Bin types
  const binTypes = ['general-waste', 'recyclable', 'organic'];
  
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
    
    // Select random bin type
    const binType = binTypes[Math.floor(Math.random() * binTypes.length)];
    
    // Format bin number with leading zeros
    const formattedNumber = (i + 1).toString().padStart(3, '0');
    
    // Create new garbage bin
    result.push({
      id: `bin-${formattedNumber}`,
      name: `${area.name} ${binType} bin ${i + 1}`,
      lat: newLat,
      lng: newLng,
      type: 'garbage',
      binType: binType
    });
  }
  
  return result;
};

// Panama City garbage bins
export const GARBAGE_BINS = generateGarbageBins(40);

// Export all bin IDs for use in the app
export const BIN_IDS = GARBAGE_BINS.map(bin => bin.id);

// Network connections between bins for visualization (optional)
export const BIN_NETWORK_CONNECTIONS = [
  // We can create logical groupings of bins by area
  // Punta Pacifica cluster
  { from: 'bin-001', to: 'bin-002' },
  { from: 'bin-002', to: 'bin-003' },
  { from: 'bin-003', to: 'bin-004' },
  
  // San Francisco cluster
  { from: 'bin-010', to: 'bin-011' },
  { from: 'bin-011', to: 'bin-012' },
  
  // El Cangrejo cluster
  { from: 'bin-020', to: 'bin-021' },
  { from: 'bin-021', to: 'bin-022' },
  
  // Connect some major hubs
  { from: 'bin-001', to: 'bin-010' },
  { from: 'bin-010', to: 'bin-020' },
  { from: 'bin-020', to: 'bin-030' }
];

// Generate government users
export const generateUsers = (count = 100) => {
  const firstNames = [
    'Maria', 'Juan', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Miguel', 'Elena', 
    'Pedro', 'Laura', 'Roberto', 'Carmen', 'Jose', 'Gabriela', 'Francisco', 
    'Patricia', 'Fernando', 'Isabel', 'Jorge', 'Mariana'
  ];
  
  const lastNames = [
    'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 
    'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 
    'Diaz', 'Reyes', 'Cruz', 'Morales', 'Ortiz', 'Gutierrez', 'Chavez'
  ];
  
  const districts = [
    'Punta Pacifica', 'San Francisco', 'El Cangrejo', 'Obarrio', 'Marbella', 
    'Bella Vista', 'Albrook', 'Juan Diaz', 'Panama Viejo', 'El Dorado'
  ];
  
  const streetNames = [
    'Calle 50', 'Avenida Balboa', 'Via Argentina', 'Via España', 'Via Porras',
    'Calle Uruguay', 'Avenida Central', 'Calle Ricardo Arias', 'Via Israel',
    'Calle Manuel Espinosa Batista'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const id = `user-${(i + 1).toString().padStart(3, '0')}`;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const houseNumber = Math.floor(Math.random() * 200) + 1;
    const walletAddress = `0x${generateRandomHex(40)}`;
    
    return {
      id,
      name: `${firstName} ${lastName}`,
      address: `${streetName} #${houseNumber}, ${district}, Panama City`,
      walletAddress,
      pointsBalance: 0, // Initialize points balance
      finesBalance: 0,  // Initialize fines balance
      onboardedAt: Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
    };
  });
};

// Generate tracked bags for users
export const generateBags = (users) => {
  const bagTypes = ['general-waste', 'recyclable', 'organic'];
  let bags = [];
  
  users.forEach(user => {
    // Each user gets 3-5 bags
    const bagCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < bagCount; i++) {
      const bagType = bagTypes[Math.floor(Math.random() * bagTypes.length)];
      const bagId = `bag-${user.id.split('-')[1]}-${(i + 1).toString().padStart(2, '0')}`;
      const qrCode = `QR-${generateRandomHex(12)}`;
      const rfid = `RFID-${generateRandomHex(16)}`;
      const issuedAt = user.onboardedAt + (Math.random() * 5 * 24 * 60 * 60 * 1000); // 0-5 days after user onboarded
      const txHash = `0x${generateRandomHex(64)}`;
      
      bags.push({
        id: bagId,
        userId: user.id,
        bagType,
        qrCode,
        rfid,
        issuedAt,
        txHash
      });
    }
  });
  
  return bags;
};

// Create users and bags
export const USERS = generateUsers();
export const BAGS = generateBags(USERS);

// Helper to get random date in the past (within max days)
const getRandomPastDate = (maxDays = 7) => {
  const now = Date.now();
  return now - Math.floor(Math.random() * maxDays * 24 * 60 * 60 * 1000);
};

// Generate dummy readings for each bin
export const generateDummyReadings = () => {
  const now = Date.now();
  const readings = {};
  
  // For each bin, generate 30 readings over the last 2.5 hours (5 min intervals)
  BIN_IDS.forEach(binId => {
    // Find bin in GARBAGE_BINS to get coordinates
    const binInfo = GARBAGE_BINS.find(b => b.id === binId);
    
    // Initialize collection timestamp - random time in the past week
    let collectionTimestamp = getRandomPastDate();
    
    readings[binId] = Array.from({ length: 30 }, (_, i) => {
      const timestamp = now - ((30 - i) * 5 * 60 * 1000);
      const baseReading = {
        sensorId: binId,
        timestamp,
        sensorType: 'garbage'
      };
      
      // Add coordinates from GARBAGE_BINS
      if (binInfo) {
        baseReading.latitude = binInfo.lat;
        baseReading.longitude = binInfo.lng;
      }
      
      // Calculate fill level - starts at 0 after collection and increases over time
      // More realistic fill pattern: slow at first, then faster
      const hoursSinceCollection = (timestamp - collectionTimestamp) / (60 * 60 * 1000);
      const fillRateModifier = Math.max(0.5, Math.min(2.0, 0.8 + Math.random())); // Random rate modifier
      let fillLevel = Math.min(100, hoursSinceCollection * fillRateModifier * 2); // Roughly 2% per hour average
      
      // Add some noise to the fill level for realism
      fillLevel = Math.max(0, Math.min(100, fillLevel + (Math.random() * 5 - 2.5)));
      
      // Simulate door opening events - true with 10% probability if there's activity
      const doorOpenProbability = fillLevel > 80 ? 0.2 : 0.1; // More likely when bin is full
      const doorOpen = Math.random() < doorOpenProbability;
      
      // If fill level reaches 95%, simulate a collection
      if (fillLevel > 95 && Math.random() > 0.7) {
        collectionTimestamp = timestamp;
        fillLevel = 0; // Reset fill level after collection
      }
      
      // Add txHash for readings with very high fill levels or door openings for blockchain events
      const txHash = (fillLevel > 90 || doorOpen) ? `0x${generateRandomHex(64)}` : undefined;
      
      // Add last disposal info occasionally
      let lastDisposal = undefined;
      if (i > 20 && Math.random() > 0.7) {
        const randomBag = BAGS[Math.floor(Math.random() * BAGS.length)];
        const wasteType = binInfo.binType;
        const isCorrect = randomBag.bagType === wasteType;
        
        lastDisposal = {
          userId: randomBag.userId,
          bagId: randomBag.id,
          timestamp: timestamp - Math.floor(Math.random() * 60 * 60 * 1000), // 0-60 minutes ago
          isCorrect,
          disposalTxHash: `0x${generateRandomHex(64)}`
        };
      }
      
      return {
        ...baseReading,
        fillLevel,
        doorOpen,
        lastCollectionTimestamp: collectionTimestamp,
        batteryLevel: 100 - (i * 0.3) + (Math.random() * 1 - 0.5), // Same as environmental sensors
        binType: binInfo?.binType || 'general-waste',
        lastDisposal,
        txHash
      };
    });
  });
  
  return readings;
};

// Generate disposal events for blockchain timelines
export const generateDummyDisposals = () => {
  const events = [];
  const now = Date.now();
  
  // Generate disposal events
  BAGS.forEach(bag => {
    // Each bag has 0-5 disposal events
    const disposalCount = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < disposalCount; i++) {
      // Find a random bin with matching or non-matching waste type
      const matchingBin = GARBAGE_BINS.filter(bin => bin.binType === bag.bagType);
      const nonMatchingBin = GARBAGE_BINS.filter(bin => bin.binType !== bag.bagType);
      
      // 80% chance of correct disposal
      const isCorrectDisposal = Math.random() > 0.2;
      const selectedBin = isCorrectDisposal 
        ? matchingBin[Math.floor(Math.random() * matchingBin.length)]
        : nonMatchingBin[Math.floor(Math.random() * nonMatchingBin.length)];
      
      if (!selectedBin) continue; // Skip if no suitable bin found
      
      // Create the disposal event
      const timestamp = now - (Math.random() * 30 * 24 * 60 * 60 * 1000); // Within the last month
      
      events.push({
        sensorId: selectedBin.id,
        userId: bag.userId,
        bagId: bag.id,
        wasteType: selectedBin.binType,
        bagType: bag.bagType,
        correct: isCorrectDisposal,
        metricType: isCorrectDisposal ? 'correctDisposal' : 'misuseAlert',
        timestamp,
        txHash: `0x${generateRandomHex(64)}`
      });
    }
  });
  
  // Sort by timestamp (newest first)
  events.sort((a, b) => b.timestamp - a.timestamp);
  
  return events;
};

// Generate reward and fine events
export const generateRewardsAndFines = () => {
  const events = [];
  const now = Date.now();
  
  // For each user, generate some reward and fine events
  USERS.forEach(user => {
    let pointsBalance = 0;
    let finesBalance = 0;
    
    // Generate 0-5 reward events
    const rewardCount = Math.floor(Math.random() * 6);
    for (let i = 0; i < rewardCount; i++) {
      const points = Math.floor(Math.random() * 10) + 1; // 1-10 points
      pointsBalance += points;
      
      events.push({
        userId: user.id,
        points,
        timestamp: now - (Math.random() * 30 * 24 * 60 * 60 * 1000), // Within the last month
        metricType: 'rewardIssued',
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    
    // Generate 0-3 fine events
    const fineCount = Math.floor(Math.random() * 4);
    for (let i = 0; i < fineCount; i++) {
      const amount = (Math.floor(Math.random() * 5) + 1) * 5; // $5, $10, $15, $20, or $25
      finesBalance += amount;
      
      events.push({
        userId: user.id,
        amount,
        timestamp: now - (Math.random() * 30 * 24 * 60 * 60 * 1000), // Within the last month
        metricType: 'fineIssued',
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    
    // Update user's points and fines balance
    user.pointsBalance = pointsBalance;
    user.finesBalance = finesBalance;
  });
  
  // Sort by timestamp (newest first)
  events.sort((a, b) => b.timestamp - a.timestamp);
  
  return events;
};

// Generate blockchain timeline events that combine various types
export const generateDummyEvents = () => {
  // Get disposal events
  const disposalEvents = generateDummyDisposals();
  
  // Get reward and fine events
  const rewardAndFineEvents = generateRewardsAndFines();
  
  // Generate other types of events (from the original implementation)
  const binEvents = [];
  
  // Generate various types of events
  BIN_IDS.forEach(binId => {
    // Find bin info
    const binInfo = GARBAGE_BINS.find(b => b.id === binId);
    
    // Add fill level alert events (when fill level is high)
    if (Math.random() > 0.6) {
      binEvents.push({
        sensorId: binId,
        metricType: 'fillLevelAlert',
        value: Math.floor(Math.random() * 10) + 90, // 90-100% range (threshold events)
        timestamp: Date.now() - (Math.random() * 40 * 60 * 1000), // Random in last 40 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    
    // Add collection events
    if (Math.random() > 0.7) {
      binEvents.push({
        sensorId: binId,
        metricType: 'collectionConfirmed',
        value: 0, // After collection, fill level is 0
        timestamp: Date.now() - (Math.random() * 80 * 60 * 1000), // Random in last 80 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    
    // Add door open events
    if (Math.random() > 0.8) {
      binEvents.push({
        sensorId: binId,
        metricType: 'doorOpenAlert',
        value: 1, // Boolean 1 for open
        timestamp: Date.now() - (Math.random() * 60 * 60 * 1000), // Random in last 60 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
    
    // Add battery low events for some bins
    if (Math.random() > 0.9) {
      binEvents.push({
        sensorId: binId,
        metricType: 'batteryLow',
        value: Math.floor(Math.random() * 10) + 5, // 5-15% range
        timestamp: Date.now() - (Math.random() * 120 * 60 * 1000), // Random in last 120 mins
        txHash: `0x${generateRandomHex(64)}`
      });
    }
  });
  
  // Combine all events
  const allEvents = [...disposalEvents, ...rewardAndFineEvents, ...binEvents];
  
  // Sort by timestamp (newest first)
  allEvents.sort((a, b) => b.timestamp - a.timestamp);
  
  // Return the first batch of events for display
  return allEvents.slice(0, 50);
};

// Generate all bag issuance events for the blockchain timeline
export const generateBagIssuanceEvents = () => {
  return BAGS.map(bag => ({
    bagId: bag.id,
    userId: bag.userId,
    timestamp: bag.issuedAt,
    metricType: 'bagIssued',
    txHash: bag.txHash
  })).sort((a, b) => b.timestamp - a.timestamp);
};

// Mock service adapter for simulating blockchain operations
export const blockchainAdapter = {
  // User registration
  registerUser: (userData) => {
    return {
      ...userData,
      id: `user-${(USERS.length + 1).toString().padStart(3, '0')}`,
      onboardedAt: Date.now(),
      txHash: `0x${generateRandomHex(64)}`
    };
  },
  
  // Issue a bag to a user
  issueBag: (bagData) => {
    const txHash = `0x${generateRandomHex(64)}`;
    return {
      ...bagData,
      issuedAt: Date.now(),
      txHash
    };
  },
  
  // Record disposal scan
  recordDisposal: (disposalData) => {
    // Check if disposal is correct
    const bag = BAGS.find(bag => bag.id === disposalData.bagId);
    const bin = GARBAGE_BINS.find(bin => bin.id === disposalData.sensorId);
    
    if (!bag || !bin) {
      return {
        error: 'Invalid bag or bin'
      };
    }
    
    const isCorrect = bag.bagType === bin.binType;
    const txHash = `0x${generateRandomHex(64)}`;
    
    return {
      ...disposalData,
      wasteType: bin.binType,
      bagType: bag.bagType,
      correct: isCorrect,
      metricType: isCorrect ? 'correctDisposal' : 'misuseAlert',
      timestamp: Date.now(),
      txHash
    };
  },
  
  // Issue reward points to a user
  issueReward: (userId, points) => {
    return {
      userId,
      points,
      timestamp: Date.now(),
      metricType: 'rewardIssued',
      txHash: `0x${generateRandomHex(64)}`
    };
  },
  
  // Issue a fine to a user
  issueFine: (userId, amount) => {
    return {
      userId,
      amount,
      timestamp: Date.now(),
      metricType: 'fineIssued',
      txHash: `0x${generateRandomHex(64)}`
    };
  }
};

// BLOCKCHAIN_EVENTS for PointsDashboard
export const BLOCKCHAIN_EVENTS = (() => {
  const events = [];
  const now = Date.now();
  let eventId = 1;
  
  // Add user registration events
  USERS.forEach(user => {
    events.push({
      id: `event-${eventId++}`,
      timestamp: user.onboardedAt,
      txHash: `0x${generateRandomHex(64)}`,
      eventType: 'user-registration',
      userId: user.id
    });
  });
  
  // Add bag issuance events
  BAGS.forEach(bag => {
    events.push({
      id: `event-${eventId++}`,
      timestamp: bag.issuedAt,
      txHash: bag.txHash,
      eventType: 'bag-issuance',
      userId: bag.userId,
      bagId: bag.id
    });
  });
  
  // Generate disposal events from dummy disposals
  const disposalEvents = generateDummyDisposals();
  disposalEvents.forEach(disposal => {
    events.push({
      id: `event-${eventId++}`,
      timestamp: disposal.timestamp,
      txHash: disposal.txHash,
      eventType: 'disposal',
      userId: disposal.userId,
      bagId: disposal.bagId,
      sensorId: disposal.sensorId,
      correct: disposal.correct
    });
    
    // Add corresponding reward or fine based on disposal correctness
    if (disposal.correct) {
      // Award points (1-5 points for correct disposal)
      const points = Math.floor(Math.random() * 5) + 1;
      
      events.push({
        id: `event-${eventId++}`,
        timestamp: disposal.timestamp + 1000, // 1 second after disposal
        txHash: `0x${generateRandomHex(64)}`,
        eventType: 'reward',
        userId: disposal.userId,
        pointsAwarded: points
      });
    } else {
      // Issue fine ($5-$20 for incorrect disposal)
      const fineAmount = (Math.floor(Math.random() * 4) + 1) * 5;
      
      events.push({
        id: `event-${eventId++}`,
        timestamp: disposal.timestamp + 1000, // 1 second after disposal
        txHash: `0x${generateRandomHex(64)}`,
        eventType: 'fine',
        userId: disposal.userId,
        fineAmount: fineAmount
      });
    }
  });
  
  // Sort events by timestamp (newest first)
  return events.sort((a, b) => b.timestamp - a.timestamp);
})(); 