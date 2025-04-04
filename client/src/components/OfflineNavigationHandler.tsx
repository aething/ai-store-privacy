import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { isRouteAvailableOffline } from '../utils/offlineNavigation';
import { useOfflineNavigation } from './OfflineNavigationProvider';

/**
 * Navigation handler for offline mode
 * 
 * This component:
 * 1. Tracks route changes
 * 2. Checks route availability in offline mode
 * 3. Redirects to the offline page if the route is not available in offline mode
 */
export const OfflineNavigationHandler: React.FC = () => {
  const { isOnline } = useOfflineNavigation();
  const [location, setLocation] = useLocation();
  const [isOfflinePage] = useRoute('/offline-enhanced');
  
  useEffect(() => {
    if (!isOnline && !isOfflinePage) {
      // Check if the current route is available offline
      const isAvailableOffline = isRouteAvailableOffline(location);
      
      if (!isAvailableOffline) {
        console.log(`[OfflineNavigationHandler] Route ${location} is not available offline, redirecting to offline page`);
        setLocation('/offline-enhanced');
      } else {
        console.log(`[OfflineNavigationHandler] Route ${location} is available offline`);
      }
    }
  }, [location, isOnline, isOfflinePage, setLocation]);
  
  // This component doesn't render any UI
  return null;
};

export default OfflineNavigationHandler;