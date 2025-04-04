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
 */
export const OfflineNavigationProvider: React.FC<OfflineNavigationProviderProps> = ({ children }) => {
  // Use our custom hook for network status
  const isOnline = useIsOnline();
  const [offlineData] = useState(OFFLINE_DATA);
  
  // Simple no-op function for caching
  const cacheData = () => {
    console.log('[OfflineNavigation] Cache data called (simplified version)');
  };
  
  return (
    <OfflineNavigationContext.Provider value={{ isOnline, offlineData, cacheData }}>
      {children}
    </OfflineNavigationContext.Provider>
  );
};

export default OfflineNavigationProvider;