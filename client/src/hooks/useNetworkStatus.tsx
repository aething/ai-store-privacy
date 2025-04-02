import { useState, useEffect } from 'react';

/**
 * Хук для отслеживания состояния сети
 */
function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Добавляем слушатели событий
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Добавляем слушатель для внутреннего события
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