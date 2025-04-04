/**
 * Модуль для регистрации и управления Service Worker
 */

// Версия приложения для отслеживания обновлений
export const APP_VERSION = '3.0.1';

// Конфигурация регистрации Service Worker
interface ServiceWorkerConfig {
  // Путь к скрипту Service Worker
  scriptPath: string;
  // Необходимо ли перезагружать страницу при обновлении Service Worker
  reloadOnUpdate: boolean;
  // Путь к оффлайн-странице
  offlinePath: string;
  // Путь к заглушке для изображений
  imageFallbackPath: string;
  // Включить расширенное логирование
  debug: boolean;
}

// Настройки по умолчанию
const defaultConfig: ServiceWorkerConfig = {
  scriptPath: '/sw.js',
  reloadOnUpdate: true,
  offlinePath: '/offline.html', // Используем стандартную оффлайн-страницу
  imageFallbackPath: '/images/image-placeholder.svg',
  debug: import.meta.env.DEV
};

/**
 * Регистрирует Service Worker
 */
export async function registerServiceWorker(config: Partial<ServiceWorkerConfig> = {}): Promise<boolean> {
  const mergedConfig = { ...defaultConfig, ...config };

  // Проверяем поддержку Service Worker в браузере
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker не поддерживается в этом браузере');
    return false;
  }

  // Сохраняем версию приложения для отслеживания обновлений
  localStorage.setItem('app-version', APP_VERSION);

  try {
    // Сначала попробуем получить существующие регистрации и удалить их
    // для обеспечения "чистой" регистрации, решая проблемы с активацией
    if (mergedConfig.debug) {
      console.log('Проверка существующих регистраций Service Worker...');
    }
    
    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    if (existingRegistrations.length > 0) {
      if (mergedConfig.debug) {
        console.log(`Найдено ${existingRegistrations.length} существующих регистраций Service Worker`);
      }
      
      // Отменяем все существующие регистрации
      for (const reg of existingRegistrations) {
        try {
          await reg.unregister();
          if (mergedConfig.debug) {
            console.log('Отменена существующая регистрация Service Worker:', reg.scope);
          }
        } catch (unregError) {
          console.error('Ошибка при отмене регистрации Service Worker:', unregError);
        }
      }
    }
    
    // Регистрируем Service Worker заново
    const registration = await navigator.serviceWorker.register(mergedConfig.scriptPath, { 
      scope: '/', 
      updateViaCache: 'none'
    });
    
    if (mergedConfig.debug) {
      console.log('Service Worker успешно зарегистрирован с областью видимости:', registration.scope);
    }
    
    // Принудительно активируем Service Worker для текущей клиентской сессии
    if (registration.waiting) {
      if (mergedConfig.debug) {
        console.log('Принудительная активация ожидающего Service Worker');
      }
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Обработка обновлений
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // На этом этапе старый контент был очищен, новый контент загружен
            if (mergedConfig.debug) {
              console.log('Новая версия Service Worker доступна');
            }
            
            // Сохраняем версию Service Worker
            localStorage.setItem('sw-version', APP_VERSION);

            // Обработка обновления без принудительной перезагрузки
            // Это решает проблему с перезагрузкой и "дерганием" страницы
            if (mergedConfig.reloadOnUpdate) {
              // Проверяем, достаточно ли времени прошло с последней перезагрузки
              const lastReload = parseInt(localStorage.getItem('sw_last_reload') || '0');
              const now = Date.now();
              const timeSinceLastReload = now - lastReload;
              const MIN_RELOAD_INTERVAL = 30000; // 30 секунд минимум между перезагрузками
              
              if (timeSinceLastReload < MIN_RELOAD_INTERVAL) {
                console.log('Слишком скоро после последней перезагрузки, не перезагружаем');
                return;
              }
              
              // Проверяем время с момента загрузки страницы, чтобы не беспокоить
              // пользователя сразу после открытия страницы
              const pageLoadTime = window._pageLoadTime || now;
              const timeOnPage = now - pageLoadTime;
              const MIN_PAGE_VIEW_TIME = 60000; // 1 минута минимум, чтобы предлагать обновление
              
              if (timeOnPage < MIN_PAGE_VIEW_TIME) {
                console.log('Пользователь недостаточно долго на странице, не предлагаем перезагрузку');
                return;
              }
              
              // Только теперь предлагаем обновление
              if (confirm('Доступно обновление приложения. Обновить сейчас?')) {
                localStorage.setItem('sw_last_reload', now.toString());
                window.location.reload();
              }
            }
          } else {
            // На этом этапе все было предварительно кэшировано
            if (mergedConfig.debug) {
              console.log('Контент кэширован для оффлайн использования');
            }
            
            // Сохраняем версию Service Worker
            localStorage.setItem('sw-version', APP_VERSION);
          }
        }
      };
    };

    // Настраиваем обработку сообщений от Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const message = event.data;
      
      if (mergedConfig.debug) {
        console.log('Получено сообщение от Service Worker:', message);
      }
      
      // Обрабатываем различные типы сообщений
      switch (message.type) {
        case 'CACHE_UPDATED':
          if (mergedConfig.debug) {
            console.log('Кэш обновлен:', message.payload);
          }
          break;
          
        case 'CACHE_ERROR':
          console.error('Ошибка кэширования:', message.payload);
          break;
          
        case 'OFFLINE_MODE':
          // Обрабатываем переход в оффлайн режим
          if (message.payload?.isOffline) {
            if (mergedConfig.debug) {
              console.log('Приложение перешло в оффлайн режим');
            }
            
            // Здесь можно вызвать дополнительные функции для оффлайн режима
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('app-offline'));
            }
          }
          break;
          
        case 'VERSION_INFO':
          // Получаем информацию о версии Service Worker
          if (message.payload?.version) {
            localStorage.setItem('sw-version', message.payload.version);
            
            if (mergedConfig.debug) {
              console.log('Версия Service Worker:', message.payload.version);
            }
          }
          break;
      }
    });

    // Запрашиваем у Service Worker информацию о версии
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_VERSION'
      });
    }
    
    // Настраиваем глобальный API для расширенной работы с Service Worker
    setupGlobalServiceWorkerAPI(mergedConfig);

    return true;
  } catch (error) {
    console.error('Ошибка при регистрации Service Worker:', error);
    return false;
  }
}

/**
 * Отменяет регистрацию Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    console.log('Service Worker успешно отменен');
    return true;
  } catch (error) {
    console.error('Ошибка при отмене регистрации Service Worker:', error);
    return false;
  }
}

/**
 * Проверяет, активен ли Service Worker
 */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.length > 0 && !!navigator.serviceWorker.controller;
  } catch (error) {
    console.error('Ошибка при проверке статуса Service Worker:', error);
    return false;
  }
}

/**
 * Отправляет сообщение в Service Worker
 */
export function sendMessageToServiceWorker(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
      reject(new Error('Service Worker не активен'));
      return;
    }

    // Создаем уникальный идентификатор для сообщения
    const messageId = Date.now().toString();
    const messageWithId = { ...message, messageId };

    // Обработчик для получения ответа
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.messageId === messageId) {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        resolve(event.data);
      }
    };

    // Подписываемся на сообщения
    navigator.serviceWorker.addEventListener('message', messageHandler);

    // Отправляем сообщение
    navigator.serviceWorker.controller.postMessage(messageWithId);

    // Таймаут для ответа
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      reject(new Error('Таймаут ожидания ответа от Service Worker'));
    }, 3000);
  });
}

/**
 * Настраивает глобальный API для работы с Service Worker
 */
function setupGlobalServiceWorkerAPI(config: ServiceWorkerConfig) {
  // Создаем глобальный объект для отладки
  const appDebug = {
    /**
     * Проверяет поддержку оффлайн-режима
     */
    checkOfflineSupport: async () => {
      const result = {
        serviceWorkerSupported: 'serviceWorker' in navigator,
        cacheApiSupported: 'caches' in window,
        serviceWorkerActive: false,
        serviceWorkerVersion: null as string | null,
        canWork: false
      };
      
      if (result.serviceWorkerSupported) {
        result.serviceWorkerActive = await isServiceWorkerActive();
        result.serviceWorkerVersion = localStorage.getItem('sw-version');
      }
      
      result.canWork = result.serviceWorkerSupported && 
                      result.cacheApiSupported && 
                      result.serviceWorkerActive;
      
      return result;
    },
    
    /**
     * Очищает кэш Service Worker
     */
    clearServiceWorkerCache: async () => {
      if (!('caches' in window)) {
        throw new Error('Cache API не поддерживается');
      }
      
      const cacheNames = [
        'ai-store-v3',
        'ai-store-offline-v3',
        'ai-store-dynamic-v3'
      ];
      
      const promises = cacheNames.map(cacheName => caches.delete(cacheName));
      await Promise.all(promises);
      
      return { success: true };
    },
    
    /**
     * Обновляет кэш Service Worker
     */
    refreshServiceWorkerCache: async () => {
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
        throw new Error('Service Worker не активен');
      }
      
      // Отправляем сообщение в Service Worker для обновления кэша
      await sendMessageToServiceWorker({
        type: 'UPDATE_CACHE'
      });
      
      return { success: true };
    },
    
    /**
     * Проверяет статус сети
     */
    isOffline: () => {
      return !navigator.onLine;
    },
    
    /**
     * Полностью сбрасывает кэш приложения
     */
    resetAppCache: async () => {
      // Очищаем Service Worker кэш
      await appDebug.clearServiceWorkerCache();
      
      // Очищаем localStorage
      localStorage.clear();
      
      // Очищаем IndexedDB, если доступно
      if ('indexedDB' in window) {
        const databases = await window.indexedDB.databases();
        databases.forEach(db => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      }
      
      return { success: true };
    },
    
    /**
     * API для прямого взаимодействия с Service Worker
     */
    swAPI: {
      /**
       * Получает текущую версию Service Worker
       */
      getVersion: async () => {
        try {
          const response = await sendMessageToServiceWorker({
            type: 'GET_VERSION'
          });
          return response.payload?.version || null;
        } catch (error) {
          console.error('Ошибка при получении версии Service Worker:', error);
          return null;
        }
      },
      
      /**
       * Получает информацию о кэше
       */
      getCacheInfo: async () => {
        try {
          const response = await sendMessageToServiceWorker({
            type: 'GET_CACHE_INFO'
          });
          return response.payload || { count: 0, size: 0 };
        } catch (error) {
          console.error('Ошибка при получении информации о кэше:', error);
          return { count: 0, size: 0 };
        }
      },
      
      /**
       * Кэширует указанные URL-адреса
       */
      cacheUrls: async (urls: string[]) => {
        try {
          const response = await sendMessageToServiceWorker({
            type: 'CACHE_URLS',
            payload: { urls }
          });
          return response.payload || { success: 0, failed: 0 };
        } catch (error) {
          console.error('Ошибка при кэшировании URL-адресов:', error);
          return { success: 0, failed: 0 };
        }
      },
      
      /**
       * Проверяет наличие ресурса в кэше
       */
      checkResource: async (url: string) => {
        try {
          const response = await sendMessageToServiceWorker({
            type: 'CHECK_RESOURCE',
            payload: { url }
          });
          return response.payload?.cached || false;
        } catch (error) {
          console.error(`Ошибка при проверке ресурса ${url}:`, error);
          return false;
        }
      }
    }
  };
  
  // Расширяем глобальный объект window
  (window as any).appDebug = appDebug;
  
  // Расширяем глобальный объект window для отслеживания состояния сети
  (window as any).networkStatus = {
    isOnline: navigator.onLine,
    
    /**
     * Подписка на изменения состояния сети
     */
    subscribe: (callback: (isOnline: boolean) => void) => {
      const handleOnline = () => {
        (window as any).networkStatus.isOnline = true;
        callback(true);
      };
      
      const handleOffline = () => {
        (window as any).networkStatus.isOnline = false;
        callback(false);
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Возвращаем функцию для отписки
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  };
}

// Экспортируем настройки
export const serviceWorkerConfig = defaultConfig;