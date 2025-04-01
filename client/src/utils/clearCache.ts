/**
 * Утилита для очистки кэша localStorage
 * 
 * Примечание: Эта утилита создана для отладки и может быть удалена в продакшн-версии
 */

/**
 * Очистка кэша пользователя в localStorage
 */
export function clearUserCache(preserveCountry: boolean = false): void {
  if (preserveCountry) {
    // Сохраняем данные пользователя перед очисткой
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const country = user.country;
        
        // Очищаем и сохраняем только страну
        localStorage.removeItem('user');
        
        if (country) {
          // Получаем текущего пользователя с сервера
          fetch('/api/users/me')
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error('Не удалось получить данные пользователя');
            })
            .then(currentUser => {
              // Обновляем страну и сохраняем обратно
              currentUser.country = country;
              localStorage.setItem('user', JSON.stringify(currentUser));
              console.log(`🧹 Кэш пользователя обновлен с сохранением страны: ${country}`);
            })
            .catch(error => {
              console.error('Ошибка при обновлении кэша:', error);
            });
        }
      } catch (error) {
        console.error('Ошибка при обработке данных пользователя:', error);
        localStorage.removeItem('user');
      }
    }
  } else {
    localStorage.removeItem('user');
    console.log('🧹 Кэш пользователя очищен в localStorage');
  }
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
 * @param preserveCountry Если true, то сохраняет информацию о стране пользователя
 */
export function clearCacheAndReload(preserveCountry: boolean = false): void {
  clearUserCache(preserveCountry);
  setTimeout(() => {
    reloadPage();
  }, 500);
}

// Инициализация глобального объекта для отладки
declare global {
  interface Window {
    appDebug: {
      clearUserCache: (preserveCountry?: boolean) => void;
      clearAllCache: () => void;
      reloadPage: () => void;
      clearCacheAndReload: (preserveCountry?: boolean) => void;
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