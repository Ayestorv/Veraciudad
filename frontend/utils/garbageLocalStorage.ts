// Utility functions to handle localStorage for garbage management data

// Define types for our data structures
export type User = {
  id: string;
  name: string;
  address: string;
  walletAddress: string;
  pointsBalance: number;
  finesBalance: number;
  onboardedAt: number;
};

export type Bag = {
  id: string;
  userId: string;
  bagType: string;
  qrCode: string;
  rfid: string;
  issuedAt: number;
  txHash: string;
};

export type Bin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  binType: string;
};

export type BlockchainEvent = {
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

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Storage keys
export const STORAGE_KEYS = {
  USERS: 'garbage_users',
  BAGS: 'garbage_bags',
  BINS: 'garbage_bins',
  BIN_IDS: 'garbage_bin_ids',
  EVENTS: 'garbage_blockchain_events'
};

// Save data to localStorage
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Load data from localStorage
export const loadFromLocalStorage = <T>(key: string, defaultValue: T | null): T | null => {
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
export const getPersistedData = <T>(key: string, defaultValue: T | null): T | null => {
  return loadFromLocalStorage<T>(key, defaultValue);
};

// Generic function to save data
export const persistData = <T>(key: string, data: T): T => {
  saveToLocalStorage<T>(key, data);
  return data;
};

// Specific functions for each data type
export const getUsers = (defaultUsers: User[] | null): User[] => {
  return getPersistedData<User[]>(STORAGE_KEYS.USERS, defaultUsers) || [];
};

export const saveUsers = (users: User[]): User[] => {
  return persistData<User[]>(STORAGE_KEYS.USERS, users);
};

export const getBags = (defaultBags: Bag[] | null): Bag[] => {
  return getPersistedData<Bag[]>(STORAGE_KEYS.BAGS, defaultBags) || [];
};

export const saveBags = (bags: Bag[]): Bag[] => {
  return persistData<Bag[]>(STORAGE_KEYS.BAGS, bags);
};

export const getBins = (defaultBins: Bin[] | null): Bin[] => {
  return getPersistedData<Bin[]>(STORAGE_KEYS.BINS, defaultBins) || [];
};

export const saveBins = (bins: Bin[]): Bin[] => {
  return persistData<Bin[]>(STORAGE_KEYS.BINS, bins);
};

export const getBinIds = (defaultBinIds: string[] | null): string[] => {
  return getPersistedData<string[]>(STORAGE_KEYS.BIN_IDS, defaultBinIds) || [];
};

export const saveBinIds = (binIds: string[]): string[] => {
  return persistData<string[]>(STORAGE_KEYS.BIN_IDS, binIds);
};

export const getBlockchainEvents = (defaultEvents: BlockchainEvent[] | null): BlockchainEvent[] => {
  return getPersistedData<BlockchainEvent[]>(STORAGE_KEYS.EVENTS, defaultEvents) || [];
};

export const saveBlockchainEvents = (events: BlockchainEvent[]): BlockchainEvent[] => {
  return persistData<BlockchainEvent[]>(STORAGE_KEYS.EVENTS, events);
};

// Helper to add an event and persist the updated events
export const addBlockchainEvent = (event: BlockchainEvent, events: BlockchainEvent[]): BlockchainEvent[] => {
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