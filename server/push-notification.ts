import { Request, Response } from 'express';
import webpush from 'web-push';
import { storage } from './storage';
import { log } from './vite';
import * as admin from 'firebase-admin';

// Проверяем наличие необходимых переменных окружения
let firebaseInitialized = false;
let webpushInitialized = false;

// Инициализируем Firebase Admin SDK только если все необходимые переменные окружения доступны
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Заменяем экранированные новые строки настоящими новыми строками
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    firebaseInitialized = true;
    log('Firebase Admin SDK initialized successfully', 'push-notification');
  } catch (error) {
    log(`Failed to initialize Firebase Admin SDK: ${error}`, 'push-notification');
  }
} else {
  log('Skipping Firebase Admin SDK initialization: missing required environment variables', 'push-notification');
}

// Устанавливаем данные VAPID для web-push только если ключи доступны
if (process.env.FIREBASE_VAPID_PUBLIC_KEY && process.env.FIREBASE_VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:contact@example.com', // Заменить на действительный email для контакта
      process.env.FIREBASE_VAPID_PUBLIC_KEY,
      process.env.FIREBASE_VAPID_PRIVATE_KEY
    );
    webpushInitialized = true;
    log('Web-push initialized successfully with VAPID keys', 'push-notification');
  } catch (error) {
    log(`Failed to initialize web-push: ${error}`, 'push-notification');
  }
} else {
  log('Skipping web-push initialization: missing VAPID keys', 'push-notification');
}

// Хранилище для подписок на push-уведомления (временное решение, можно перенести в более постоянное хранилище)
const pushSubscriptions = new Map<number, PushSubscription[]>();

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: number;
}

/**
 * Эндпоинт для регистрации новой подписки на push-уведомления
 */
export async function registerPushSubscription(req: Request, res: Response) {
  try {
    // Если web-push не инициализирован, уведомляем клиента
    if (!webpushInitialized) {
      log('Push notification service is not initialized', 'push-notification');
      return res.status(503).json({ 
        error: 'Push notification service is unavailable',
        initialized: false 
      });
    }

    const subscription = req.body.subscription;
    const userId = req.body.userId;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    // Если userId указан, связываем подписку с пользователем
    if (userId) {
      // Проверяем, существует ли пользователь
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Получаем текущие подписки пользователя или создаем новый массив
      const userSubscriptions = pushSubscriptions.get(userId) || [];
      
      // Проверяем, существует ли уже эта подписка
      const existingIndex = userSubscriptions.findIndex(sub => sub.endpoint === subscription.endpoint);
      
      if (existingIndex === -1) {
        // Добавляем новую подписку
        userSubscriptions.push({
          ...subscription,
          userId
        });
        pushSubscriptions.set(userId, userSubscriptions);
      }
    }

    log(`Push subscription registered for user ID: ${userId}`, 'push-notification');
    return res.status(201).json({ 
      message: 'Subscription added successfully',
      initialized: true
    });
  } catch (error) {
    log(`Error registering push subscription: ${error}`, 'push-notification');
    return res.status(500).json({ error: 'Failed to register subscription' });
  }
}

/**
 * Эндпоинт для отмены подписки на push-уведомления
 */
export async function unregisterPushSubscription(req: Request, res: Response) {
  try {
    // Если web-push не инициализирован, уведомляем клиента
    if (!webpushInitialized) {
      log('Push notification service is not initialized', 'push-notification');
      return res.status(503).json({ 
        error: 'Push notification service is unavailable',
        initialized: false 
      });
    }

    const endpoint = req.body.endpoint;
    const userId = req.body.userId;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    if (userId) {
      const userSubscriptions = pushSubscriptions.get(userId);
      
      if (userSubscriptions) {
        // Удаляем подписку с данным endpoint
        const updatedSubscriptions = userSubscriptions.filter(sub => sub.endpoint !== endpoint);
        
        if (updatedSubscriptions.length === 0) {
          pushSubscriptions.delete(userId);
        } else {
          pushSubscriptions.set(userId, updatedSubscriptions);
        }
      }
    }

    log(`Push subscription unregistered for user ID: ${userId}`, 'push-notification');
    return res.status(200).json({ 
      message: 'Subscription removed successfully',
      initialized: true 
    });
  } catch (error) {
    log(`Error unregistering push subscription: ${error}`, 'push-notification');
    return res.status(500).json({ error: 'Failed to unregister subscription' });
  }
}

/**
 * Отправка уведомления всем подписчикам
 */
export async function sendPushNotificationToAll(title: string, body: string, url: string = '/') {
  // Если web-push не инициализирован, логируем и возвращаемся
  if (!webpushInitialized) {
    log('Cannot send push notifications: web-push is not initialized', 'push-notification');
    return Promise.resolve();
  }

  const payload = JSON.stringify({
    notification: {
      title,
      body,
      icon: '/icons/app-icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url
      },
    }
  });

  // Отправка уведомлений с помощью web-push
  const notificationPromises: Promise<any>[] = [];

  // Для каждого пользователя в Map
  pushSubscriptions.forEach((subscriptions) => {
    // Для каждой подписки пользователя
    subscriptions.forEach((subscription) => {
      // Отправляем уведомление через web-push
      notificationPromises.push(
        webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: subscription.keys
        }, payload)
        .catch((error: any) => {
          // Если получаем ошибку GONE (410), значит подписка более не действительна
          if (error.statusCode === 410) {
            log(`Subscription is no longer valid: ${subscription.endpoint}`, 'push-notification');
            // Здесь нужно будет удалить недействительные подписки
          } else {
            log(`Error sending push notification: ${error}`, 'push-notification');
          }
        })
      );
    });
  });

  // Отправка уведомлений с помощью Firebase Cloud Messaging (FCM)
  // Закомментировано до получения правильных FCM токенов
  /*
  try {
    // Firebase Cloud Messaging v9+ не имеет метода sendMulticast, используем другой подход
    // Здесь должны быть FCM токены пользователей
    const tokens: string[] = [];
    
    if (tokens.length > 0) {
      await admin.messaging().sendEachForMultipleTokens({
        notification: {
          title,
          body,
        },
        webpush: {
          notification: {
            icon: '/icons/app-icon-96x96.png',
            vibrate: [100, 50, 100],
            data: {
              url
            },
          }
        },
        tokens: tokens
      });
    }
  } catch (error: any) {
    log(`Error sending FCM notifications: ${error}`, 'push-notification');
  }
  */

  return Promise.all(notificationPromises);
}

/**
 * Отправка уведомления конкретному пользователю
 */
export async function sendPushNotificationToUser(
  userId: number,
  title: string,
  body: string,
  url: string = '/'
) {
  // Если web-push не инициализирован, логируем и возвращаемся
  if (!webpushInitialized) {
    log('Cannot send push notifications: web-push is not initialized', 'push-notification');
    return Promise.resolve();
  }

  const userSubscriptions = pushSubscriptions.get(userId);
  
  if (!userSubscriptions || userSubscriptions.length === 0) {
    log(`No push subscriptions found for user ID: ${userId}`, 'push-notification');
    return Promise.resolve();
  }

  const payload = JSON.stringify({
    notification: {
      title,
      body,
      icon: '/icons/app-icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url
      },
    }
  });

  const notificationPromises = userSubscriptions.map(subscription => {
    return webpush.sendNotification({
      endpoint: subscription.endpoint,
      keys: subscription.keys
    }, payload)
    .catch((error: any) => {
      if (error.statusCode === 410) {
        log(`Subscription is no longer valid: ${subscription.endpoint}`, 'push-notification');
        // Здесь нужно будет удалить недействительные подписки
      } else {
        log(`Error sending push notification: ${error}`, 'push-notification');
      }
    });
  });

  return Promise.all(notificationPromises);
}

export async function sendOrderStatusNotification(userId: number, orderId: number, newStatus: string) {
  const statusMessages: { [key: string]: { title: string; body: string } } = {
    'processing': {
      title: 'Заказ принят в обработку',
      body: `Заказ №${orderId} был принят в обработку. Мы уведомим вас о следующих изменениях статуса.`
    },
    'completed': {
      title: 'Оплата подтверждена',
      body: `Оплата заказа №${orderId} успешно подтверждена. Заказ передан в обработку.`
    },
    'shipped': {
      title: 'Заказ отправлен',
      body: `Заказ №${orderId} был отправлен. Ожидайте доставку в ближайшее время.`
    },
    'delivered': {
      title: 'Заказ доставлен',
      body: `Заказ №${orderId} доставлен. Спасибо за покупку!`
    },
    'cancelled': {
      title: 'Заказ отменен',
      body: `Заказ №${orderId} был отменен. Если у вас возникли вопросы, пожалуйста, свяжитесь с нами.`
    },
    'failed': {
      title: 'Ошибка оплаты',
      body: `К сожалению, при оплате заказа №${orderId} произошла ошибка. Пожалуйста, проверьте ваш способ оплаты или свяжитесь с нами для помощи.`
    }
  };

  const message = statusMessages[newStatus];
  if (!message) {
    log(`No notification message for status: ${newStatus}`, 'push-notification');
    return;
  }

  return sendPushNotificationToUser(userId, message.title, message.body, `/account?order=${orderId}`);
}