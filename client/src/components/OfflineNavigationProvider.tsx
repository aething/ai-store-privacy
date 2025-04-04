import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initOfflineNavigation, 
  loadOfflineData, 
  cacheDataForOffline, 
  OFFLINE_DATA
} from '../utils/offlineNavigation';

// Import the hook from the new hook file
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
 * Simplified version of the offline navigation provider to fix React hook errors
 * 
 * This component is a temporary solution to get the application working
 * while we investigate the root cause of the hook errors
 */
export const OfflineNavigationProvider: React.FC<OfflineNavigationProviderProps> = ({ children }) => {
  // Use our custom hook for network status
  const isOnline = useIsOnline();
  const [offlineData, setOfflineData] = useState(OFFLINE_DATA);
  
  // Initialize offline mode when component mounts
  useEffect(() => {
    console.log('[OfflineNavigationProvider] Initializing with simplified implementation...');
    try {
      initOfflineNavigation();
      loadOfflineData();
      setOfflineData({ ...OFFLINE_DATA });
    } catch (error) {
      console.error('[OfflineNavigationProvider] Error initializing:', error);
    }
    
    return () => {
      console.log('[OfflineNavigationProvider] Cleanup');
    };
  }, []);
  
  /**
   * Simplified function for caching data
   */
  const cacheData = (dataType: 'products' | 'user', data: any) => {
    try {
      cacheDataForOffline(dataType, data);
      setOfflineData({ ...OFFLINE_DATA });
      console.log(`[OfflineNavigation] Data cached: ${dataType}`);
    } catch (error) {
      console.error(`[OfflineNavigation] Error caching ${dataType}:`, error);
    }
  };
  
  // Set up global variable for access from service worker
  useEffect(() => {
    window.AIStoreOffline = {
      data: OFFLINE_DATA,
      isOnline,
      cacheData: cacheDataForOffline
    };
  }, [isOnline]);
  
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
      cacheData: typeof cacheDataForOffline;
    };
  }
}

export default OfflineNavigationProvider;