/**
 * Утилиты для управления позицией скролла и ее сохранения при навигации
 */

const STORAGE_KEY = 'scrollPositions';

/**
 * Сохраняет текущую позицию скролла в sessionStorage
 */
export function saveScrollPosition(): void {
  // Сохраняем текущую позицию скролла
  const scrollY = window.scrollY || window.pageYOffset;
  
  // В sessionStorage храним объект с позициями для разных путей
  try {
    // Получаем текущие сохраненные позиции или создаем новый объект
    const positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    
    // Текущий путь используем как ключ
    const currentPath = window.location.pathname;
    
    // Сохраняем позицию скролла для текущего пути
    positions[currentPath] = scrollY;
    
    // Обновляем хранилище
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    
    // Для отладки
    console.log(`Scroll position ${scrollY}px saved for ${currentPath}`);
  } catch (error) {
    console.error('Error saving scroll position:', error);
  }
}

/**
 * Восстанавливает сохраненную позицию скролла из sessionStorage
 */
export function restoreScrollPosition(): void {
  // Отложенное восстановление положения скролла
  // Нужна задержка, чтобы DOM успел обновиться
  setTimeout(() => {
    try {
      // Получаем сохраненные позиции
      const positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      
      // Получаем текущий путь
      const currentPath = window.location.pathname;
      
      // Проверяем, есть ли сохраненная позиция для текущего пути
      if (positions[currentPath] !== undefined) {
        // Восстанавливаем позицию скролла
        window.scrollTo({
          top: positions[currentPath],
          behavior: 'auto' // Мгновенно без анимации
        });
        
        // Для отладки
        console.log(`Scroll position restored to ${positions[currentPath]}px for ${currentPath}`);
      } else {
        // Если нет сохраненной позиции, скроллим к началу
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error restoring scroll position:', error);
      // В случае ошибки просто скроллим к началу
      window.scrollTo(0, 0);
    }
  }, 100);
}

/**
 * Удаляет сохраненную позицию скролла для текущего пути
 */
export function clearScrollPosition(): void {
  try {
    // Получаем сохраненные позиции
    const positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    
    // Получаем текущий путь
    const currentPath = window.location.pathname;
    
    // Удаляем позицию скролла для текущего пути
    if (positions[currentPath] !== undefined) {
      delete positions[currentPath];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      console.log(`Scroll position cleared for ${currentPath}`);
    }
  } catch (error) {
    console.error('Error clearing scroll position:', error);
  }
}

/**
 * Прокручивает страницу наверх с плавной анимацией
 */
export function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  // Также очищаем сохраненную позицию для текущего пути
  clearScrollPosition();
  console.log('Scrolled to top');
}

/**
 * Прокручивает заданный контейнер наверх
 * @param containerRef Ссылка на контейнер для скролла
 */
export function scrollContainerToTop(containerRef: React.RefObject<HTMLElement>): void {
  console.log('scrollContainerToTop called');
  
  // Особая обработка для страницы Policy
  // Проверяем URL пути - если это Policy страница, используем пользовательский подход
  if (window.location.pathname.includes('/policy/')) {
    console.log('Policy page detected, using specialized scroll approach');
    
    // Особая функция для страниц политик
    const scrollPolicyPageToTop = () => {
      // 1. Скроллим глобальное окно в начало
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // 2. Если есть сохраненный якорь, скроллим к нему
      if ((window as any).policyTopAnchor) {
        console.log('Using policy top anchor for scrolling');
        (window as any).policyTopAnchor.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      // 3. Если есть контейнер, скроллим его
      if (containerRef?.current) {
        try {
          containerRef.current.scrollTop = 0;
          console.log('Policy content container scrolled to top');
        } catch (e) {
          console.log('Error scrolling policy container:', e);
        }
      }
    };
    
    // Выполняем немедленно и с задержкой для надежности
    scrollPolicyPageToTop();
    setTimeout(scrollPolicyPageToTop, 100);
    return;
  }
  
  // Стандартная обработка для других страниц
  if (!containerRef.current) {
    console.warn('Container ref is not available for scrolling');
    return;
  }
  
  try {
    // Скроллим контейнер в начало
    containerRef.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Также скроллим всю страницу вверх для мобильных устройств
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    console.log('Container scrolled to top');
  } catch (error) {
    console.error('Error scrolling container to top:', error);
    
    // В случае ошибки пытаемся скроллить окно
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}