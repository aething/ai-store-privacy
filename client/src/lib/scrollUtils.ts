/**
 * Упрощенные утилиты для управления позицией скролла и её сохранения при навигации
 * Максимально простой и надежный подход без сложных структур данных
 */

// Прямая работа с sessionStorage для сохранения/восстановления позиции
const ACCOUNT_SCROLL_KEY = 'accountScrollPosition';

/**
 * Сохраняет текущую позицию скролла страницы Account
 */
export function saveAccountScrollPosition(): void {
  try {
    const scrollY = window.scrollY || window.pageYOffset;
    console.log(`[ScrollUtils] Сохраняем позицию скролла Account: ${scrollY}px`);
    sessionStorage.setItem(ACCOUNT_SCROLL_KEY, scrollY.toString());
  } catch (e) {
    console.error('[ScrollUtils] Ошибка при сохранении позиции скролла:', e);
  }
}

/**
 * Восстанавливает сохраненную позицию скролла страницы Account
 */
export function restoreAccountScrollPosition(): void {
  try {
    const scrollYString = sessionStorage.getItem(ACCOUNT_SCROLL_KEY);
    if (scrollYString) {
      const scrollY = parseInt(scrollYString, 10);
      console.log(`[ScrollUtils] Восстанавливаем позицию скролла Account: ${scrollY}px`);
      
      // Используем несколько попыток восстановления с разными задержками
      setTimeout(() => window.scrollTo(0, scrollY), 0);
      setTimeout(() => window.scrollTo(0, scrollY), 100);
      setTimeout(() => window.scrollTo(0, scrollY), 300);
    } else {
      console.log('[ScrollUtils] Нет сохраненной позиции скролла Account');
    }
  } catch (e) {
    console.error('[ScrollUtils] Ошибка при восстановлении позиции скролла:', e);
  }
}

/**
 * Сохраняет текущую позицию скролла для текущего пути
 * @param pathOverride Опциональный путь, если нужно сохранить позицию для другого пути
 */
export function saveScrollPosition(pathOverride?: string): void {
  // Для страницы Account используем специальную функцию
  if (window.location.pathname === '/account' || pathOverride === '/account') {
    saveAccountScrollPosition();
    return;
  }
  
  // Для других страниц не сохраняем позицию
  console.log('[ScrollUtils] Сохранение позиции скролла не требуется для этой страницы');
}

/**
 * Восстанавливает сохраненную позицию скролла для текущего пути
 */
export function restoreScrollPosition(): void {
  // Для страницы Account используем специальную функцию
  if (window.location.pathname === '/account') {
    restoreAccountScrollPosition();
    return;
  }
  
  // Для других страниц скроллим в начало
  scrollToTop(false);
}

/**
 * Прокручивает страницу наверх
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
  
  console.log('[ScrollUtils] Прокручено к началу страницы');
}

/**
 * Прокручивает заданный контейнер наверх
 * @param containerRef Ссылка на контейнер для скролла
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollContainerToTop(containerRef: React.RefObject<HTMLElement>, smooth: boolean = true): void {
  console.log('[ScrollUtils] scrollContainerToTop вызван');
  
  // Функция для прокрутки с задержкой
  const performScroll = (delay: number = 0) => {
    setTimeout(() => {
      try {
        // Сначала скроллим окно
        window.scrollTo({
          top: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
        
        // Затем скроллим контейнер, если он существует
        if (containerRef?.current) {
          containerRef.current.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
          });
          console.log(`[ScrollUtils] Контейнер и окно прокручены наверх (задержка: ${delay}мс)`);
        } else {
          console.log(`[ScrollUtils] Прокручено только окно (задержка: ${delay}мс)`);
        }
      } catch (error) {
        console.error('[ScrollUtils] Ошибка при прокрутке наверх:', error);
      }
    }, delay);
  };
  
  // Выполняем прокрутку несколько раз для надежности
  performScroll(0);
  performScroll(100);
  performScroll(300);
}

// Экспортируем функции для совместимости с существующим кодом
export function trackNavigation(): void {
  console.log('[ScrollUtils] trackNavigation - функция-заглушка');
}

export function clearScrollPosition(): void {
  console.log('[ScrollUtils] clearScrollPosition - функция-заглушка');
}

export function isNavigatingFrom(): boolean {
  return false;
}