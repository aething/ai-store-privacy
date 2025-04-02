import React, { useEffect, useState } from 'react';
import useNetworkStatus from '../hooks/useNetworkStatus';

/**
 * Компонент индикатора офлайн режима.
 * Показывает информацию о состоянии подключения и доступности оффлайн-режима.
 */
const OfflineIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  const [serviceWorkerVersion, setServiceWorkerVersion] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Проверяем состояние Service Worker
    const checkServiceWorker = () => {
      const isActive = !!navigator.serviceWorker && !!navigator.serviceWorker.controller;
      setServiceWorkerActive(isActive);
      
      if (isActive && navigator.serviceWorker.controller) {
        // Запрашиваем версию у Service Worker
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.type === 'VERSION_INFO') {
            setServiceWorkerVersion(event.data.payload.version);
          }
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION', messageId: Date.now().toString() },
          [messageChannel.port2]
        );
      }
    };
    
    // Проверяем состояние Service Worker при загрузке
    checkServiceWorker();
    
    // И периодически проверяем
    const intervalId = setInterval(checkServiceWorker, 10000);

    // Обработчик сообщений от Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        setServiceWorkerActive(true);
        setServiceWorkerVersion(event.data.version);
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      clearInterval(intervalId);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Не показываем индикатор, если онлайн и не в режиме отладки
  if (isOnline && !showDetails && !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 
        ${!isOnline ? 'bg-orange-100 border-orange-400' : 'bg-green-100 border-green-400'} 
        border-l-4 flex items-center`}
      onClick={() => setShowDetails(!showDetails)}
    >
      <span className={`material-icons mr-2 ${!isOnline ? 'text-orange-500' : 'text-green-500'}`}>
        {!isOnline ? 'wifi_off' : 'offline_pin'}
      </span>
      <div>
        {!isOnline ? (
          <div>
            <p className="font-medium">Офлайн режим</p>
            <p className="text-sm text-gray-600">Приложение работает без подключения к интернету</p>
            {serviceWorkerActive && (
              <p className="text-xs text-gray-500">
                <span id="service-worker-status">Service Worker активен</span>
                {serviceWorkerVersion && ` (v${serviceWorkerVersion})`}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-medium">Онлайн режим</p>
            <p className="text-sm text-gray-600">
              {serviceWorkerActive 
                ? 'Оффлайн-режим доступен' 
                : 'Оффлайн-режим не активирован'}
            </p>
            {serviceWorkerActive && (
              <p className="text-xs text-gray-500">
                <span id="service-worker-status">Service Worker активен</span>
                {serviceWorkerVersion && ` (v${serviceWorkerVersion})`}
              </p>
            )}
          </div>
        )}
        
        {/* Дополнительная информация в режиме отладки */}
        {showDetails && (
          <div className="text-xs mt-2 pt-2 border-t border-gray-200">
            <p>Статус: {isOnline ? 'Онлайн' : 'Оффлайн'}</p>
            <p>SW: {serviceWorkerActive ? 'Активен' : 'Неактивен'}</p>
            <p>Контроллер: {navigator.serviceWorker?.controller ? 'Да' : 'Нет'}</p>
            <p className="mt-1 text-[10px] opacity-70 italic">Нажмите, чтобы скрыть</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;