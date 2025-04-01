const CACHE_NAME = 'aething-store-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS
  '/assets/index.css',
  // JavaScript
  '/assets/index.js',
  // Иконки
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Установка Service Worker и кэширование статических ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Стратегия для перехвата запросов и использования кэша
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Кэш найден - возвращаем ответ из кэша
        if (response) {
          return response;
        }
        
        // Иначе запрашиваем с сервера
        return fetch(event.request)
          .then(response => {
            // Если ответ некорректный, возвращаем как есть
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ, так как тело ответа может быть использовано только раз
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // Можно вернуть особую страницу при отсутствии сети
            // return caches.match('/offline.html');
          });
      })
  );
});

// Обновление Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Если название кэша не в белом списке - удаляем
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});