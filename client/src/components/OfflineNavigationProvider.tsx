import React, { useEffect, createContext, useState, useContext } from 'react';
import { 
  initOfflineNavigation, 
  loadOfflineData, 
  cacheDataForOffline, 
  OFFLINE_DATA
} from '../utils/offlineNavigation';

// Контекст для состояния оффлайн-навигации
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

// Хук для использования всего контекста оффлайн-навигации
export const useOfflineNavigation = () => useContext(OfflineNavigationContext);

// Хук только для статуса сети (независимый от useOfflineNavigation для избежания циклических зависимостей)
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

interface OfflineNavigationProviderProps {
  children: React.ReactNode;
}

/**
 * Провайдер для оффлайн-навигации
 * Инициализирует систему оффлайн-навигации и предоставляет контекст для компонентов
 */
export const OfflineNavigationProvider: React.FC<OfflineNavigationProviderProps> = ({ children }) => {
  // Используем встроенный useState для отслеживания состояния сети
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState(OFFLINE_DATA);
  
  // Добавляем эффект для отслеживания состояния сети
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network-status-change' as any, 
      ((event: CustomEvent) => setIsOnline(event.detail.online)) as EventListener
    );
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-status-change' as any, 
        ((event: CustomEvent) => setIsOnline(event.detail.online)) as EventListener
      );
    };
  }, []);
  
  // Инициализация оффлайн-режима при монтировании компонента
  useEffect(() => {
    console.log('[OfflineNavigationProvider] Инициализация...');
    initOfflineNavigation();
    loadOfflineData();
    
    // Обновляем состояние после загрузки данных
    setOfflineData({ ...OFFLINE_DATA });
    
    // При переходе в оффлайн-режим, показываем уведомление
    const handleOffline = () => {
      showOfflineStatusNotification(false);
    };
    
    // При восстановлении соединения, показываем уведомление
    const handleOnline = () => {
      showOfflineStatusNotification(true);
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    // Устанавливаем глобальную переменную для доступа из service worker
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
   * Функция для кэширования данных
   */
  const cacheData = (dataType: 'products' | 'user', data: any) => {
    cacheDataForOffline(dataType, data);
    setOfflineData({ ...OFFLINE_DATA });
  };
  
  // Автоматически кэшируем данные о продуктах при получении их в онлайн-режиме
  useEffect(() => {
    if (isOnline) {
      // Прослушиваем события успешных запросов к API
      const handleApiSuccess = (event: CustomEvent) => {
        const { endpoint, data } = event.detail;
        
        // Кэшируем данные о продуктах
        if (endpoint === '/api/products' && Array.isArray(data)) {
          cacheData('products', data);
          console.log('[OfflineNavigation] Кэшированы данные о продуктах:', data.length);
        }
        
        // Кэшируем данные пользователя
        if (endpoint === '/api/users/me' && data && data.id) {
          cacheData('user', data);
          console.log('[OfflineNavigation] Кэшированы данные пользователя:', data.username);
        }
      };
      
      // Регистрируем слушатель события
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
 * Показывает уведомление о статусе подключения к сети
 */
const showOfflineStatusNotification = (isOnline: boolean) => {
  // Создаем или находим элемент уведомления
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
  
  // Обновляем содержимое и стиль в зависимости от статуса
  if (isOnline) {
    notificationEl.textContent = 'Соединение восстановлено';
    notificationEl.style.backgroundColor = '#4CAF50';
    notificationEl.style.color = 'white';
  } else {
    notificationEl.textContent = 'Вы находитесь в автономном режиме';
    notificationEl.style.backgroundColor = '#FF9800';
    notificationEl.style.color = 'white';
  }
  
  // Показываем уведомление
  notificationEl.style.opacity = '1';
  
  // Автоматически скрываем через 3 секунды
  setTimeout(() => {
    if (notificationEl) {
      notificationEl.style.opacity = '0';
    }
  }, 3000);
  
  // Удаляем через 3.5 секунды (после завершения анимации затухания)
  setTimeout(() => {
    if (notificationEl && notificationEl.parentNode) {
      notificationEl.parentNode.removeChild(notificationEl);
    }
  }, 3500);
};

// Добавляем интерфейс для глобальной переменной для TypeScript
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