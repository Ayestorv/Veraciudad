// Utility functions to handle localStorage for garbage management data

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'garbage_users',
  BAGS: 'garbage_bags',
  BINS: 'garbage_bins',
  BIN_IDS: 'garbage_bin_ids',
  EVENTS: 'garbage_blockchain_events'
};

// Save data to localStorage
export const saveToLocalStorage = (key, data) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Load data from localStorage
export const loadFromLocalStorage = (key, defaultValue) => {
  if (!isBrowser) return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Generic function to load or initialize data
export const getPersistedData = (key, defaultValue) => {
  return loadFromLocalStorage(key, defaultValue);
};

// Generic function to save data
export const persistData = (key, data) => {
  saveToLocalStorage(key, data);
  return data;
};

// Specific functions for each data type
export const getUsers = (defaultUsers) => {
  return getPersistedData(STORAGE_KEYS.USERS, defaultUsers);
};

export const saveUsers = (users) => {
  return persistData(STORAGE_KEYS.USERS, users);
};

export const getBags = (defaultBags) => {
  return getPersistedData(STORAGE_KEYS.BAGS, defaultBags);
};

export const saveBags = (bags) => {
  return persistData(STORAGE_KEYS.BAGS, bags);
};

export const getBins = (defaultBins) => {
  return getPersistedData(STORAGE_KEYS.BINS, defaultBins);
};

export const saveBins = (bins) => {
  return persistData(STORAGE_KEYS.BINS, bins);
};

export const getBinIds = (defaultBinIds) => {
  return getPersistedData(STORAGE_KEYS.BIN_IDS, defaultBinIds);
};

export const saveBinIds = (binIds) => {
  return persistData(STORAGE_KEYS.BIN_IDS, binIds);
};

export const getBlockchainEvents = (defaultEvents) => {
  return getPersistedData(STORAGE_KEYS.EVENTS, defaultEvents);
};

export const saveBlockchainEvents = (events) => {
  return persistData(STORAGE_KEYS.EVENTS, events);
};

// Helper to add an event and persist the updated events
export const addBlockchainEvent = (event, events) => {
  // Add ID if missing
  if (!event.id) {
    const maxId = events.reduce((max, e) => {
      const idNum = parseInt(e.id.split('-')[1], 10);
      return idNum > max ? idNum : max;
    }, 0);
    event.id = `event-${maxId + 1}`;
  }
  
  // Add timestamp if missing
  if (!event.timestamp) {
    event.timestamp = Date.now();
  }
  
  // Create updated events array
  const updatedEvents = [event, ...events];
  
  // Save to localStorage
  saveBlockchainEvents(updatedEvents);
  
  return updatedEvents;
};

// Export all storage keys
export { STORAGE_KEYS }; 