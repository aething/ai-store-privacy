/**
 * AI Store - Utility для очистки кэша и управления производительностью
 * 
 * Этот скрипт помогает пользователям очистить кэш браузера, если у них возникают 
 * проблемы с приложением. Особенно полезен после обновлений функционала.
 */

// Функция для очистки кэша
async function clearBrowserCache() {
  if ('caches' in window) {
    try {
      // Получаем список всех кэшей
      const cacheNames = await caches.keys();
      
      // Очищаем каждый кэш
      const deletionPromises = cacheNames.map(cacheName => {
        return caches.delete(cacheName);
      });
      
      // Ждем завершения всех операций удаления
      await Promise.all(deletionPromises);
      
      console.log('Кэш браузера успешно очищен');
      return true;
    } catch (error) {
      console.error('Ошибка при очистке кэша:', error);
      return false;
    }
  } else {
    console.warn('API кэширования не поддерживается в этом браузере');
    return false;
  }
}

// Функция для регистрации ServiceWorker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker зарегистрирован:', registration);
      return true;
    } catch (error) {
      console.error('Не удалось зарегистрировать ServiceWorker:', error);
      return false;
    }
  } else {
    console.warn('ServiceWorker не поддерживается в этом браузере');
    return false;
  }
}

// Функция для обновления ServiceWorker
async function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Получаем все регистрации ServiceWorker
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Обновляем каждую регистрацию
      const updatePromises = registrations.map(registration => {
        return registration.update();
      });
      
      // Ждем завершения всех обновлений
      await Promise.all(updatePromises);
      
      console.log('ServiceWorker успешно обновлен');
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении ServiceWorker:', error);
      return false;
    }
  } else {
    console.warn('ServiceWorker не поддерживается в этом браузере');
    return false;
  }
}

// Объект с публичными функциями
window.AIStoreMaintenance = {
  clearCache: clearBrowserCache,
  registerSW: registerServiceWorker,
  updateSW: updateServiceWorker,
  
  // Полная очистка и перезагрузка
  refresh: async function() {
    const cacheCleared = await clearBrowserCache();
    const swUpdated = await updateServiceWorker();
    
    // Перезагружаем страницу
    if (cacheCleared || swUpdated) {
      window.location.reload(true);
    }
  }
};

// Автоматическое обновление ServiceWorker при загрузке этого скрипта
updateServiceWorker();

console.log('AI Store: Скрипт обслуживания загружен. Используйте AIStoreMaintenance для управления кэшем.');