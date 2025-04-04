import React, { useEffect, createContext, useState, useContext } from 'react';
import { 
  initOfflineNavigation, 
  loadOfflineData, 
  cacheDataForOffline, 
  useNetworkStatus,
  OFFLINE_DATA
} from '../utils/offlineNavigation';

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
 * Provider for offline navigation
 * Initializes the offline navigation system and provides context for components
 */
export const OfflineNavigationProvider: React.FC<OfflineNavigationProviderProps> = ({ children }) => {
  const isOnline = useNetworkStatus();
  const [offlineData, setOfflineData] = useState(OFFLINE_DATA);
  
  // Initialize offline mode when component mounts
  useEffect(() => {
    console.log('[OfflineNavigationProvider] Initializing...');
    initOfflineNavigation();
    loadOfflineData();
    
    // Update state after loading data
    setOfflineData({ ...OFFLINE_DATA });
    
    // When switching to offline mode, show notification
    const handleOffline = () => {
      showOfflineStatusNotification(false);
    };
    
    // When connection is restored, show notification
    const handleOnline = () => {
      showOfflineStatusNotification(true);
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    // Set global variable for access from service worker
    window.AIStoreOffline = {
      data: OFFLINE_DATA,
      isOnline,
      cacheData: cacheDataForOffline
    };
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  /**
   * Function for caching data
   */
  const cacheData = (dataType: 'products' | 'user', data: any) => {
    cacheDataForOffline(dataType, data);
    setOfflineData({ ...OFFLINE_DATA });
  };
  
  // Automatically cache product data when received in online mode
  useEffect(() => {
    if (isOnline) {
      // Listen for successful API request events
      const handleApiSuccess = (event: CustomEvent) => {
        const { endpoint, data } = event.detail;
        
        // Cache product data
        if (endpoint === '/api/products' && Array.isArray(data)) {
          cacheData('products', data);
          console.log('[OfflineNavigation] Product data cached:', data.length);
        }
        
        // Cache user data
        if (endpoint === '/api/users/me' && data && data.id) {
          cacheData('user', data);
          console.log('[OfflineNavigation] User data cached:', data.username);
        }
      };
      
      // Register event listener
      window.addEventListener('api-success' as any, handleApiSuccess as EventListener);
      
      return () => {
        window.removeEventListener('api-success' as any, handleApiSuccess as EventListener);
      };
    }
  }, [isOnline]);
  
  return (
    <OfflineNavigationContext.Provider value={{ isOnline, offlineData, cacheData }}>
      {children}
    </OfflineNavigationContext.Provider>
  );
};

/**
 * Shows notification about network connection status
 */
const showOfflineStatusNotification = (isOnline: boolean) => {
  // Create or find notification element
  let notificationEl = document.getElementById('offline-status-notification');
  
  if (!notificationEl) {
    notificationEl = document.createElement('div');
    notificationEl.id = 'offline-status-notification';
    notificationEl.style.position = 'fixed';
    notificationEl.style.top = '20px';
    notificationEl.style.left = '50%';
    notificationEl.style.transform = 'translateX(-50%)';
    notificationEl.style.padding = '10px 20px';
    notificationEl.style.borderRadius = '4px';
    notificationEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notificationEl.style.zIndex = '9999';
    notificationEl.style.transition = 'opacity 0.3s ease-in-out';
    document.body.appendChild(notificationEl);
  }
  
  // Update content and style based on status (in English)
  if (isOnline) {
    notificationEl.textContent = 'Connection restored';
    notificationEl.style.backgroundColor = '#4CAF50';
    notificationEl.style.color = 'white';
  } else {
    notificationEl.textContent = 'You are in offline mode';
    notificationEl.style.backgroundColor = '#FF9800';
    notificationEl.style.color = 'white';
  }
  
  // Show notification
  notificationEl.style.opacity = '1';
  
  // Automatically hide after 3 seconds
  setTimeout(() => {
    if (notificationEl) {
      notificationEl.style.opacity = '0';
    }
  }, 3000);
  
  // Remove after 3.5 seconds (after fade-out animation completes)
  setTimeout(() => {
    if (notificationEl && notificationEl.parentNode) {
      notificationEl.parentNode.removeChild(notificationEl);
    }
  }, 3500);
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