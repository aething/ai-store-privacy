import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Объявление типа для window.networkStatus
declare global {
  interface Window {
    networkStatus?: {
      subscribe: (callback: (online: boolean) => void) => void;
      isOnline: () => boolean;
    };
  }
}

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export default function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [isCachingEnabled, setIsCachingEnabled] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Начальная проверка состояния сети
    setIsOffline(!navigator.onLine);
    
    // Подписка на изменения статуса сети
    const handleOnline = () => {
      setIsOffline(false);
      // Если было оффлайн, показываем индикатор на короткое время
      // с сообщением о восстановлении подключения
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Проверяем, включено ли кэширование (Service Worker)
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          setIsCachingEnabled(registrations.length > 0);
        } catch (err) {
          console.error('Ошибка при проверке Service Worker:', err);
          setIsCachingEnabled(false);
        }
      } else {
        setIsCachingEnabled(false);
      }
    };
    
    checkServiceWorker();
    
    // Используем расширенный API, если он доступен
    if (typeof window !== 'undefined' && 
        'networkStatus' in window &&
        window.networkStatus && 
        typeof window.networkStatus.subscribe === 'function') {
      window.networkStatus.subscribe((online: boolean) => {
        setIsOffline(!online);
        setIsVisible(!online);
      });
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Если устройство онлайн и индикатор не должен быть видимым
  if (!isOffline && !isVisible) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300',
        className
      )}
    >
      <div className={cn(
        'px-4 py-3 rounded-full shadow-lg flex items-center gap-2',
        isOffline ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
      )}>
        {isOffline ? (
          <>
            <WifiOff size={18} />
            <span className="font-medium">
              Нет подключения к сети
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">
              Подключение восстановлено
            </span>
          </>
        )}
        
        {showDetails && isOffline && (
          <Button 
            variant="link" 
            size="sm" 
            className="ml-2 text-red-700 p-0 h-auto"
            asChild
          >
            <Link to="/offline-test">
              Подробнее
            </Link>
          </Button>
        )}
        
        {isOffline && isCachingEnabled === false && (
          <div className="flex items-center gap-1 ml-2 text-xs text-red-600">
            <AlertCircle size={12} />
            <span>Оффлайн режим недоступен</span>
          </div>
        )}
      </div>
    </div>
  );
}