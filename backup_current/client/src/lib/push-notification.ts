import { apiRequest } from './queryClient';

// Публичный ключ VAPID для идентификации сервера при отправке уведомлений
const VAPID_PUBLIC_KEY = 'BPD6t0y5rlisRn3DiU8VC-kJZHvVRwDuXiPFO4TKk5ysNjCZ2PvmQf4YaEn9u2PvXXh0NgGK7q4L-npXsM2MFfI';

/**
 * Функция для конвертации base64 строки в Uint8Array для отправки в PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Проверка поддержки push-уведомлений браузером
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

/**
 * Запрос разрешения на показ уведомлений у пользователя
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.error('Push notifications are not supported in this browser');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Регистрация сервис-воркера для push-уведомлений
 */
export async function registerPushWorker(): Promise<string | null> {
  if (!isPushNotificationSupported()) {
    console.error('Push notifications are not supported in this browser');
    return null;
  }
  
  try {
    // Регистрация сервис-воркера
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Получение подписки на push-уведомления
    const subscription = await subscribeToPushNotifications(registration);
    
    if (!subscription) {
      console.error('Failed to subscribe to push notifications');
      return null;
    }
    
    // Отправка подписки на сервер
    const userId = getUserIdFromLocalStorage();
    
    if (!userId) {
      console.error('User ID not found in localStorage');
      return null;
    }
    
    // Регистрация подписки на сервере
    await apiRequest('POST', '/api/push/subscribe', {
      subscription,
      userId
    });
    
    return registration.scope;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Получение ID пользователя из локального хранилища
 */
function getUserIdFromLocalStorage(): number | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch (error) {
    console.error('Error getting user ID from localStorage:', error);
    return null;
  }
}

/**
 * Создание подписки на push-уведомления
 */
async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    // Проверяем, есть ли уже подписка
    let subscription = await registration.pushManager.getSubscription();
    
    // Если подписка существует, используем её
    if (subscription) {
      return subscription;
    }
    
    // Создаем новую подписку
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Уведомления всегда должны быть видимы пользователю
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Отмена подписки на push-уведомления
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.error('Push notifications are not supported in this browser');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('No push subscription to unsubscribe from');
      return true;
    }
    
    // Получаем ID пользователя
    const userId = getUserIdFromLocalStorage();
    
    if (!userId) {
      console.error('User ID not found in localStorage');
      return false;
    }
    
    // Отправляем запрос на отписку на сервер
    await apiRequest('POST', '/api/push/unsubscribe', {
      subscription,
      userId
    });
    
    // Отписываемся локально
    const unsubscribed = await subscription.unsubscribe();
    return unsubscribed;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}