// Название для кэша ресурсов и API
const APP_CACHE_NAME = 'ai-store-cache-v1';
const API_CACHE_NAME = 'ai-store-api-cache-v1';

// Версия кэша, обновлять при внесении изменений в приложение
const CACHE_VERSION = 'v1';

// Ресурсы, которые будут предварительно кэшироваться
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/app-icon.png',
  // Добавьте сюда основные ресурсы приложения, которые нужны для работы офлайн
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  // Прекращаем ожидание предыдущего Service Worker
  self.skipWaiting();
  
  // Предварительно кэшируем основные ресурсы
  event.waitUntil(
    caches.open(APP_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .catch(error => {
        console.error('[Service Worker] Pre-caching failed:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  // Получаем клиентов
  event.waitUntil(
    clients.claim()
      .then(() => {
        // Удаляем старые кэши
        return caches.keys()
          .then(cacheNames => {
            return Promise.all(
              cacheNames.map(cacheName => {
                if (
                  (cacheName.startsWith('ai-store-cache-') && cacheName !== APP_CACHE_NAME) ||
                  (cacheName.startsWith('ai-store-api-cache-') && cacheName !== API_CACHE_NAME)
                ) {
                  console.log('[Service Worker] Deleting old cache:', cacheName);
                  return caches.delete(cacheName);
                }
                return Promise.resolve();
              })
            );
          });
      })
  );
});

// Обработка запросов
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Обрабатываем только GET-запросы
  if (request.method !== 'GET') {
    return;
  }
  
  const url = new URL(request.url);
  
  // Обрабатываем API-запросы отдельно
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Обрабатываем обычные запросы к ресурсам
  event.respondWith(handleResourceRequest(request));
});

/**
 * Обработка запросов к API
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Сначала пытаемся получить ответ из сети
    const networkResponse = await fetch(request);
    
    // Если запрос успешен, кэшируем ответ и возвращаем его
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      
      // Кэшируем ответ в фоне
      caches.open(API_CACHE_NAME)
        .then(cache => {
          // Добавляем метаданные о времени кэширования
          const headers = new Headers(clonedResponse.headers);
          headers.append('x-cache-timestamp', Date.now().toString());
          
          // Создаем новый ответ с обновленными заголовками
          return clonedResponse.blob()
            .then(blob => {
              const newResponse = new Response(blob, {
                status: clonedResponse.status,
                statusText: clonedResponse.statusText,
                headers,
              });
              
              return cache.put(request, newResponse);
            });
        })
        .catch(error => {
          console.error('[Service Worker] Failed to cache API response:', error);
        });
      
      return networkResponse;
    }
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', error);
  }
  
  // Если сеть недоступна или запрос не удался, пытаемся получить ответ из кэша
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (error) {
    console.error('[Service Worker] Failed to get cached API response:', error);
  }
  
  // Если и кэш недоступен, возвращаем заглушку
  return createApiErrorResponse(url.pathname);
}

/**
 * Обработка запросов к ресурсам
 */
async function handleResourceRequest(request) {
  const url = new URL(request.url);
  
  // Проверяем, запрашивается ли HTML-страница (навигационный запрос)
  const isNavigationRequest = request.mode === 'navigate';
  
  try {
    // Сначала пытаемся получить ответ из сети
    const networkResponse = await fetch(request);
    
    // Если запрос успешен, кэшируем ответ и возвращаем его
    if (networkResponse.ok) {
      // Кэшируем ответ в фоне для будущих запросов
      caches.open(APP_CACHE_NAME)
        .then(cache => {
          cache.put(request, networkResponse.clone());
        })
        .catch(error => {
          console.error('[Service Worker] Failed to cache resource:', error);
        });
      
      return networkResponse;
    }
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', error);
  }
  
  // Если сеть недоступна или запрос не удался, пытаемся получить ответ из кэша
  try {
    const cache = await caches.open(APP_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (error) {
    console.error('[Service Worker] Failed to get cached response:', error);
  }
  
  // Если это навигационный запрос и ни сеть, ни кэш не доступны, возвращаем страницу офлайн-режима
  if (isNavigationRequest) {
    try {
      const cache = await caches.open(APP_CACHE_NAME);
      const offlineResponse = await cache.match('/offline.html');
      
      if (offlineResponse) {
        return offlineResponse;
      }
    } catch (error) {
      console.error('[Service Worker] Failed to serve offline page:', error);
    }
  }
  
  // В крайнем случае, возвращаем заглушку
  return createErrorResponse();
}

/**
 * Создание ответа-заглушки для API запросов
 */
function createApiErrorResponse(pathname) {
  let data = { error: 'You are offline. Please check your internet connection.' };
  
  // Для некоторых API-запросов можно вернуть специфичные заглушки
  if (pathname === '/api/products') {
    data = { 
      error: 'Offline Mode',
      message: 'You are currently offline. Some product data may not be available.',
      data: [] // Пустой массив продуктов
    };
  }
  
  return new Response(
    JSON.stringify(data),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true'
      }
    }
  );
}

/**
 * Создание ответа-заглушки для обычных ресурсов
 */
function createErrorResponse() {
  return new Response(
    '<html><body><h1>Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html'
      }
    }
  );
}

// Обработка сообщений от клиентов
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});