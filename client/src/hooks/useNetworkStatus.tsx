import { useState, useEffect } from 'react';

/**
 * React hook that tracks network status
 * This hook can only be used within a React functional component
 * 
 * @returns boolean - true if online, false if offline
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Add listener for internal event
    const handleNetworkStatusChange = (event: CustomEvent) => {
      setIsOnline(event.detail.online);
    };
    
    window.addEventListener('network-status-change' as any, handleNetworkStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-status-change' as any, handleNetworkStatusChange as EventListener);
    };
  }, []);
  
  return isOnline;
}

export default useNetworkStatus;