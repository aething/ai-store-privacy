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
  '/manifest.json'
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

// Стратегия кэширования "Network first, cache fallback"
self.addEventListener('fetch', event => {
  // Не перехватываем запросы к API и сторонним ресурсам
  if (event.request.url.includes('/api/') || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Для HTML-страниц используем Network First
  if (event.request.headers.get('accept').includes('text/html')) {
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
              // Возвращаем кэшированную главную страницу для маршрутов
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
          });
      })
  );
});

// Обработка оффлайн-режима и отображение оффлайн-страницы
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' && !navigator.onLine) {
    event.respondWith(
      caches.match('/offline.html')
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Если нет оффлайн-страницы, возвращаем кэшированную главную страницу
          return caches.match('/');
        })
    );
  }
});

// Слушаем сообщения от клиентского кода
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});