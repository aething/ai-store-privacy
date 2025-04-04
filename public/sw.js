/* 
 * Service Worker для Progressive Web App (PWA)
 * Генерированная версия: 3.0.1
 * Создано: 2025-04-04T11:38:55.752Z
 */

// Информация о версии для отладки и контроля обновлений
const VERSION = '3.0.1';

// Названия кэшей для различных типов данных
const CACHE_NAME = 'ai-store-v3';
const OFFLINE_CACHE_NAME = 'ai-store-offline-v3';
const DYNAMIC_CACHE_NAME = 'ai-store-dynamic-v3';

// Статические ресурсы для кэширования при установке
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/images/ai-store-icon.png",
  "/images/ai-store-icon-small.png",
  "/images/app-screenshot.jpg"
];

// Проверка URL на API запросы
const isApiRequest = (url) => /\/api\//.test(url);

// Проверка URL на запросы к Stripe
const isStripeRequest = (url) => /\.(stripe\.com|checkout\.stripe\.com)/.test(url);

// Установка сервис-воркера
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker version:', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation completed');
        return self.skipWaiting();
      })
  );
});

// Активация сервис-воркера и удаление старых кэшей
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker version:', VERSION);
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        // Удаляем только старые кэши, оставляя актуальные
        if (
          key !== CACHE_NAME && 
          key !== OFFLINE_CACHE_NAME && 
          key !== DYNAMIC_CACHE_NAME
        ) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Стратегия кэширования и обработка оффлайн-режима
self.addEventListener('fetch', event => {
  // Пропускаем запросы к Stripe, они всегда должны идти через сеть
  if (isStripeRequest(event.request.url)) {
    return;
  }
  
  // Не перехватываем запросы с методами, кроме GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Обработка запросов API - Network Only с оффлайн-фолбэком
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          if (event.request.url.includes('/api/products')) {
            return caches.match('/api/products')
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                return new Response(
                  JSON.stringify([]), 
                  { 
                    headers: { 'Content-Type': 'application/json' },
                    status: 200
                  }
                );
              });
          }
          
          return new Response(
            JSON.stringify({ 
              error: 'offline',
              message: 'Вы находитесь в автономном режиме'
            }), 
            { 
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
    return;
  }
  
  // Особая обработка для навигации в оффлайн-режиме
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html')
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('[Service Worker] Serving offline page');
                return cachedResponse;
              }
              // Если нет оффлайн-страницы, возвращаем кэшированную главную страницу
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // Для статических ресурсов используем стратегию Cache First
  if (STATIC_ASSETS.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              // Создаем копию ответа для кэширования
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clonedResponse));
              return response;
            });
        })
    );
    return;
  }
  
  // Для остальных ресурсов используем стратегию Stale While Revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Возвращаем кэшированный ответ и обновляем кэш в фоне
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Если ответ валидный, обновляем кэш
            if (networkResponse && networkResponse.status === 200) {
              const clonedResponse = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => cache.put(event.request, clonedResponse));
            }
            return networkResponse;
          })
          .catch(() => {
            // Если запрос на изображение, возвращаем заглушку
            if (event.request.url.match(/.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/icons/image-placeholder.svg');
            }
            return null;
          });
        
        // Возвращаем кэшированный ответ или результат запроса к сети
        return cachedResponse || fetchPromise;
      })
  );
});

// Обработка сообщений от клиентского кода
self.addEventListener('message', event => {
  if (!event.data) {
    return;
  }
  
  const message = event.data;
  
  // Отладочное сообщение
  console.log('[Service Worker] Received message:', message);
  
  // Обработка команды на принудительную активацию
  if (message.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  
  // Для каждого сообщения, которое содержит messageId, отправляем ответ клиенту
  if (message.messageId) {
    const client = event.source;
    
    switch (message.type) {
      case 'GET_VERSION':
        client.postMessage({
          messageId: message.messageId,
          type: 'VERSION_INFO',
          payload: { version: VERSION }
        });
        break;
        
      case 'GET_CACHE_INFO':
        Promise.all([
          caches.open(CACHE_NAME).then(cache => cache.keys()),
          caches.open(OFFLINE_CACHE_NAME).then(cache => cache.keys()),
          caches.open(DYNAMIC_CACHE_NAME).then(cache => cache.keys())
        ])
        .then(([staticKeys, offlineKeys, dynamicKeys]) => {
          client.postMessage({
            messageId: message.messageId,
            type: 'CACHE_INFO',
            payload: {
              static: staticKeys.length,
              offline: offlineKeys.length,
              dynamic: dynamicKeys.length,
              total: staticKeys.length + offlineKeys.length + dynamicKeys.length
            }
          });
        })
        .catch(error => {
          client.postMessage({
            messageId: message.messageId,
            type: 'ERROR',
            payload: { error: error.message }
          });
        });
        break;
        
      case 'CACHE_URLS':
        if (message.payload && Array.isArray(message.payload.urls)) {
          const urls = message.payload.urls;
          
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              return Promise.all(
                urls.map(url => {
                  return fetch(url)
                    .then(response => {
                      if (response.ok) {
                        return cache.put(url, response);
                      }
                      throw new Error(`Failed to fetch ${url}`);
                    })
                    .then(() => ({ url, success: true }))
                    .catch(() => ({ url, success: false }));
                })
              );
            })
            .then(results => {
              const successCount = results.filter(result => result.success).length;
              client.postMessage({
                messageId: message.messageId,
                type: 'CACHE_RESULT',
                payload: {
                  success: successCount,
                  failed: results.length - successCount,
                  results
                }
              });
            })
            .catch(error => {
              client.postMessage({
                messageId: message.messageId,
                type: 'ERROR',
                payload: { error: error.message }
              });
            });
        }
        break;
        
      case 'CHECK_RESOURCE':
        if (message.payload && message.payload.url) {
          const url = message.payload.url;
          
          Promise.all([
            caches.open(CACHE_NAME).then(cache => cache.match(url)),
            caches.open(OFFLINE_CACHE_NAME).then(cache => cache.match(url)),
            caches.open(DYNAMIC_CACHE_NAME).then(cache => cache.match(url))
          ])
          .then(([staticMatch, offlineMatch, dynamicMatch]) => {
            client.postMessage({
              messageId: message.messageId,
              type: 'RESOURCE_CHECK',
              payload: {
                url,
                cached: !!(staticMatch || offlineMatch || dynamicMatch),
                location: staticMatch ? 'static' : (offlineMatch ? 'offline' : (dynamicMatch ? 'dynamic' : null))
              }
            });
          })
          .catch(error => {
            client.postMessage({
              messageId: message.messageId,
              type: 'ERROR',
              payload: { error: error.message }
            });
          });
        }
        break;
        
      case 'UPDATE_CACHE':
        // Обновляем кэш путем удаления и переустановки
        Promise.all([
          caches.delete(CACHE_NAME),
          caches.delete(DYNAMIC_CACHE_NAME)
        ])
        .then(() => {
          return caches.open(CACHE_NAME);
        })
        .then(cache => {
          return cache.addAll(STATIC_ASSETS);
        })
        .then(() => {
          client.postMessage({
            messageId: message.messageId,
            type: 'CACHE_UPDATED',
            payload: { success: true }
          });
        })
        .catch(error => {
          client.postMessage({
            messageId: message.messageId,
            type: 'ERROR',
            payload: { error: error.message }
          });
        });
        break;
    }
  }
});

// Позволяет фиксировать событие, когда устройство выходит в онлайн или уходит в оффлайн
self.addEventListener('online', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'ONLINE_STATUS',
        payload: { online: true }
      });
    });
  });
});

self.addEventListener('offline', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'ONLINE_STATUS',
        payload: { online: false }
      });
    });
  });
});
