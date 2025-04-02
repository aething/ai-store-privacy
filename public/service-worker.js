/* 
 * Service Worker для Progressive Web App (PWA)
 * Обеспечивает основную функциональность работы в оффлайн-режиме,
 * кэширование статических ресурсов и улучшение производительности
 */

const CACHE_NAME = 'ai-store-v1';

// Ресурсы, которые будут кэшироваться при установке 
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/images/ai-store-icon.png',
  '/images/ai-store-icon-small.png',
  '/images/app-screenshot.jpg'
];

// Установка сервис-воркера
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
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
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
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
  // Не перехватываем запросы к API и сторонним ресурсам
  if (event.request.url.includes('/api/') || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Особая обработка для навигации в оффлайн-режиме
  if (event.request.mode === 'navigate' && !navigator.onLine) {
    event.respondWith(
      caches.match('/offline.html')
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving offline page');
            return cachedResponse;
          }
          // Если нет оффлайн-страницы, возвращаем кэшированную главную страницу
          return caches.match('/');
        })
    );
    return;
  }

  // Для HTML-страниц используем Network First
  if (event.request.headers.get('accept') && 
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Создаем копию ответа и сохраняем в кэш
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Если страница не найдена в кэше и мы офлайн
              if (!navigator.onLine) {
                return caches.match('/offline.html');
              }
              // Иначе возвращаем кэшированную главную страницу
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Для остальных ресурсов используем Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Если ресурса нет в кэше, пытаемся получить его из сети
        return fetch(event.request)
          .then(response => {
            // Проверяем, что ответ валидный
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Создаем копию ответа для кэширования
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clonedResponse));
            
            return response;
          })
          .catch(() => {
            // Для изображений можно вернуть заглушку
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/images/image-placeholder.svg');
            }
            return new Response('Ресурс недоступен в офлайн-режиме', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
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