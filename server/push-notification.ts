// Сервисы для работы с push-уведомлениями
import { Request, Response } from 'express';
import webpush from 'web-push';
import { storage } from './storage';

// В реальном приложении ключи должны быть получены с помощью web-push generate-vapid-keys
// и храниться в переменных окружения
const VAPID_PUBLIC_KEY = 'BPD6t0y5rlisRn3DiU8VC-kJZHvVRwDuXiPFO4TKk5ysNjCZ2PvmQf4YaEn9u2PvXXh0NgGK7q4L-npXsM2MFfI';
const VAPID_PRIVATE_KEY = 'cXVGIyvASCEEBPaIkkmomNNyB08SilqvQ98-lkPvmek';

// Конфигурация VAPID для WebPush
webpush.setVapidDetails(
  'mailto:support@aething.com', // Контактный email для идентификации отправителя
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Коллекция для хранения подписок (в реальном приложении должна быть в БД)
const pushSubscriptions = new Map<number, webpush.PushSubscription[]>();

/**
 * Эндпоинт для регистрации новой подписки на push-уведомления
 */
export async function registerPushSubscription(req: Request, res: Response) {
  try {
    const { subscription, userId } = req.body;
    
    if (!subscription || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: subscription and userId are required'
      });
    }
    
    // Проверяем существование пользователя
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Сохраняем подписку для пользователя
    if (!pushSubscriptions.has(userId)) {
      pushSubscriptions.set(userId, []);
    }
    
    // Проверяем, нет ли уже такой подписки
    const userSubscriptions = pushSubscriptions.get(userId) || [];
    const existingSubscription = userSubscriptions.find(
      sub => sub.endpoint === subscription.endpoint
    );
    
    if (!existingSubscription) {
      userSubscriptions.push(subscription);
      pushSubscriptions.set(userId, userSubscriptions);
    }
    
    // Отправляем приветственное уведомление для подтверждения работы
    const payload = JSON.stringify({
      title: 'Успешная подписка',
      body: 'Вы успешно подписались на уведомления AI Store by Aething',
      icon: '/icons/app-icon-96x96.png',
      badge: '/icons/badge-icon.png',
      data: {
        url: '/'
      }
    });
    
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (err) {
      console.error('Error sending welcome notification:', err);
      // Продолжаем выполнение, даже если не удалось отправить тестовое уведомление
    }
    
    return res.status(201).json({
      message: 'Push subscription registered successfully',
      subscriptionsCount: userSubscriptions.length
    });
  } catch (error) {
    console.error('Error registering push subscription:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Эндпоинт для отмены подписки на push-уведомления
 */
export async function unregisterPushSubscription(req: Request, res: Response) {
  try {
    const { subscription, userId } = req.body;
    
    if (!subscription || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: subscription and userId are required'
      });
    }
    
    // Проверяем, есть ли подписки для пользователя
    if (!pushSubscriptions.has(userId)) {
      return res.status(404).json({
        error: 'No subscriptions found for this user'
      });
    }
    
    // Удаляем подписку
    const userSubscriptions = pushSubscriptions.get(userId) || [];
    const updatedSubscriptions = userSubscriptions.filter(
      sub => sub.endpoint !== subscription.endpoint
    );
    
    pushSubscriptions.set(userId, updatedSubscriptions);
    
    return res.status(200).json({
      message: 'Push subscription unregistered successfully',
      subscriptionsCount: updatedSubscriptions.length
    });
  } catch (error) {
    console.error('Error unregistering push subscription:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Отправка уведомления всем подписчикам
 */
export async function sendPushNotificationToAll(title: string, body: string, url: string = '/') {
  const payload = JSON.stringify({
    title,
    body,
    icon: '/icons/app-icon-96x96.png',
    badge: '/icons/badge-icon.png',
    data: { url }
  });
  
  const notificationPromises: Promise<any>[] = [];
  
  // Перебираем все подписки для всех пользователей
  for (const [, subscriptions] of pushSubscriptions.entries()) {
    for (const subscription of subscriptions) {
      try {
        notificationPromises.push(webpush.sendNotification(subscription, payload));
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }
  }
  
  // Ждем завершения всех запросов на отправку
  try {
    await Promise.allSettled(notificationPromises);
    return {
      success: true,
      sent: notificationPromises.length
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return {
      success: false,
      error: String(error)
    };
  }
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
  const userSubscriptions = pushSubscriptions.get(userId) || [];
  
  if (userSubscriptions.length === 0) {
    return {
      success: false,
      error: 'No subscriptions found for this user'
    };
  }
  
  const payload = JSON.stringify({
    title,
    body,
    icon: '/icons/app-icon-96x96.png',
    badge: '/icons/badge-icon.png',
    data: { url }
  });
  
  const notificationPromises: Promise<any>[] = [];
  
  for (const subscription of userSubscriptions) {
    try {
      notificationPromises.push(webpush.sendNotification(subscription, payload));
    } catch (error) {
      console.error('Error sending push notification to user:', error);
    }
  }
  
  try {
    await Promise.allSettled(notificationPromises);
    return {
      success: true,
      sent: notificationPromises.length
    };
  } catch (error) {
    console.error('Error sending push notifications to user:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

// Отправка уведомления при изменении статуса заказа
export async function sendOrderStatusNotification(userId: number, orderId: number, newStatus: string) {
  let title = 'Обновление статуса заказа';
  let body = `Статус вашего заказа #${orderId} изменен на "${newStatus}"`;
  let url = `/account?tab=orders`;
  
  // Формируем специальные сообщения в зависимости от статуса
  switch (newStatus.toLowerCase()) {
    case 'processing':
      title = 'Заказ в обработке';
      body = `Ваш заказ #${orderId} принят и обрабатывается нашей командой`;
      break;
    case 'shipped':
      title = 'Заказ отправлен';
      body = `Ваш заказ #${orderId} отправлен! Ожидайте доставку в ближайшее время`;
      break;
    case 'delivered':
      title = 'Заказ доставлен';
      body = `Ваш заказ #${orderId} успешно доставлен. Спасибо за покупку!`;
      break;
    case 'cancelled':
      title = 'Заказ отменен';
      body = `Ваш заказ #${orderId} был отменен. Если у вас есть вопросы, пожалуйста, свяжитесь с нами`;
      break;
  }
  
  return await sendPushNotificationToUser(userId, title, body, url);
}