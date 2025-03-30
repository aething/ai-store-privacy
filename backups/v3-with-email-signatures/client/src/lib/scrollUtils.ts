/**
 * Утилиты для работы со скроллингом в приложении
 */

/**
 * Функция для надежного скроллинга страницы в начало
 * Использует несколько методов для обеспечения работы на разных устройствах
 */
export function scrollToTop(smoothScroll: boolean = true): void {
  // Базовая прокрутка страницы
  window.scrollTo({
    top: 0,
    behavior: smoothScroll ? 'smooth' : 'auto',
  });
  
  // Поиск и прокрутка якорей на странице
  const topAnchors = [
    'content-top',
    'policy-page-top',
    'policy-root',
  ];
  
  for (const anchorId of topAnchors) {
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({
        behavior: smoothScroll ? 'smooth' : 'auto',
        block: 'start'
      });
      break; // Прерываем цикл после нахождения первого якоря
    }
  }
  
  // Прокрутка всех скроллируемых элементов
  document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-scroll, .overflow-y-scroll').forEach(el => {
    if (el instanceof HTMLElement) {
      el.scrollTop = 0;
    }
  });
  
  // Для улучшения отзывчивости на устройствах с медленной загрузкой, 
  // добавляем отложенную прокрутку с небольшой задержкой
  if (!smoothScroll) {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
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