/**
 * Утилиты для интеграции с Capacitor/Android
 * 
 * Этот модуль содержит функции для определения и работы с 
 * Android-окружением при использовании Capacitor
 */

// Проверяем, запущено ли приложение в Android
export function isAndroidApp(): boolean {
  // Проверка по User-Agent
  const isAndroidUserAgent = 
    navigator.userAgent.includes('Android') || 
    navigator.userAgent.includes('Capacitor');
  
  // Проверка через window.Capacitor, если он доступен
  const hasCapacitorObject = typeof window !== 'undefined' && 
    'Capacitor' in window && 
    typeof (window as any).Capacitor !== 'undefined';
  
  return isAndroidUserAgent || hasCapacitorObject;
}

// Получаем информацию об Android-устройстве
export function getAndroidInfo(): any {
  if (!isAndroidApp()) {
    return null;
  }
  
  // Используем Capacitor API, если доступен
  if (typeof window !== 'undefined' && 'Capacitor' in window) {
    const capacitor = (window as any).Capacitor;
    
    if (capacitor.Plugins && capacitor.Plugins.Device) {
      try {
        return capacitor.Plugins.Device.getInfo();
      } catch (error) {
        console.error('Ошибка при получении информации о устройстве через Capacitor:', error);
      }
    }
  }
  
  // Запасной вариант - базовая информация из navigator
  return {
    platform: 'android',
    userAgent: navigator.userAgent,
    isVirtual: false,
    manufacturer: 'Unknown',
    model: 'Android Device'
  };
}

// Инициализируем оффлайн-режим для Android
export function initAndroidOfflineMode(): void {
  if (!isAndroidApp()) {
    return;
  }
  
  console.log('[Capacitor Bridge] Инициализация оффлайн-режима для Android');
  
  // Добавляем CSS класс для Android-приложения
  document.documentElement.classList.add('android-app');
  
  // Активируем кэширование основных ресурсов
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    const controller = navigator.serviceWorker.controller;
    controller.postMessage({
      type: 'ANDROID_INIT',
      timeStamp: Date.now()
    });
    
    // Принудительно кэшируем дополнительные ресурсы для оффлайн-режима
    const essentialResources = [
      '/',
      '/index.html',
      '/offline-enhanced.html',
      '/index.css',
      '/manifest.json'
    ];
    
    cacheResources(essentialResources).catch(error => {
      console.warn('[Capacitor Bridge] Ошибка при кэшировании ресурсов:', error);
    });
  }
}

// Кэшируем ресурсы через Service Worker
async function cacheResources(urls: string[]): Promise<any> {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    return { error: 'Service Worker не активен' };
  }
  
  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data && event.data.type === 'CACHE_ANDROID_RESOURCES_RESPONSE') {
        resolve(event.data.payload);
      } else if (event.data && event.data.type === 'CACHE_ANDROID_RESOURCES_ERROR') {
        reject(event.data.payload.error);
      }
    };
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(
        {
          type: 'CACHE_ANDROID_RESOURCES',
          payload: { urls }
        },
        [messageChannel.port2]
      );
    } else {
      reject('Service Worker не активен');
    }
  });
}

// Экспортируем функции
export default {
  isAndroidApp,
  getAndroidInfo,
  initAndroidOfflineMode,
  cacheResources: cacheResources
};