// Сервис-воркер для обработки push-уведомлений и кеширования

// Версия кеша
const CACHE_VERSION = 'v1';
const CACHE_NAME = `ai-store-${CACHE_VERSION}`;

// Ресурсы для предварительного кеширования
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/main.js',
  '/style.css',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Предварительное кеширование ключевых ресурсов
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  // Удаление старых версий кеша
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Service Worker: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Обработка fetch запросов с учетом стратегии кеширования
self.addEventListener('fetch', (event) => {
  // Стратегия Network first, затем cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Сохраняем копию ответа в кеш для будущих запросов
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Кешируем только успешные ответы на GET запросы
          if (event.request.method === 'GET' && response.status === 200) {
            cache.put(event.request, clonedResponse);
          }
        });
        return response;
      })
      .catch(() => {
        // При отсутствии сети возвращаем из кеша
        return caches.match(event.request)
          .then((cachedResponse) => {
            // Если найдено в кеше - возвращаем, иначе показываем оффлайн страницу
            return cachedResponse || caches.match('/offline.html');
          });
      })
  );
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {};
  
  try {
    // Пытаемся разобрать данные из сообщения
    notificationData = event.data.json();
  } catch (e) {
    // Если не получилось, используем данные по умолчанию
    notificationData = {
      title: 'AI Store',
      body: 'У нас есть новости для вас!',
      icon: '/icons/app-icon-96x96.png',
      badge: '/icons/badge-icon.png',
      data: {
        url: '/'
      }
    };
  }
  
  // Отображаем уведомление
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: notificationData.data
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Открытие указанного URL при клике на уведомление
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Ищем уже открытое окно с нашим приложением
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        
        // Если нет открытых окон - открываем новое
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});