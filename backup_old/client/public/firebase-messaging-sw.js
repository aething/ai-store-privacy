// Firebase Cloud Messaging Service Worker

// Импортирует скрипты Firebase из CDN, так как Service Worker не может использовать ES модули
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Конфигурация Firebase
const firebaseConfig = {
  // Эти значения будут заменены реальными данными при сборке приложения
  apiKey: "FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: "FIREBASE_AUTH_DOMAIN_PLACEHOLDER",
  projectId: "FIREBASE_PROJECT_ID_PLACEHOLDER",
  storageBucket: "FIREBASE_STORAGE_BUCKET_PLACEHOLDER",
  messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER",
  appId: "FIREBASE_APP_ID_PLACEHOLDER",
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);

// Получаем экземпляр Firebase Messaging
const messaging = firebase.messaging();

// Обработчик фоновых сообщений
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  
  // Извлекаем данные и настраиваем уведомление
  const notificationTitle = payload.notification.title || 'Новое уведомление';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: payload.notification.icon || '/icons/app-icon-96x96.png',
    badge: '/icons/badge-icon.png',
    data: payload.data || {},
    // Настраиваем действия, если они указаны в полезной нагрузке
    actions: payload.notification.actions || []
  };

  // Показываем уведомление
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Обработчик клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received', event);
  
  // Закрываем уведомление
  event.notification.close();
  
  // Определяем URL для открытия
  let url = '/';
  
  // Если в данных уведомления есть URL, используем его
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  // Открываем или фокусируемся на окне с указанным URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Проверяем, есть ли уже открытое окно с нужным URL
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Если нет открытого окна, открываем новое
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Уведомляем об успешной инициализации Service Worker
console.log('Firebase Messaging Service Worker initialized');