/**
 * Утилиты для работы со скроллингом в приложении
 */

// Хранилище для позиции скролла
let lastScrollPosition = 0;

/**
 * Сохраняет текущую позицию скролла
 */
export function saveScrollPosition(): void {
  lastScrollPosition = window.scrollY || document.documentElement.scrollTop;
}

/**
 * Восстанавливает сохраненную позицию скролла
 */
export function restoreScrollPosition(): void {
  window.scrollTo(0, lastScrollPosition);
}

/**
 * Функция для надежного скроллинга страницы в начало
 * @param smoothScroll - использовать плавную анимацию
 * @param multiple - выполнить скроллинг несколько раз с задержкой (для борьбы с багами)
 */
export function scrollToTop(smoothScroll: boolean = true, multiple: boolean = true): void {
  const scrollOptions = smoothScroll ? { top: 0, behavior: 'smooth' as ScrollBehavior } : { top: 0 };
  
  // Базовая прокрутка страницы
  window.scrollTo(scrollOptions);
  
  // Для большей надежности (некоторые устройства/браузеры имеют проблемы со скроллингом)
  if (multiple) {
    setTimeout(() => {
      window.scrollTo(scrollOptions);
    }, 50);
    
    // Еще одна попытка через 150ms
    setTimeout(() => {
      window.scrollTo(scrollOptions);
    }, 150);
  }
}

/**
 * Функция для прокрутки страницы к определенному элементу
 */
export function scrollToElement(elementId: string, smoothScroll: boolean = true): boolean {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: smoothScroll ? 'smooth' : 'auto',
      block: 'start'
    });
    return true;
  }
  return false;
}