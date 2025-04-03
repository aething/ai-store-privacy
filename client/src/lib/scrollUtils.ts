/**
 * Упрощенные утилиты для скроллинга
 * Все сложные механизмы сохранения и восстановления позиции прокрутки были удалены
 * в пользу простых, надежных функций
 */

/**
 * Прокручивает страницу наверх
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

/**
 * Прокручивает страницу к указанному элементу
 * @param elementId ID элемента, к которому нужно прокрутить
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollToElement(elementId: string, smooth: boolean = true): boolean {
  const element = document.getElementById(elementId);
  
  if (element) {
    element.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'start'
    });
    return true;
  }
  
  return false;
}

/**
 * Прокручивает к разделу политик на странице Account
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollToAccountPoliciesSection(smooth: boolean = true): void {
  scrollToElement('policies-section', smooth);
}

/**
 * Отключает автоматическое восстановление позиции прокрутки браузером
 */
export function disableAutoScrollRestoration(): void {
  try {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  } catch (error) {
    console.error('Не удалось отключить автоматическое восстановление позиции прокрутки:', error);
  }
}

/**
 * Возвращает автоматическое восстановление позиции прокрутки браузером к значению по умолчанию
 */
export function enableAutoScrollRestoration(): void {
  try {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  } catch (error) {
    console.error('Не удалось включить автоматическое восстановление позиции прокрутки:', error);
  }
}

// Для обратной совместимости с существующим кодом
export function saveScrollPosition(): void {}
export function restoreScrollPosition(): void {}
export function saveCurrentScrollPosition(): void {}
export function restoreCurrentScrollPosition(): boolean { return false; }
export function saveScrollPositionForPath(): void {}
export function restoreScrollPositionForPath(): boolean { return false; }
export function clearScrollPosition(): void {}
export function clearScrollPositionForPath(): void {}
export function trackNavigation(): void {}
export function isNavigatingFrom(): boolean { return false; }
export function saveAccountScrollPosition(): void {}
export function restoreAccountScrollPosition(): void {}
export function initScrollSystem(): void {
  disableAutoScrollRestoration();
}