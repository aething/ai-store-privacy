import React, { createContext, useContext, useState } from 'react';
import { OFFLINE_DATA } from '../utils/offlineNavigation';
import { useIsOnline } from '../hooks/useIsOnline';

// Context for offline navigation state
interface OfflineNavigationContextType {
  isOnline: boolean;
  offlineData: typeof OFFLINE_DATA;
  cacheData: (dataType: 'products' | 'user', data: any) => void;
}

const OfflineNavigationContext = createContext<OfflineNavigationContextType>({
  isOnline: true,
  offlineData: OFFLINE_DATA,
  cacheData: () => {},
});

export const useOfflineNavigation = () => useContext(OfflineNavigationContext);

interface OfflineNavigationProviderProps {
  children: React.ReactNode;
}

/**
 * Simplified provider for offline navigation
 * This version removes most of the functionality to help identify what's causing React hook errors
 * 
 * This simplified version is used for the English-only release of the application
 * to ensure stability before re-implementing more advanced offline features.
 */
export const OfflineNavigationProvider: React.FC<OfflineNavigationProviderProps> = ({ children }) => {
  // Use our custom hook for network status
  const isOnline = useIsOnline();
  const [offlineData] = useState(OFFLINE_DATA);
  
  // Simple no-op function for caching
  const cacheData = (dataType: 'products' | 'user', data: any) => {
    console.log(`[OfflineNavigation] Cache data called (simplified version): ${dataType}`);
    // No actual caching in this simplified version
  };
  
  return (
    <OfflineNavigationContext.Provider value={{ isOnline, offlineData, cacheData }}>
      {children}
    </OfflineNavigationContext.Provider>
  );
};

// Add interface for global variable for TypeScript
declare global {
  interface Window {
    AIStoreOffline?: {
      data: typeof OFFLINE_DATA;
      isOnline: boolean;
      cacheData: (dataType: string, data: any) => void;
    };
  }
}

export default OfflineNavigationProvider;