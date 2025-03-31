/**
 * Утилиты для работы со скроллингом в приложении
 */

/**
 * Функция для надежного скроллинга страницы в начало
 */
export function scrollToTop(smoothScroll: boolean = true): void {
  // Простая базовая прокрутка страницы без анимации
  window.scrollTo(0, 0);
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