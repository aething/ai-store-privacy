/**
 * Интерцепторы API для работы с оффлайн-режимом
 * 
 * Этот модуль предоставляет функциональность для:
 * 1. Перехвата запросов к API
 * 2. Обработки ответов для кэширования данных
 * 3. Предоставления данных из кэша при отсутствии соединения
 */

import { OFFLINE_DATA } from './offlineNavigation';

// Инициализируем флаг для отслеживания статуса сети
let isOfflineMode = !navigator.onLine;

// Обработчики изменения статуса сети
window.addEventListener('online', () => {
  isOfflineMode = false;
});

window.addEventListener('offline', () => {
  isOfflineMode = true;
});

/**
 * Инициализирует перехватчики API запросов
 */
export function initApiInterceptors() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input, init) {
    // Если мы оффлайн и это запрос к API - пробуем использовать кэшированные данные
    let url: string;
    
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = String(input);
    }
    
    if (isOfflineMode && url.includes('/api/')) {
      // Обрабатываем известные API эндпоинты
      if (url.includes('/api/products')) {
        return createMockResponse(OFFLINE_DATA.products, url);
      }
      
      if (url.includes('/api/users/me')) {
        return createMockResponse(OFFLINE_DATA.user, url);
      }
      
      // Для других API запросов возвращаем оффлайн-ошибку
      return createErrorResponse('Запрос невозможен в оффлайн-режиме', url);
    }
    
    // Если мы онлайн, делаем обычный запрос
    try {
      const response = await originalFetch(input, init);
      
      // Для успешных GET-запросов кэшируем данные
      if (
        response.ok && 
        url.includes('/api/') &&
        (!init || init.method === 'GET' || !init.method)
      ) {
        try {
          // Клонируем ответ, чтобы не "потреблять" его
          const responseClone = response.clone();
          const data = await responseClone.json();
          
          // Генерируем событие для сохранения данных в кэш
          const event = new CustomEvent('api-success', {
            detail: { endpoint: url, data }
          });
          window.dispatchEvent(event);
        } catch (error) {
          // Игнорируем ошибки при кэшировании ответа
        }
      }
      
      return response;
    } catch (error) {
      // Если произошла ошибка сети, пробуем использовать кэш, даже если мы "онлайн"
      if (url.includes('/api/products')) {
        return createMockResponse(OFFLINE_DATA.products, url);
      }
      
      if (url.includes('/api/users/me')) {
        return createMockResponse(OFFLINE_DATA.user, url);
      }
      
      // Для других запросов просто пробрасываем ошибку
      return createErrorResponse(
        'Ошибка сети. Проверьте подключение к интернету.',
        url
      );
    }
  };
}

/**
 * Создает имитацию ответа для оффлайн-режима
 */
function createMockResponse(data: any, url: string): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Offline-Mode': 'true',
      'X-Requested-URL': url
    }
  });
}

/**
 * Создает ответ с ошибкой для оффлайн-режима
 */
function createErrorResponse(message: string, url: string): Response {
  return new Response(
    JSON.stringify({
      error: true,
      message,
      offline: true,
      url
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true',
        'X-Requested-URL': url
      }
    }
  );
}

export default initApiInterceptors;