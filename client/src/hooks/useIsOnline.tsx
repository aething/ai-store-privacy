import { useState, useEffect } from 'react';

/**
 * A React hook that tracks the online status of the application
 * 
 * @returns {boolean} - Returns true if the application is online, false otherwise
 */
export const useIsOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('[useIsOnline] Browser reported online event');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('[useIsOnline] Browser reported offline event');
      setIsOnline(false);
    };
    
    // Add event listeners for standard browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};