/**
 * Утилиты для работы со скроллингом в приложении
 */

/**
 * Функция для надежного скроллинга страницы в начало
 * Упрощенная для предотвращения рывков при прокрутке
 */
export function scrollToTop(smoothScroll: boolean = true): void {
  // Базовая прокрутка страницы
  window.scrollTo({
    top: 0,
    behavior: smoothScroll ? 'smooth' : 'auto',
  });
  
  // Находим основной контент для прокрутки
  // Поиск основного контейнера политик, если он существует
  const policyContent = document.querySelector('.policy-content');
  if (policyContent instanceof HTMLElement) {
    policyContent.scrollTop = 0;
  }
  
  // Прокрутка скроллируемых элементов верхнего уровня только если гладкая прокрутка отключена
  // Это помогает избежать конфликтов между множественными анимациями прокрутки
  if (!smoothScroll) {
    document.querySelectorAll('.overflow-auto, .overflow-y-auto').forEach(el => {
      if (el instanceof HTMLElement) {
        el.scrollTop = 0;
      }
    });
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