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

/**
 * Очищает кэш пользователя, опционально сохраняя страну
 * @param preserveCountry - Если true, сохраняет выбранную пользователем страну
 */
export function clearUserCache(preserveCountry = false) {
  console.log('[clearCache] Clearing user cache, preserveCountry:', preserveCountry);
  
  // Сохраняем данные пользователя
  const userData = localStorage.getItem('user');
  let country: string | null = null;
  
  // Извлекаем страну из данных пользователя, если нужно сохранить
  if (preserveCountry && userData) {
    try {
      const user = JSON.parse(userData);
      country = user.country || null;
      console.log('[clearCache] Preserved country:', country);
    } catch (e) {
      console.error('[clearCache] Error parsing user data:', e);
    }
  }
  
  // Очищаем кэш, связанный с пользователем
  const userKeys = [
    'user',
    'user_preferences',
    'user_settings',
    'last_checkout'
  ];
  
  userKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`[clearCache] Removed user key: ${key}`);
    }
  });
  
  // Восстанавливаем данные пользователя и страну, если нужно
  if (userData) {
    try {
      const user = JSON.parse(userData);
      
      // Восстанавливаем страну, если нужно
      if (preserveCountry && country) {
        user.country = country;
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      console.log('[clearCache] Restored user data');
    } catch (e) {
      console.error('[clearCache] Error restoring user data:', e);
    }
  }
  
  // Очищаем налоговый кэш
  clearTaxCache();
}

/**
 * Перезагружает страницу с добавлением метки времени для предотвращения кэширования
 */
export function reloadPage() {
  console.log('[clearCache] Reloading page...');
  
  // Добавляем метку времени в URL для предотвращения кэширования
  const timestamp = Date.now();
  const separator = window.location.href.includes('?') ? '&' : '?';
  const newUrl = `${window.location.href}${separator}_=${timestamp}`;
  
  window.location.href = newUrl;
}

/**
 * Очищает кэш и перезагружает страницу
 * @param preserveCountry - Если true, сохраняет выбранную пользователем страну
 */
export function clearCacheAndReload(preserveCountry = false) {
  console.log('[clearCache] Clearing cache and reloading...');
  
  // Сначала очищаем кэш
  clearUserCache(preserveCountry);
  
  // Затем перезагружаем страницу после небольшой задержки
  setTimeout(() => {
    reloadPage();
  }, 300);
}