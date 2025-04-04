import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { isRouteAvailableOffline, useNetworkStatus } from '../utils/offlineNavigation';

/**
 * Обработчик навигации для оффлайн-режима
 * 
 * Этот компонент:
 * 1. Отслеживает изменения маршрута
 * 2. Проверяет доступность маршрута в оффлайн-режиме
 * 3. Перенаправляет на оффлайн-страницу, если маршрут недоступен в оффлайн-режиме
 */
export const OfflineNavigationHandler: React.FC = () => {
  const isOnline = useNetworkStatus();
  const [location, setLocation] = useLocation();
  const [isOfflinePage] = useRoute('/offline-enhanced');
  const [isInOfflinePage] = useRoute('/offline.html');
  
  useEffect(() => {
    if (!isOnline && !isOfflinePage && !isInOfflinePage) {
      // Проверяем, доступен ли текущий маршрут в оффлайн-режиме
      const isAvailableOffline = isRouteAvailableOffline(location);
      
      if (!isAvailableOffline) {
        console.log(`[OfflineNavigationHandler] Маршрут ${location} недоступен офлайн, перенаправление на оффлайн-страницу`);
        setLocation('/offline.html');
      } else {
        console.log(`[OfflineNavigationHandler] Маршрут ${location} доступен офлайн`);
      }
    }
  }, [location, isOnline, isOfflinePage, setLocation]);
  
  // Компонент не рендерит никакого UI
  return null;
};

export default OfflineNavigationHandler;