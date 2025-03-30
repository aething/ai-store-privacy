import nodemailer from 'nodemailer';
import { Order } from '@shared/schema';
import { storage } from './storage';

// Создаем транспорт для отправки писем
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Проверка настроек SMTP соединения
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email connection verified successfully');
    return true;
  } catch (error) {
    console.error('Email connection verification failed:', error);
    return false;
  }
}

/**
 * Отправка подтверждения заказа по электронной почте
 * @param order Заказ
 * @param email Электронная почта получателя
 * @param language Код языка для локализации (по умолчанию 'ru')
 */
export async function sendOrderConfirmation(
  order: Order, 
  email: string,
  language: string = 'en'
): Promise<boolean> {
  try {
    // Получаем данные о продукте
    const product = await storage.getProduct(order.productId || 0);
    
    if (!product) {
      throw new Error(`Product with id ${order.productId} not found`);
    }

    // Заголовки в зависимости от языка
    const subjects: Record<string, string> = {
      ru: `Подтверждение заказа #${order.id}`,
      en: `Order Confirmation #${order.id}`,
      de: `Bestellbestätigung #${order.id}`,
      es: `Confirmación de pedido #${order.id}`,
      fr: `Confirmation de commande #${order.id}`,
      it: `Conferma dell'ordine #${order.id}`,
      ja: `注文確認 #${order.id}`,
      zh: `订单确认 #${order.id}`
    };

    // Шаблоны письма для разных языков
    const templates: Record<string, string> = {
      ru: `
        <h2>Спасибо за ваш заказ!</h2>
        <p>Мы получили ваш заказ и сейчас обрабатываем его.</p>
        <h3>Детали заказа:</h3>
        <ul>
          <li>Номер заказа: ${order.id}</li>
          <li>Продукт: ${product.title}</li>
          <li>Сумма: ${formatCurrency(order.amount, order.currency)}</li>
          <li>Статус: ${order.status}</li>
        </ul>
        <p>Вы получите дополнительное уведомление, когда ваш заказ будет готов к отправке.</p>
        <p>Если у вас возникли вопросы, пожалуйста, ответьте на это письмо или свяжитесь с нашей службой поддержки.</p>
        <p>С уважением,<br>AI Store от команды Aething</p>
      `,
      en: `
        <h2>Thank you for your order!</h2>
        <p>We have received your order and are processing it now.</p>
        <h3>Order details:</h3>
        <ul>
          <li>Order number: ${order.id}</li>
          <li>Product: ${product.title}</li>
          <li>Amount: ${formatCurrency(order.amount, order.currency)}</li>
          <li>Status: ${order.status}</li>
        </ul>
        <p>You will receive another notification when your order is ready to ship.</p>
        <p>If you have any questions, please reply to this email or contact our support team.</p>
        <p>Best regards,<br>AI Store by Aething Team</p>
      `,
      // Добавьте шаблоны для других языков по аналогии
    };

    // Выбираем шаблон в зависимости от языка, дефолт - английский
    const emailTemplate = templates[language] || templates.en;
    const emailSubject = subjects[language] || subjects.en;

    // Отправляем письмо
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      html: emailTemplate
    });

    console.log(`Order confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Отправка уведомления об обновлении статуса заказа
 * @param order Заказ
 * @param email Электронная почта получателя
 * @param language Код языка для локализации (по умолчанию 'ru')
 */
export async function sendOrderStatusUpdate(
  order: Order,
  email: string,
  language: string = 'en'
): Promise<boolean> {
  try {
    // Получаем данные о продукте
    const product = await storage.getProduct(order.productId || 0);
    
    if (!product) {
      throw new Error(`Product with id ${order.productId} not found`);
    }

    // Заголовки в зависимости от языка
    const subjects: Record<string, string> = {
      ru: `Обновление статуса заказа #${order.id}`,
      en: `Order Status Update #${order.id}`,
      de: `Aktualisierung des Bestellstatus #${order.id}`,
      es: `Actualización del estado del pedido #${order.id}`,
      fr: `Mise à jour du statut de la commande #${order.id}`,
      it: `Aggiornamento dello stato dell'ordine #${order.id}`,
      ja: `注文状況の更新 #${order.id}`,
      zh: `订单状态更新 #${order.id}`
    };

    // Статусы на разных языках
    const statusTranslations: Record<string, Record<string, string>> = {
      ru: {
        pending: 'Ожидает обработки',
        processing: 'В обработке',
        shipped: 'Отправлен',
        delivered: 'Доставлен',
        cancelled: 'Отменен'
      },
      en: {
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      },
      // Добавьте переводы для других языков
    };

    // Локализация статуса
    const translatedStatus = 
      (statusTranslations[language] && statusTranslations[language][order.status.toLowerCase()]) || 
      (statusTranslations.en && statusTranslations.en[order.status.toLowerCase()]) || 
      order.status;

    // Шаблоны письма для разных языков
    const templates: Record<string, string> = {
      ru: `
        <h2>Статус вашего заказа обновлен!</h2>
        <p>Актуальная информация о заказе:</p>
        <h3>Детали заказа:</h3>
        <ul>
          <li>Номер заказа: ${order.id}</li>
          <li>Продукт: ${product.title}</li>
          <li>Сумма: ${formatCurrency(order.amount, order.currency)}</li>
          <li>Новый статус: <strong>${translatedStatus}</strong></li>
          ${order.trackingNumber ? `<li>Номер для отслеживания: ${order.trackingNumber}</li>` : ''}
        </ul>
        ${order.trackingNumber ? `<p>Вы можете отслеживать вашу посылку по номеру отслеживания ${order.trackingNumber}.</p>` : ''}
        <p>Если у вас возникли вопросы, пожалуйста, ответьте на это письмо или свяжитесь с нашей службой поддержки.</p>
        <p>С уважением,<br>AI Store от команды Aething</p>
      `,
      en: `
        <h2>Your Order Status Has Been Updated!</h2>
        <p>Here is the latest information about your order:</p>
        <h3>Order details:</h3>
        <ul>
          <li>Order number: ${order.id}</li>
          <li>Product: ${product.title}</li>
          <li>Amount: ${formatCurrency(order.amount, order.currency)}</li>
          <li>New status: <strong>${translatedStatus}</strong></li>
          ${order.trackingNumber ? `<li>Tracking number: ${order.trackingNumber}</li>` : ''}
        </ul>
        ${order.trackingNumber ? `<p>You can track your package using the tracking number ${order.trackingNumber}.</p>` : ''}
        <p>If you have any questions, please reply to this email or contact our support team.</p>
        <p>Best regards,<br>AI Store by Aething Team</p>
      `,
      // Добавьте шаблоны для других языков по аналогии
    };

    // Выбираем шаблон в зависимости от языка, дефолт - английский
    const emailTemplate = templates[language] || templates.en;
    const emailSubject = subjects[language] || subjects.en;

    // Отправляем письмо
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      html: emailTemplate
    });

    console.log(`Order status update email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return false;
  }
}

/**
 * Отправка уведомления о номере отслеживания
 * @param order Заказ
 * @param email Электронная почта получателя
 * @param language Код языка для локализации (по умолчанию 'ru')
 */
export async function sendTrackingUpdate(
  order: Order,
  email: string,
  language: string = 'ru'
): Promise<boolean> {
  try {
    if (!order.trackingNumber) {
      throw new Error('No tracking number provided');
    }

    // Получаем данные о продукте
    const product = await storage.getProduct(order.productId || 0);
    
    if (!product) {
      throw new Error(`Product with id ${order.productId} not found`);
    }

    // Заголовки в зависимости от языка
    const subjects: Record<string, string> = {
      ru: `Номер отслеживания для заказа #${order.id}`,
      en: `Tracking Number for Order #${order.id}`,
      de: `Sendungsverfolgungsnummer für Bestellung #${order.id}`,
      es: `Número de seguimiento para el pedido #${order.id}`,
      fr: `Numéro de suivi pour la commande #${order.id}`,
      it: `Numero di tracciamento per l'ordine #${order.id}`,
      ja: `注文の追跡番号 #${order.id}`,
      zh: `订单的跟踪号 #${order.id}`
    };

    // Шаблоны письма для разных языков
    const templates: Record<string, string> = {
      ru: `
        <h2>Ваш заказ отправлен!</h2>
        <p>Для вашего заказа добавлен номер отслеживания:</p>
        <h3>Детали заказа:</h3>
        <ul>
          <li>Номер заказа: ${order.id}</li>
          <li>Продукт: ${product.title}</li>
          <li>Номер отслеживания: <strong>${order.trackingNumber}</strong></li>
        </ul>
        <p>Вы можете отслеживать вашу посылку по ссылке: <a href="https://www.aftership.com/track?tracking_number=${order.trackingNumber}">Отследить посылку</a></p>
        <p>Если у вас возникли вопросы, пожалуйста, ответьте на это письмо или свяжитесь с нашей службой поддержки.</p>
        <p>С уважением,<br>AI Store от команды Aething</p>
      `,
      en: `
        <h2>Your Order Has Been Shipped!</h2>
        <p>A tracking number has been added to your order:</p>
        <h3>Order details:</h3>
        <ul>
          <li>Order number: ${order.id}</li>
          <li>Product: ${product.title}</li>
          <li>Tracking number: <strong>${order.trackingNumber}</strong></li>
        </ul>
        <p>You can track your package using this link: <a href="https://www.aftership.com/track?tracking_number=${order.trackingNumber}">Track Package</a></p>
        <p>If you have any questions, please reply to this email or contact our support team.</p>
        <p>Best regards,<br>AI Store by Aething Team</p>
      `,
      // Добавьте шаблоны для других языков по аналогии
    };

    // Выбираем шаблон в зависимости от языка, дефолт - английский
    const emailTemplate = templates[language] || templates.en;
    const emailSubject = subjects[language] || subjects.en;

    // Отправляем письмо
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      html: emailTemplate
    });

    console.log(`Tracking number update email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending tracking number update email:', error);
    return false;
  }
}

/**
 * Форматирование валюты
 */
function formatCurrency(amount: number, currency: string = 'usd'): string {
  const value = amount / 100;
  
  const currencyCode = currency.toLowerCase();
  
  if (currencyCode === 'eur') {
    return `€${value.toFixed(2)}`;
  } else if (currencyCode === 'gbp') {
    return `£${value.toFixed(2)}`;
  } else if (currencyCode === 'jpy') {
    return `¥${Math.round(value)}`;
  } else if (currencyCode === 'rub') {
    return `₽${value.toFixed(2)}`;
  } else if (currencyCode === 'cny' || currencyCode === 'rmb') {
    return `¥${value.toFixed(2)}`;
  } else {
    // Default to USD
    return `$${value.toFixed(2)}`;
  }
}