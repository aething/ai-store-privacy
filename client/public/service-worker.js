/**
 * Service Worker для AI Store
 * Обеспечивает оффлайн-функциональность и кэширование
 */

// Версия приложения (должна соответствовать APP_VERSION в registerServiceWorker.ts)
const APP_VERSION = '3.0.1';

// Префикс для кэшей
const CACHE_PREFIX = 'ai-store';

// Имена кэшей с учетом версии
const CACHE_NAMES = {
  static: `${CACHE_PREFIX}-v3`,
  offline: `${CACHE_PREFIX}-offline-v3`,
  dynamic: `${CACHE_PREFIX}-dynamic-v3`
};

// Путь к оффлайн-странице
const OFFLINE_PAGE = '/offline-enhanced.html';

// Путь к заглушке для изображений
const IMAGE_FALLBACK = '/images/image-placeholder.svg';

// Ключевые ресурсы, которые должны быть кэшированы при установке
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',           // Старая оффлайн-страница тоже кэшируем
  '/offline-enhanced.html',  // Новая улучшенная оффлайн-страница
  '/offline-test.html',      // Тестовая страница оффлайн-режима
  IMAGE_FALLBACK,
  '/manifest.json',
  '/index.css',
  '/offline-test.js'         // JavaScript для тестовой страницы
];

// Регулярное выражение для определения API-запросов
const API_URL_PATTERN = /\/api\//;

// Регулярное выражение для определения изображений
const IMAGE_URL_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

// Обработчик события skip-waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Получена команда принудительной активации');
    self.skipWaiting();
  }
});

// Обработчик события установки Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Установка началась');
  self.skipWaiting(); // Принудительно активируем SW даже если есть активная старая версия
  
  event.waitUntil(
    Promise.all([
      // Кэшируем основные ресурсы
      caches.open(CACHE_NAMES.static).then(cache => {
        // Логируем процесс кэширования
        console.log('Service Worker: Кэширование основных ресурсов...');
        return cache.addAll(CORE_ASSETS).catch(error => {
          console.error('Service Worker: Ошибка при кэшировании основных ресурсов:', error);
          // Продолжаем установку даже при ошибке кэширования
          return Promise.resolve();
        });
      }),
      
      // Кэшируем оффлайн-страницу отдельно
      caches.open(CACHE_NAMES.offline).then(cache => {
        console.log('Service Worker: Кэширование оффлайн-страницы...');
        return cache.add(OFFLINE_PAGE).catch(error => {
          console.error('Service Worker: Ошибка при кэшировании оффлайн-страницы:', error);
          return Promise.resolve();
        });
      }),
      
      // Кэшируем заглушку для изображений
      caches.open(CACHE_NAMES.offline).then(cache => {
        console.log('Service Worker: Кэширование заглушки для изображений...');
        return cache.add(IMAGE_FALLBACK).catch(error => {
          console.error('Service Worker: Ошибка при кэшировании заглушки для изображений:', error);
          return Promise.resolve();
        });
      })
    ]).then(() => {
      console.log('Service Worker: Установка завершена успешно');
    }).catch(error => {
      console.error('Service Worker: Ошибка при установке:', error);
    })
  );
});

// Обработчик события активации Service Worker
self.addEventListener('activate', event => {
  // Очищаем старые кэши
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => 
            cacheName.startsWith(CACHE_PREFIX) && 
            !Object.values(CACHE_NAMES).includes(cacheName)
          )
          .map(cacheName => {
            console.log(`Удаление устаревшего кэша: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('Service Worker активирован');
      // Отправляем сообщение о версии в клиент
      sendMessageToAllClients({
        type: 'VERSION_INFO',
        payload: { version: APP_VERSION }
      });
    }).catch(error => {
      console.error('Ошибка при активации Service Worker:', error);
    })
  );
});

// Обработчик запросов
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Если запрос идет к API, используем стратегию "только сеть" или возвращаем ошибку
  if (API_URL_PATTERN.test(url.pathname)) {
    return event.respondWith(
      fetch(request).catch(error => {
        console.log('Ошибка API-запроса в оффлайн-режиме:', error);
        return new Response(
          JSON.stringify({ error: 'Нет соединения с сервером' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
  }
  
  // Если запрос на изображение, используем стратегию "кэш, потом сеть, с заглушкой"
  if (request.method === 'GET' && IMAGE_URL_PATTERN.test(url.pathname)) {
    return event.respondWith(
      caches.match(request).then(cachedResponse => {
        // Возвращаем кэшированное изображение, если оно есть
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Пытаемся получить изображение из сети и кэшируем его
        return fetch(request)
          .then(networkResponse => {
            // Проверяем, что запрос успешен
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Кэшируем копию ответа
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAMES.static).then(cache => {
              cache.put(request, responseToCache);
            });
            
            return networkResponse;
          })
          .catch(() => {
            // Если не удалось получить изображение, возвращаем заглушку
            console.log('Возвращаем заглушку изображения для:', url.pathname);
            return caches.match(IMAGE_FALLBACK);
          });
      })
    );
  }
  
  // Для HTML-запросов используем стратегию "кэш первый, затем сеть с фолбэком на оффлайн-страницу"
  if (request.method === 'GET' && 
      (request.headers.get('accept')?.includes('text/html') || 
       url.pathname === '/' || 
       url.pathname.endsWith('.html'))) {
    return event.respondWith(
      // Сначала пытаемся получить из кэша для быстрого отображения
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Параллельно обновляем кэш из сети (если есть соединение)
            fetch(request)
              .then(networkResponse => {
                // Клонируем ответ для кэширования
                const responseToCache = networkResponse.clone();
                
                // Асинхронно обновляем кэш
                caches.open(CACHE_NAMES.static).then(cache => {
                  cache.put(request, responseToCache);
                  console.log('Service Worker: Обновлен кэш для', url.pathname);
                });
              })
              .catch(error => {
                console.log('Service Worker: Не удалось обновить кэш для', url.pathname, error);
              });
            
            // Сразу возвращаем кэшированный ответ
            return cachedResponse;
          }
          
          // Если в кэше нет, пытаемся получить из сети
          return fetch(request)
            .then(networkResponse => {
              // Клонируем ответ для кэширования
              const responseToCache = networkResponse.clone();
              
              // Асинхронно кэшируем ответ
              caches.open(CACHE_NAMES.static).then(cache => {
                cache.put(request, responseToCache);
              });
              
              return networkResponse;
            })
            .catch(error => {
              console.log('Service Worker: Не удалось получить HTML из сети, используем оффлайн-страницу', error);
              // Если не удалось получить из сети, возвращаем оффлайн-страницу
              return caches.match(OFFLINE_PAGE);
            });
        })
    );
  }
  
  // Для JS и CSS используем стратегию "кэш, потом сеть" с обязательным кэшированием
  if (request.method === 'GET' && 
      (url.pathname.endsWith('.js') || 
       url.pathname.endsWith('.css') || 
       url.pathname.endsWith('.json'))) {
    return event.respondWith(
      caches.match(request).then(cachedResponse => {
        // Возвращаем из кэша, если есть
        if (cachedResponse) {
          // Параллельно обновляем кэш из сети (если есть соединение)
          fetch(request)
            .then(networkResponse => {
              if (networkResponse.status === 200) {
                // Клонируем ответ для кэширования
                const responseToCache = networkResponse.clone();
                
                // Асинхронно обновляем кэш
                caches.open(CACHE_NAMES.static).then(cache => {
                  cache.put(request, responseToCache);
                  console.log('Service Worker: Обновлен кэш для статического ресурса', url.pathname);
                });
              }
            })
            .catch(error => {
              console.log('Service Worker: Не удалось обновить кэш для статического ресурса', url.pathname, error);
            });
          
          // Сразу возвращаем кэшированный ответ
          return cachedResponse;
        }
        
        // Если в кэше нет, пытаемся получить из сети
        return fetch(request)
          .then(networkResponse => {
            // Проверяем, что ответ валидный
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Клонируем ответ, чтобы сохранить его в кэше
            const responseToCache = networkResponse.clone();
            
            // Асинхронно сохраняем в кэше
            caches.open(CACHE_NAMES.static).then(cache => {
              cache.put(request, responseToCache);
            });
            
            return networkResponse;
          })
          .catch(error => {
            console.error('Service Worker: Ошибка при получении статического ресурса', url.pathname, error);
            // Для JS/CSS файлов мы не можем просто вернуть заглушку, так что возвращаем ошибку
            return new Response('// Ресурс недоступен в оффлайн-режиме', { 
              status: 503,
              headers: { 'Content-Type': 'application/javascript' }
            });
          });
      })
    );
  }
  
  // Для остальных запросов используем стратегию "кэш, потом сеть"
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Возвращаем из кэша, если есть
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // В противном случае делаем сетевой запрос
      return fetch(request)
        .then(networkResponse => {
          // Проверяем, что ответ валидный
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Клонируем ответ, чтобы сохранить его в кэше
          const responseToCache = networkResponse.clone();
          
          // Асинхронно сохраняем в кэше
          caches.open(CACHE_NAMES.dynamic).then(cache => {
            cache.put(request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch(error => {
          console.error('Service Worker: Ошибка при получении ресурса', url.pathname, error);
          // Возвращаем ошибку для прочих ресурсов
          return new Response('Ресурс недоступен в оффлайн-режиме', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// Обработчик сообщений от клиента
self.addEventListener('message', event => {
  const message = event.data;
  
  console.log('Service Worker получил сообщение:', message);
  
  if (!message || !message.type) {
    return;
  }
  
  switch (message.type) {
    case 'GET_VERSION':
      // Отправляем информацию о версии
      event.ports[0]?.postMessage({
        messageId: message.messageId,
        type: 'VERSION_INFO',
        payload: { version: APP_VERSION }
      }) || event.source?.postMessage({
        messageId: message.messageId,
        type: 'VERSION_INFO',
        payload: { version: APP_VERSION }
      });
      break;
      
    case 'UPDATE_CACHE':
      // Обновляем кэш основных ресурсов
      updateCache().then(result => {
        event.ports[0]?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_UPDATED',
          payload: result
        }) || event.source?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_UPDATED',
          payload: result
        });
      }).catch(error => {
        event.ports[0]?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_ERROR',
          payload: { error: error.message }
        }) || event.source?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_ERROR',
          payload: { error: error.message }
        });
      });
      break;
      
    case 'GET_CACHE_INFO':
      // Получаем информацию о кэше
      getCacheInfo().then(cacheInfo => {
        event.ports[0]?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_INFO',
          payload: cacheInfo
        }) || event.source?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_INFO',
          payload: cacheInfo
        });
      }).catch(error => {
        event.ports[0]?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_ERROR',
          payload: { error: error.message }
        }) || event.source?.postMessage({
          messageId: message.messageId,
          type: 'CACHE_ERROR',
          payload: { error: error.message }
        });
      });
      break;
      
    case 'CACHE_URLS':
      // Кэшируем указанные URL-адреса
      if (message.payload && Array.isArray(message.payload.urls)) {
        cacheUrls(message.payload.urls).then(result => {
          event.ports[0]?.postMessage({
            messageId: message.messageId,
            type: 'CACHE_UPDATED',
            payload: result
          }) || event.source?.postMessage({
            messageId: message.messageId,
            type: 'CACHE_UPDATED',
            payload: result
          });
        }).catch(error => {
          event.ports[0]?.postMessage({
            messageId: message.messageId,
            type: 'CACHE_ERROR',
            payload: { error: error.message }
          }) || event.source?.postMessage({
            messageId: message.messageId,
            type: 'CACHE_ERROR',
            payload: { error: error.message }
          });
        });
      }
      break;
      
    case 'CHECK_RESOURCE':
      // Проверяем наличие ресурса в кэше
      if (message.payload && message.payload.url) {
        checkResourceInCache(message.payload.url).then(cached => {
          event.ports[0]?.postMessage({
            messageId: message.messageId,
            type: 'RESOURCE_STATUS',
            payload: { url: message.payload.url, cached }
          }) || event.source?.postMessage({
            messageId: message.messageId,
            type: 'RESOURCE_STATUS',
            payload: { url: message.payload.url, cached }
          });
        }).catch(error => {
          event.ports[0]?.postMessage({
            messageId: message.messageId,
            type: 'CACHE_ERROR',
            payload: { error: error.message }
          }) || event.source?.postMessage({
            messageId: message.messageId,
            type: 'CACHE_ERROR',
            payload: { error: error.message }
          });
        });
      }
      break;
  }
});

// Обработчик события push для уведомлений
self.addEventListener('push', event => {
  console.log('Получено push-уведомление', event);
  
  // Убедимся, что у нас есть данные
  if (!event.data) {
    console.warn('Получено push-уведомление без данных');
    return;
  }
  
  try {
    // Разбираем данные уведомления
    const data = event.data.json();
    
    // Создаем уведомление
    const options = {
      body: data.body || 'Новое уведомление',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'AI Store', options)
    );
  } catch (error) {
    console.error('Ошибка при обработке push-уведомления:', error);
  }
});

// Обработчик нажатия на уведомление
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Получаем URL для открытия из данных уведомления
  const url = event.notification.data.url || '/';
  
  // Открываем указанный URL или фокусируемся на открытом окне
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Проверяем, есть ли уже открытое окно
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Если нет, открываем новое окно
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Обработчик изменения состояния синхронизации сети
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      syncData().catch(error => {
        console.error('Ошибка синхронизации данных:', error);
      })
    );
  }
});

// Обработчик периодической синхронизации (для современных браузеров)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'refresh-content') {
    event.waitUntil(
      updateCache().catch(error => {
        console.error('Ошибка обновления кэша:', error);
      })
    );
  }
});

// Вспомогательные функции

/**
 * Отправляет сообщение всем активным клиентам
 */
async function sendMessageToAllClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach(client => {
    client.postMessage(message);
  });
}

/**
 * Обновляет кэш всех основных ресурсов
 */
async function updateCache() {
  const cache = await caches.open(CACHE_NAMES.static);
  
  let successCount = 0;
  let failedCount = 0;
  
  // Обновляем каждый ресурс
  for (const url of CORE_ASSETS) {
    try {
      await cache.add(url);
      successCount++;
    } catch (error) {
      console.error(`Ошибка при обновлении кэша для ${url}:`, error);
      failedCount++;
    }
  }
  
  return { 
    success: successCount, 
    failed: failedCount,
    timestamp: new Date().toISOString()
  };
}

/**
 * Получает информацию о кэше
 */
async function getCacheInfo() {
  const cacheInfo = {};
  
  // Получаем информацию о каждом кэше
  for (const cacheName of Object.values(CACHE_NAMES)) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      cacheInfo[cacheName] = keys.length;
    } catch (error) {
      console.error(`Ошибка при получении информации о кэше ${cacheName}:`, error);
      cacheInfo[cacheName] = -1;
    }
  }
  
  return {
    caches: cacheInfo,
    total: Object.values(cacheInfo).reduce((acc, val) => acc + (val > 0 ? val : 0), 0),
    timestamp: new Date().toISOString()
  };
}

/**
 * Кэширует указанные URL-адреса
 */
async function cacheUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return { success: 0, failed: 0 };
  }
  
  const cache = await caches.open(CACHE_NAMES.static);
  
  let successCount = 0;
  let failedCount = 0;
  
  // Кэшируем каждый URL
  for (const url of urls) {
    try {
      await cache.add(new Request(url));
      successCount++;
    } catch (error) {
      console.error(`Ошибка при кэшировании ${url}:`, error);
      failedCount++;
    }
  }
  
  return { success: successCount, failed: failedCount };
}

/**
 * Проверяет наличие ресурса в кэше
 */
async function checkResourceInCache(url) {
  // Проверяем в каждом кэше
  for (const cacheName of Object.values(CACHE_NAMES)) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(new Request(url));
    
    if (response) {
      return true;
    }
  }
  
  return false;
}

/**
 * Синхронизирует данные приложения при восстановлении соединения
 */
async function syncData() {
  // Имитация синхронизации данных
  console.log('Синхронизация данных...');
  
  // Отправка сообщения клиентам о синхронизации
  sendMessageToAllClients({
    type: 'SYNC_COMPLETED',
    payload: { timestamp: new Date().toISOString() }
  });
  
  return true;
}