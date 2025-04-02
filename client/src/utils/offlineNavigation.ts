/**
 * Модуль для реализации навигации в оффлайн-режиме
 * 
 * Этот модуль предоставляет функциональность для:
 * 1. Определения доступности маршрутов в оффлайн-режиме
 * 2. Кэширования и загрузки данных для оффлайн-режима
 * 3. Мониторинга состояния сети
 */

// Глобальное хранилище кэшированных данных
export const OFFLINE_DATA = {
  products: [] as any[],
  user: null as any
};

// Список маршрутов, доступных в оффлайн-режиме
export const OFFLINE_ROUTES = [
  '/',                    // Главная страница
  '/account',             // Личный кабинет
  '/offline-test',        // Тестовая страница офлайн-режима
  '/offline-enhanced',    // Расширенная оффлайн-страница
];

/**
 * Инициализация модуля оффлайн-навигации
 */
export function initOfflineNavigation() {
  console.log('[Offline Navigation] Инициализация...');
  
  // Загружаем данные из localStorage
  loadOfflineData();
  
  // Добавляем слушатели событий сети
  window.addEventListener('online', () => {
    console.log('[Offline Navigation] Соединение восстановлено');
    dispatchNetworkEvent(true);
  });
  
  window.addEventListener('offline', () => {
    console.log('[Offline Navigation] Соединение потеряно');
    dispatchNetworkEvent(false);
  });
  
  // Отправляем начальное событие о состоянии сети
  dispatchNetworkEvent(navigator.onLine);
  
  return true;
}

/**
 * Проверяет, доступен ли маршрут в оффлайн-режиме
 */
export function isRouteAvailableOffline(route: string): boolean {
  // Если маршрут точно совпадает с одним из доступных оффлайн-маршрутов
  if (OFFLINE_ROUTES.includes(route)) {
    return true;
  }
  
  // Проверяем маршруты с параметрами
  for (const offlineRoute of OFFLINE_ROUTES) {
    if (offlineRoute.includes(':') && route.startsWith(offlineRoute.split(':')[0])) {
      return true;
    }
  }
  
  // Проверяем, есть ли у нас кэшированные данные для этого продукта
  if (route.startsWith('/product/') && OFFLINE_DATA.products.length > 0) {
    const productId = route.split('/').pop();
    
    // Если есть ID продукта и он есть в кэше
    if (productId && OFFLINE_DATA.products.some(p => p.id.toString() === productId)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Отправляет событие об изменении состояния сети
 */
function dispatchNetworkEvent(isOnline: boolean) {
  const event = new CustomEvent('network-status-change', {
    detail: { online: isOnline }
  });
  window.dispatchEvent(event);
  
  // Обновляем состояние документа, добавляя/удаляя класс "offline"
  if (isOnline) {
    document.documentElement.classList.remove('offline');
  } else {
    document.documentElement.classList.add('offline');
  }
}

/**
 * Мы больше не реэкспортируем хук useNetworkStatus отсюда
 * чтобы избежать циклических зависимостей
 */

/**
 * Сохраняет данные в localStorage для оффлайн-режима
 */
export function saveOfflineData() {
  try {
    // Сохраняем данные по каждому типу отдельно для более гибкого обновления
    localStorage.setItem('offline_products', JSON.stringify(OFFLINE_DATA.products));
    
    if (OFFLINE_DATA.user) {
      localStorage.setItem('offline_user', JSON.stringify(OFFLINE_DATA.user));
    }
    
    console.log('[Offline Navigation] Данные сохранены в localStorage');
    return true;
  } catch (error) {
    console.error('[Offline Navigation] Ошибка при сохранении данных:', error);
    return false;
  }
}

/**
 * Загружает кэшированные данные из localStorage
 */
export function loadOfflineData() {
  try {
    // Загружаем данные о продуктах
    const productsData = localStorage.getItem('offline_products');
    if (productsData) {
      OFFLINE_DATA.products = JSON.parse(productsData);
      console.log(`[Offline Navigation] Загружено ${OFFLINE_DATA.products.length} продуктов из кэша`);
    }
    
    // Загружаем данные пользователя
    const userData = localStorage.getItem('offline_user');
    if (userData) {
      OFFLINE_DATA.user = JSON.parse(userData);
      console.log(`[Offline Navigation] Загружены данные пользователя из кэша (${OFFLINE_DATA.user.username})`);
    }
    
    return true;
  } catch (error) {
    console.error('[Offline Navigation] Ошибка при загрузке данных:', error);
    return false;
  }
}

/**
 * Кэширует данные для оффлайн-режима
 */
export function cacheDataForOffline(dataType: 'products' | 'user', data: any) {
  if (dataType === 'products' && Array.isArray(data)) {
    OFFLINE_DATA.products = data;
    console.log(`[Offline Navigation] Кэшировано ${data.length} продуктов`);
  } else if (dataType === 'user' && data) {
    OFFLINE_DATA.user = data;
    console.log(`[Offline Navigation] Кэширован пользователь (${data.username})`);
  }
  
  // Сохраняем обновленные данные в localStorage
  saveOfflineData();
  
  return true;
}

/**
 * Очищает кэш оффлайн-данных
 */
export function clearOfflineData() {
  OFFLINE_DATA.products = [];
  OFFLINE_DATA.user = null;
  
  // Удаляем данные из localStorage
  localStorage.removeItem('offline_products');
  localStorage.removeItem('offline_user');
  
  console.log('[Offline Navigation] Кэш оффлайн-данных очищен');
  
  return true;
}

export default {
  initOfflineNavigation,
  isRouteAvailableOffline,
  saveOfflineData,
  loadOfflineData,
  cacheDataForOffline,
  clearOfflineData,
  OFFLINE_DATA,
  OFFLINE_ROUTES
};