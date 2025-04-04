/**
 * Глобальный обработчик необработанных ошибок в приложении
 * 
 * Этот модуль отвечает за перехват всех необработанных ошибок и их отправку
 * на сервер для анализа.
 */

import { errorLogger, LogEventType } from '../services/errorLogging';

/**
 * Инициализирует глобальные обработчики ошибок
 */
export function initErrorHandlers() {
  // Глобальный обработчик для необработанных исключений
  window.addEventListener('error', (event) => {
    // Ошибка уже будет перехвачена в ErrorLogger через его собственные обработчики
    // Здесь можно добавить дополнительную логику, если необходимо
    event.preventDefault(); // Предотвращаем стандартное поведение браузера
  });

  // Глобальный обработчик для необработанных reject в промисах
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const message = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Unhandled Promise Rejection';
    
    // Логируем ошибку
    errorLogger.logError(
      LogEventType.ERROR,
      message,
      {
        stack: error instanceof Error ? error.stack : undefined,
        type: 'unhandledrejection',
        reason: error instanceof Error ? undefined : error
      }
    );
    
    event.preventDefault(); // Предотвращаем стандартное поведение браузера
  });

  // Глобальный обработчик для ошибок платежей
  window.addEventListener('stripe-error', (event: any) => {
    const { detail } = event;
    
    if (detail && detail.error) {
      errorLogger.logPaymentError(
        `Stripe payment error: ${detail.error.message || 'Unknown error'}`,
        {
          code: detail.error.code,
          type: detail.error.type,
          payment_method: detail.paymentMethod,
          element: detail.element
        }
      );
    }
  });

  // Добавляем обработчик для краха приложения (перед закрытием окна)
  window.addEventListener('beforeunload', () => {
    // Отправляем все логи, которые еще не были отправлены
    // Это может не всегда успеть выполниться, так как браузер может закрыть соединение
    navigator.sendBeacon('/api/logs', JSON.stringify([
      {
        type: LogEventType.APP_CRASH,
        message: 'Application closed or refreshed',
        timestamp: Date.now(),
        deviceInfo: {
          platform: 'web',
          networkStatus: navigator.onLine ? 'online' : 'offline'
        }
      }
    ]));
  });

  console.log('Global error handlers initialized');
}

export default initErrorHandlers;