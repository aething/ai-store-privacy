/**
 * Утилита для очистки кэша localStorage
 * 
 * Примечание: Эта утилита создана для отладки и может быть удалена в продакшн-версии
 */

/**
 * Очистка кэша пользователя в localStorage
 */
export function clearUserCache(): void {
  localStorage.removeItem('user');
  console.log('🧹 Кэш пользователя очищен в localStorage');
}

/**
 * Полная очистка localStorage
 */
export function clearAllCache(): void {
  localStorage.clear();
  console.log('🧹 Весь localStorage очищен');
}

/**
 * Перезагрузка страницы
 */
export function reloadPage(): void {
  console.log('🔄 Перезагрузка страницы...');
  window.location.reload();
}

/**
 * Очистка кэша и перезагрузка страницы
 */
export function clearCacheAndReload(): void {
  clearUserCache();
  setTimeout(() => {
    reloadPage();
  }, 500);
}

// Инициализация глобального объекта для отладки
declare global {
  interface Window {
    appDebug: {
      clearUserCache: () => void;
      clearAllCache: () => void;
      reloadPage: () => void;
      clearCacheAndReload: () => void;
    };
  }
}

// Добавляем функции в глобальный объект окна для вызова из консоли
if (typeof window !== 'undefined') {
  window.appDebug = {
    clearUserCache,
    clearAllCache,
    reloadPage,
    clearCacheAndReload
  };
}