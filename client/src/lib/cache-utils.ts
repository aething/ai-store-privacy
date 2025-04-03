/**
 * Утилиты для кэширования данных для офлайн-режима
 */

// Название для кэша ресурсов и API
export const APP_CACHE_NAME = 'ai-store-cache-v1';
export const API_CACHE_NAME = 'ai-store-api-cache-v1';

// Время жизни кэша данных API в миллисекундах
export const API_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

/**
 * Инициализация кэширования основных ресурсов приложения
 */
export async function initCache() {
  // Проверяем поддержку Service Worker
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker is not supported in this browser');
    return;
  }
  
  try {
    // Регистрируем Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Открываем кэш и предварительно кэшируем основные ресурсы
    const cache = await caches.open(APP_CACHE_NAME);
    const resourcesToCache = [
      '/',
      '/index.html',
      '/manifest.json',
      '/offline.html',
      '/app-icon.png',
    ];
    
    await cache.addAll(resourcesToCache);
    console.log('Initial resources cached successfully');
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Кэширование данных API с временем жизни
 * @param request Запрос или URL строка
 * @param response Ответ для кэширования
 */
export async function cacheApiResponse(request: Request | string, response: Response): Promise<void> {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    
    // Клонируем ответ, так как он может быть использован только один раз
    const responseToCache = response.clone();
    
    // Добавляем метаданные о времени кэширования
    const headers = new Headers(responseToCache.headers);
    headers.append('x-cache-timestamp', Date.now().toString());
    
    // Создаем новый ответ с обновленными заголовками
    const cachedResponse = new Response(await responseToCache.blob(), {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers,
    });
    
    await cache.put(request, cachedResponse);
  } catch (error) {
    console.error('Failed to cache API response:', error);
  }
}

/**
 * Получение кэшированного ответа API с проверкой TTL
 * @param request Запрос или URL строка
 * @returns Кэшированный ответ или null, если кэш недействителен или отсутствует
 */
export async function getCachedApiResponse(request: Request | string): Promise<Response | null> {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (!cachedResponse) {
      return null;
    }
    
    // Проверяем время кэширования
    const timestamp = cachedResponse.headers.get('x-cache-timestamp');
    if (!timestamp) {
      return null;
    }
    
    const cachedTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    // Если кэш устарел, возвращаем null
    if (now - cachedTime > API_CACHE_TTL) {
      return null;
    }
    
    return cachedResponse;
  } catch (error) {
    console.error('Failed to get cached API response:', error);
    return null;
  }
}

/**
 * Очистка всех кэшей приложения
 */
export async function clearAllCaches(): Promise<void> {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName.startsWith('ai-store-')) {
          return caches.delete(cacheName);
        }
        return Promise.resolve();
      })
    );
    console.log('All caches cleared successfully');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

/**
 * Обновление кэша ресурсов при новой версии приложения
 * @param newCacheName Название нового кэша
 */
export async function updateCache(newCacheName: string): Promise<void> {
  try {
    const cacheNames = await caches.keys();
    
    // Удаляем старые кэши ресурсов
    await Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName.startsWith('ai-store-cache-') && cacheName !== newCacheName) {
          return caches.delete(cacheName);
        }
        return Promise.resolve();
      })
    );
    
    // Открываем новый кэш и предварительно кэшируем основные ресурсы
    const cache = await caches.open(newCacheName);
    const resourcesToCache = [
      '/',
      '/index.html',
      '/manifest.json',
      '/offline.html',
      '/app-icon.png',
    ];
    
    await cache.addAll(resourcesToCache);
    console.log('Cache updated successfully to', newCacheName);
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
}

/**
 * Проверка, находится ли приложение в офлайн-режиме
 * @returns true, если приложение офлайн
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Инициализация обработчиков событий онлайн/офлайн
 * @param onOffline Функция, вызываемая при переходе в офлайн
 * @param onOnline Функция, вызываемая при переходе в онлайн
 */
export function initOnlineStatusHandlers(
  onOffline: () => void = () => {},
  onOnline: () => void = () => {}
): () => void {
  const handleOffline = () => {
    console.log('Application is offline');
    onOffline();
  };
  
  const handleOnline = () => {
    console.log('Application is back online');
    onOnline();
  };
  
  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);
  
  // Возвращаем функцию для удаления обработчиков
  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}