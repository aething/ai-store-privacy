/* 
 * Service Worker для Progressive Web App (PWA)
 * Обеспечивает основную функциональность работы в оффлайн-режиме,
 * кэширование статических ресурсов и улучшение производительности
 * 
 * Обновленная версия для Google Play с улучшенной поддержкой оффлайн-режима
 * и более эффективными стратегиями кэширования.
 */

const CACHE_NAME = 'ai-store-v2';
const OFFLINE_CACHE = 'ai-store-offline';
const DYNAMIC_CACHE = 'ai-store-dynamic';

// Версия для контроля обновлений
const APP_VERSION = '2.0.1';

// Время жизни кэша (7 дней в миллисекундах)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// Лимит размера динамического кэша (примерно 50 MB)
const DYNAMIC_CACHE_SIZE_LIMIT = 50 * 1024 * 1024;

// Основные ресурсы для работы приложения (обязательно кэшируются)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/images/image-placeholder.svg',
  '/index.css',
  '/favicon.ico'
];

// Расширенные ресурсы (кэшируются при наличии места)
const STATIC_ASSETS = [
  ...CORE_ASSETS,
  '/offline-test.html',
  '/offline-test.js',
  '/pwa-tester.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Вспомогательные функции

// Проверка размера кэша
async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  let size = 0;
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      size += blob.size;
    }
  }
  
  return size;
}

// Очистка старых объектов из кэша
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Удаляем старые элементы
    for (let i = 0; i < keys.length - maxItems; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[Service Worker] Trimmed ${keys.length - maxItems} items from ${cacheName}`);
  }
}

// Добавление временной метки к кэшированному ответу
function addTimestampToResponse(response) {
  const headers = new Headers(response.headers);
  headers.append('sw-cache-timestamp', Date.now().toString());
  
  return response.clone().blob().then(blob => {
    return new Response(blob, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  });
}

// Проверка актуальности кэша
function isCacheValid(response, maxAge = CACHE_TTL) {
  if (!response || !response.headers) {
    return false;
  }
  
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return true; // Если нет метки, считаем действительным
  
  const cacheTime = parseInt(timestamp, 10);
  const now = Date.now();
  
  return (now - cacheTime) < maxAge;
}

// Установка сервис-воркера
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker v' + APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Кэшируем основные ресурсы
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] Caching core assets');
          return cache.addAll(CORE_ASSETS);
        }),
      
      // Кэшируем оффлайн-ресурсы
      caches.open(OFFLINE_CACHE)
        .then(cache => {
          console.log('[Service Worker] Caching offline resources');
          return cache.addAll([
            '/offline.html',
            '/images/image-placeholder.svg'
          ]);
        }),
      
      // Создаем динамический кэш
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          console.log('[Service Worker] Created dynamic cache');
        })
    ])
    .then(() => {
      console.log('[Service Worker] Pre-caching completed');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('[Service Worker] Pre-caching failed:', error);
      // Даже если произошла ошибка, пропускаем ожидание
      return self.skipWaiting();
    })
  );
});

// Активация сервис-воркера и удаление старых кэшей
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker v' + APP_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        // Список текущих кэшей, которые нужно оставить
        const currentCaches = [CACHE_NAME, OFFLINE_CACHE, DYNAMIC_CACHE];
        
        // Удаляем устаревшие кэши
        return Promise.all(
          keyList.map(key => {
            if (!currentCaches.includes(key)) {
              console.log('[Service Worker] Removing old cache', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
      .then(() => {
        // Дополнительное кэширование статических ресурсов после активации
        return caches.open(CACHE_NAME).then(cache => {
          console.log('[Service Worker] Caching additional assets');
          return cache.addAll(STATIC_ASSETS);
        });
      })
      .catch(error => {
        console.error('[Service Worker] Activation error:', error);
      })
  );
});

// Обработка запросов с улучшенными стратегиями кэширования
self.addEventListener('fetch', event => {
  // Пропускаем запросы к API, WebSocket и другие не-GET запросы
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/socket.io/') ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }
  
  // Проверяем состояние сети
  const isOnline = navigator.onLine;
  
  // Разные стратегии кэширования в зависимости от типа запроса
  
  // 1. Оффлайн-режим: для запросов навигации показываем оффлайн-страницу
  if (event.request.mode === 'navigate' && !isOnline) {
    event.respondWith(
      caches.match('/offline.html')
        .then(response => {
          if (response) {
            console.log('[Service Worker] Serving offline page');
            return response;
          }
          // Если оффлайн-страница не найдена, возвращаем кэшированную главную страницу
          return caches.match('/');
        })
    );
    return;
  }
  
  // 2. HTML-страницы: Network First, затем кэш, затем оффлайн-страница
  if (
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && 
     event.request.headers.get('accept').includes('text/html'))
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Проверяем ответ
          if (!response || response.status !== 200) {
            throw new Error('Invalid response');
          }
          
          // Кэшируем новую версию с временной меткой
          const clonedResponse = response.clone();
          addTimestampToResponse(clonedResponse)
            .then(timestampedResponse => {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, timestampedResponse));
            });
          
          return response;
        })
        .catch(error => {
          console.log('[Service Worker] Network error, falling back to cache', error);
          
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Если страница не найдена в кэше и нет сети
              if (!isOnline) {
                return caches.match('/offline.html');
              }
              
              // В крайнем случае, возвращаем главную страницу
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // 3. Изображения: Cache First, затем сеть, затем заглушка
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Если есть в кэше и он актуален
          if (cachedResponse && isCacheValid(cachedResponse)) {
            return cachedResponse;
          }
          
          // Если нет в кэше или устарел, запрашиваем из сети
          return fetch(event.request)
            .then(networkResponse => {
              // Если получили ответ из сети, кэшируем его
              const clonedResponse = networkResponse.clone();
              addTimestampToResponse(clonedResponse)
                .then(timestampedResponse => {
                  caches.open(DYNAMIC_CACHE)
                    .then(cache => {
                      cache.put(event.request, timestampedResponse);
                      
                      // Проверяем и очищаем кэш при необходимости
                      getCacheSize(DYNAMIC_CACHE).then(size => {
                        if (size > DYNAMIC_CACHE_SIZE_LIMIT) {
                          trimCache(DYNAMIC_CACHE, 100);
                        }
                      });
                    });
                });
              
              return networkResponse;
            })
            .catch(error => {
              console.log('[Service Worker] Failed to fetch image', error);
              
              // Возвращаем заглушку для изображений при ошибке
              return caches.match('/images/image-placeholder.svg');
            });
        })
    );
    return;
  }
  
  // 4. CSS, JS и другие статические ресурсы: Stale-While-Revalidate стратегия
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Создаем промис для получения данных из сети
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Обновляем кэш актуальными данными
            const clonedResponse = networkResponse.clone();
            addTimestampToResponse(clonedResponse)
              .then(timestampedResponse => {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, timestampedResponse));
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.error('[Service Worker] Failed to fetch resource', error);
            return null;
          });
        
        // Возвращаем кэшированный ответ, если он есть, и параллельно обновляем кэш
        return cachedResponse || fetchPromise;
      })
      .catch(error => {
        console.error('[Service Worker] Error in fetch handler', error);
        // Для текстовых ресурсов можно вернуть простой ответ с ошибкой
        return new Response('Ресурс недоступен в офлайн-режиме', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Слушаем сообщения от клиентского кода
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});