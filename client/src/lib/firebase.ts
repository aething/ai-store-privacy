import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Конфигурация Firebase из переменных окружения
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Инициализация Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

/**
 * Запрос токена FCM для браузера
 * @returns Promise с токеном FCM или null, если произошла ошибка
 */
export async function requestFCMToken(): Promise<string | null> {
  try {
    // Проверяем наличие Service Worker и поддержки FCM
    if ('serviceWorker' in navigator) {
      // Регистрируем Service Worker, если он еще не зарегистрирован
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      
      if (!registration) {
        console.info('Registering new Firebase Messaging service worker');
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }
      
      // Запрашиваем разрешение на уведомления, если оно еще не предоставлено
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }
      
      try {
        // Получаем токен FCM
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });
        
        if (token) {
          console.log('FCM registration token:', token);
          return token;
        } else {
          console.warn('No registration token available');
          return null;
        }
      } catch (error) {
        console.error('An error occurred while retrieving token:', error);
        return null;
      }
    } else {
      console.warn('Service workers are not supported in this browser');
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);
    return null;
  }
}

/**
 * Обработчик входящих сообщений в переднем плане
 * @param callback Функция, вызываемая при получении нового сообщения
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  return onMessage(messaging, (payload) => {
    console.log('Received foreground message:', payload);
    callback(payload);
  });
}

/**
 * Проверяет поддержку Firebase Messaging в текущем браузере
 * @returns true, если Firebase Messaging поддерживается
 */
export function isFirebaseMessagingSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export { firebaseApp, messaging };