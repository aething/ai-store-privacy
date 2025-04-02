/**
 * Утилита для очистки кэша приложения
 * Используется для обеспечения согласованного обновления страницы после изменения данных
 */

/**
 * Очищает кэш, связанный с налогами и ценами
 * @param additionalKeys - Дополнительные ключи для очистки
 */
export function clearTaxCache(additionalKeys: string[] = []) {
  console.log('[clearCache] Clearing tax-related cache...');
  
  // Основные ключи кэша, связанные с налогами
  const defaultKeys = [
    'tax_data',
    'tax_rate',
    'price_data',
    'checkout_data',
    'stripe_tax',
    'cached_prices'
  ];
  
  // Объединяем с дополнительными ключами
  const keysToRemove = [...defaultKeys, ...additionalKeys];
  
  // Удаляем все указанные ключи из localStorage
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`[clearCache] Removed key: ${key}`);
    }
  });
  
  // Добавляем метку времени для предотвращения кэширования запросов
  localStorage.setItem('cache_buster', Date.now().toString());
  console.log('[clearCache] Added cache_buster with timestamp:', Date.now());
  
  // Очищаем sessionStorage, связанный с налогами
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('tax') || 
    key.includes('price') || 
    key.includes('checkout')
  );
  
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`[clearCache] Removed sessionStorage key: ${key}`);
  });
}

/**
 * Очищает кэш пользовательской сессии
 */
export function clearSessionCache() {
  console.log('[clearCache] Clearing session cache...');
  
  // Ключи, связанные с сессией пользователя
  const sessionKeys = [
    'user_session',
    'session_id',
    'auth_token',
    'last_login'
  ];
  
  // Удаляем ключи из localStorage
  sessionKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`[clearCache] Removed session key: ${key}`);
    }
  });
}

/**
 * Полная очистка кэша приложения
 * Использовать с осторожностью - пользователю придется заново войти в систему
 */
export function clearAllCache() {
  console.log('[clearCache] Performing complete cache clear...');
  
  // Сохраняем данные пользователя, если они есть
  const userData = localStorage.getItem('user');
  
  // Очищаем весь localStorage
  localStorage.clear();
  
  // Восстанавливаем данные пользователя
  if (userData) {
    localStorage.setItem('user', userData);
    console.log('[clearCache] Restored user data after full cache clear');
  }
  
  // Очищаем sessionStorage
  sessionStorage.clear();
  
  // Добавляем метку времени
  localStorage.setItem('cache_buster', Date.now().toString());
  
  console.log('[clearCache] Complete cache clear finished');
}