/**
 * Утилиты для управления кэшем приложения
 */

/**
 * Очищает кэш, связанный с налоговой информацией
 * @param keys массив ключей для очистки или функция очистки всех налоговых ключей
 */
export function clearTaxCache(keys?: string[] | (() => void)): void {
  // Если передана функция, вызываем её
  if (typeof keys === 'function') {
    keys();
    return;
  }
  
  // Если переданы конкретные ключи, удаляем только их
  if (Array.isArray(keys) && keys.length > 0) {
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Ошибка при удалении ключа ${key}:`, e);
      }
    });
    return;
  }
  
  // Иначе удаляем стандартные налоговые ключи
  try {
    localStorage.removeItem('tax_info');
    localStorage.removeItem('price_cache');
    localStorage.removeItem('checkout_data');
    localStorage.removeItem('currency_data');
    localStorage.removeItem('product_prices');
  } catch (e) {
    console.error('Ошибка при очистке налогового кэша:', e);
  }
}

/**
 * Очищает данные сессии
 */
export function clearSessionCache(): void {
  try {
    // Очищаем sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
    }
    
    // Удаляем кэшированные данные из localStorage, связанные с сессией
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('session_data');
      localStorage.removeItem('session_country');
      localStorage.removeItem('session_currency');
      localStorage.removeItem('active_session');
      localStorage.removeItem('session_tax_rate');
    }
    
    console.log('Кэш сессии очищен');
  } catch (e) {
    console.error('Ошибка при очистке кэша сессии:', e);
  }
}

/**
 * Очищает данные сессии пользователя
 * @param preserveCountry если true, сохраняет страну пользователя
 */
export function clearUserCache(preserveCountry = false): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  
  // Сохраняем значение страны, если требуется
  let country = null;
  if (preserveCountry) {
    country = localStorage.getItem('user_country');
  }
  
  // Очищаем локальное хранилище
  localStorage.clear();
  
  // Восстанавливаем страну, если требуется
  if (preserveCountry && country) {
    localStorage.setItem('user_country', country);
  }
  
  console.log('Кэш пользователя очищен' + (preserveCountry ? ' (страна сохранена)' : ''));
}

/**
 * Перезагружает страницу
 */
export function reloadPage(): void {
  window.location.reload();
}

/**
 * Очищает все данные сессии и перезагружает страницу
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Очищаем локальное хранилище
  localStorage.clear();
  
  // Очищаем сессионное хранилище
  sessionStorage.clear();
  
  console.log('Весь кэш приложения очищен');
  
  // Перезагружаем страницу
  window.location.reload();
}

/**
 * Очищает кэш и перезагружает страницу
 */
export function clearCacheAndReload(preserveCountry = false): void {
  clearUserCache(preserveCountry);
  reloadPage();
}

/**
 * Проверяет доступность оффлайн-режима
 */
export async function checkOfflineSupport(): Promise<boolean> {
  const result = {
    serviceWorkerSupported: 'serviceWorker' in navigator,
    cacheApiSupported: 'caches' in window,
    serviceWorkerActive: false
  };
  
  if (result.serviceWorkerSupported) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    result.serviceWorkerActive = registrations.length > 0 && !!navigator.serviceWorker.controller;
  }
  
  return result.serviceWorkerSupported && result.cacheApiSupported && result.serviceWorkerActive;
}

/**
 * Проверяет, находится ли приложение в оффлайн-режиме
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Очищает все кэши, используемые Service Worker
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  if (!('caches' in window)) {
    console.error('Cache API не поддерживается в этом браузере');
    return false;
  }

  try {
    const cacheNames = [
      'ai-store-v3',
      'ai-store-offline-v3',
      'ai-store-dynamic-v3'
    ];
    
    const promises = cacheNames.map(cacheName => caches.delete(cacheName));
    await Promise.all(promises);
    
    console.log('Кэш успешно очищен');
    return true;
  } catch (error) {
    console.error('Ошибка при очистке кэша:', error);
    return false;
  }
}

/**
 * Очищает только кэш динамических ресурсов (API-запросы и т.д.)
 */
export async function clearDynamicCache(): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    await caches.delete('ai-store-dynamic-v3');
    return true;
  } catch (error) {
    console.error('Ошибка при очистке динамического кэша:', error);
    return false;
  }
}

/**
 * Проверяет наличие ресурса в кэше
 */
export async function isResourceCached(url: string): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = [
      'ai-store-v3',
      'ai-store-offline-v3',
      'ai-store-dynamic-v3'
    ];
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      
      if (response) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Ошибка при проверке кэша для ${url}:`, error);
    return false;
  }
}

/**
 * Обновляет Service Worker и перезагружает приложение
 */
export async function updateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      console.warn('Service Worker не зарегистрирован');
      return;
    }
    
    // Обновляем все зарегистрированные Service Worker'ы
    await Promise.all(registrations.map(registration => registration.update()));
    
    // Отправляем сообщение в Service Worker для обновления кэша
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_CACHE'
      });
    }
    
    console.log('Service Worker успешно обновлен');
    
    // Перезагружаем страницу через 1 секунду
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('Ошибка при обновлении Service Worker:', error);
  }
}

/**
 * Добавляет указанный URL в кэш
 */
export async function cacheUrl(url: string): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cache = await caches.open('ai-store-v3');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Не удалось получить ресурс: ${response.status} ${response.statusText}`);
    }
    
    await cache.put(url, response);
    return true;
  } catch (error) {
    console.error(`Ошибка при кэшировании ${url}:`, error);
    return false;
  }
}

/**
 * Получает статистику использования кэша
 */
export async function getCacheStats(): Promise<{
  items: number;
  size: number;
}> {
  if (!('caches' in window)) {
    return { items: 0, size: 0 };
  }

  try {
    const cacheNames = [
      'ai-store-v3',
      'ai-store-offline-v3',
      'ai-store-dynamic-v3'
    ];
    
    let totalItems = 0;
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      totalItems += keys.length;
      
      // Для оценки размера проверяем только часть ресурсов (для производительности)
      const sampleSize = Math.min(keys.length, 5);
      let sampleTotalSize = 0;
      
      for (let i = 0; i < sampleSize; i++) {
        const response = await cache.match(keys[i]);
        if (response) {
          const clone = response.clone();
          const blob = await clone.blob();
          sampleTotalSize += blob.size;
        }
      }
      
      // Экстраполируем размер на весь кэш
      if (sampleSize > 0) {
        const avgSize = sampleTotalSize / sampleSize;
        totalSize += avgSize * keys.length;
      }
    }
    
    return {
      items: totalItems,
      size: Math.round(totalSize)
    };
  } catch (error) {
    console.error('Ошибка при получении статистики кэша:', error);
    return { items: 0, size: 0 };
  }
}

/**
 * Получает список URL'ов, хранящихся в кэше
 */
export async function getCachedUrls(): Promise<string[]> {
  if (!('caches' in window)) {
    return [];
  }

  try {
    const cacheNames = [
      'ai-store-v3',
      'ai-store-offline-v3',
      'ai-store-dynamic-v3'
    ];
    
    const allUrls: string[] = [];
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      keys.forEach(request => {
        allUrls.push(request.url);
      });
    }
    
    return allUrls;
  } catch (error) {
    console.error('Ошибка при получении списка URL из кэша:', error);
    return [];
  }
}

/**
 * Полный сброс хранилища приложения (кэш + localStorage)
 */
export async function resetAppStorage(): Promise<boolean> {
  try {
    // Очистка Service Worker кэша
    if ('caches' in window) {
      await clearServiceWorkerCache();
    }
    
    // Очистка localStorage
    localStorage.clear();
    
    // Очистка IndexedDB
    if ('indexedDB' in window) {
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });
    }
    
    console.log('Хранилище приложения успешно сброшено');
    return true;
  } catch (error) {
    console.error('Ошибка при сбросе хранилища приложения:', error);
    return false;
  }
}

/**
 * Предварительно кэширует важные страницы приложения
 */
export async function precacheImportantPages(): Promise<{ success: number; failed: number }> {
  if (!('caches' in window)) {
    return { success: 0, failed: 0 };
  }

  // Список важных URL для кэширования
  const urlsToCache = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/images/image-placeholder.svg'
  ];
  
  let successCount = 0;
  let failedCount = 0;
  
  try {
    const cache = await caches.open('ai-store-v3');
    
    for (const url of urlsToCache) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки ${url}: ${response.status} ${response.statusText}`);
        }
        
        await cache.put(url, response);
        successCount++;
      } catch (error) {
        console.error(`Не удалось кэшировать ${url}:`, error);
        failedCount++;
      }
    }
    
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Ошибка при предварительном кэшировании:', error);
    return { success: successCount, failed: failedCount };
  }
}

// Экспортируем все функции в одном объекте для удобства использования в глобальном контексте
export const cacheUtils = {
  clearTaxCache,
  clearSessionCache,
  clearUserCache,
  reloadPage,
  clearAllCache,
  clearCacheAndReload,
  checkOfflineSupport,
  isOffline,
  clearServiceWorkerCache,
  clearDynamicCache,
  isResourceCached,
  updateServiceWorker,
  cacheUrl,
  getCacheStats,
  getCachedUrls,
  resetAppStorage,
  precacheImportantPages
};