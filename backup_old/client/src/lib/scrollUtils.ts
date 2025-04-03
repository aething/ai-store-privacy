/**
 * Полностью переработанные утилиты для управления позицией скролла и её сохранения при навигации
 * Для работы с history API, window.history.scrollRestoration и sessionStorage
 */

// Константы для ключей хранения позиций скролла
const SCROLL_POSITION_PREFIX = 'scroll-position-';

// Флаги и хранилище для отслеживания состояния системы скролла
let isScrollSystemInitialized = false;
let lastNavigationDirection = '';
let currentPageScrollTops: Record<string, number> = {};

// Определяем типы для событий
interface BeforeNavigationEvent extends Event {
  fromPath: string;
  toPath: string;
  scrollPosition: number;
}

// Собственное событие для фиксации перехода между страницами
const NAVIGATION_EVENT_NAME = 'ai-store-navigation';

/**
 * Создает и логирует сохраненные позиции скролла
 */
function logScrollPositions(): void {
  const positions: Record<string, string | null> = {};
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith(SCROLL_POSITION_PREFIX)) {
      const path = key.replace(SCROLL_POSITION_PREFIX, '');
      positions[path] = sessionStorage.getItem(key);
    }
  });
  
  console.log('[ScrollUtils] Сохраненные позиции скролла:', positions);
  console.log('[ScrollUtils] Текущие позиции:', currentPageScrollTops);
}

/**
 * Сохраняет текущую позицию скролла для текущего пути
 */
export function saveCurrentScrollPosition(): void {
  const currentPath = window.location.pathname;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  
  if (scrollY > 0) {
    try {
      sessionStorage.setItem(`${SCROLL_POSITION_PREFIX}${currentPath}`, scrollY.toString());
      currentPageScrollTops[currentPath] = scrollY;
      console.log(`[ScrollUtils] Сохранена текущая позиция скролла для ${currentPath}: ${scrollY}px`);
    } catch (e) {
      console.error('[ScrollUtils] Ошибка при сохранении позиции скролла:', e);
    }
  } else {
    console.log(`[ScrollUtils] Не сохраняем нулевую позицию для ${currentPath}`);
  }
}

/**
 * Восстанавливает сохраненную позицию скролла для текущего пути
 * @param smooth Использовать плавную анимацию при прокрутке
 */
export function restoreCurrentScrollPosition(smooth: boolean = true): boolean {
  const currentPath = window.location.pathname;
  const savedPosition = sessionStorage.getItem(`${SCROLL_POSITION_PREFIX}${currentPath}`);
  
  if (savedPosition) {
    const scrollY = parseInt(savedPosition, 10);
    
    if (scrollY > 0) {
      // Используем несколько попыток восстановления с задержками для надежности
      const scrollBehavior = smooth ? 'smooth' : 'auto';
      
      // Функция для выполнения прокрутки
      const doScroll = (delay: number = 0) => {
        setTimeout(() => {
          window.scrollTo({
            top: scrollY,
            behavior: scrollBehavior
          });
          console.log(`[ScrollUtils] Восстановлена позиция ${scrollY}px для ${currentPath} (задержка: ${delay}ms)`);
        }, delay);
      };
      
      // Прокручиваем несколько раз с разными задержками для надежности
      doScroll(0);
      doScroll(50);
      doScroll(150);
      
      return true;
    }
  }
  
  console.log(`[ScrollUtils] Нет сохраненной позиции для ${currentPath}`);
  return false;
}

/**
 * Прокручивает страницу наверх
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollToTop(smooth: boolean = true): void {
  // Функция для выполнения прокрутки
  const doScroll = (delay: number = 0) => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, delay);
  };
  
  // Прокручиваем несколько раз с разными задержками
  doScroll(0);
  doScroll(10);
  doScroll(50);
  
  console.log('[ScrollUtils] Прокручено к началу страницы');
}

/**
 * Прокручивает заданный контейнер наверх
 * @param containerRef Ссылка на контейнер для скролла
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollContainerToTop(containerRef: React.RefObject<HTMLElement>, smooth: boolean = true): void {
  if (!containerRef?.current) {
    console.log('[ScrollUtils] scrollContainerToTop: контейнер не найден');
    scrollToTop(smooth);
    return;
  }
  
  const behavior = smooth ? 'smooth' : 'auto';
  
  // Функция для выполнения прокрутки
  const doScroll = (delay: number = 0) => {
    setTimeout(() => {
      try {
        // Скроллим контейнер
        containerRef.current?.scrollTo({
          top: 0,
          behavior: behavior
        });
        
        // Также скроллим окно для случаев, когда контейнер не занимает весь экран
        window.scrollTo({
          top: 0,
          behavior: behavior
        });
      } catch (error) {
        console.error('[ScrollUtils] Ошибка при прокрутке контейнера:', error);
      }
    }, delay);
  };
  
  // Прокручиваем несколько раз с разными задержками
  doScroll(0);
  doScroll(50);
  doScroll(150);
  
  console.log('[ScrollUtils] Контейнер прокручен наверх');
}

/**
 * Сохраняет текущую позицию скролла для указанного пути
 * @param path Путь страницы
 */
export function saveScrollPositionForPath(path: string): void {
  if (!path) return;
  
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  
  if (scrollY > 0) {
    try {
      sessionStorage.setItem(`${SCROLL_POSITION_PREFIX}${path}`, scrollY.toString());
      currentPageScrollTops[path] = scrollY;
      console.log(`[ScrollUtils] Сохранена позиция ${scrollY}px для пути ${path}`);
    } catch (e) {
      console.error('[ScrollUtils] Ошибка при сохранении позиции для пути:', e);
    }
  } else {
    console.log(`[ScrollUtils] Не сохраняем нулевую позицию для ${path}`);
  }
}

/**
 * Восстанавливает позицию скролла для указанного пути
 * @param path Путь страницы
 * @param smooth Использовать плавную анимацию
 * @returns true если позиция была восстановлена, false если нет сохраненной позиции
 */
export function restoreScrollPositionForPath(path: string, smooth: boolean = true): boolean {
  if (!path) return false;
  
  const savedScrollY = sessionStorage.getItem(`${SCROLL_POSITION_PREFIX}${path}`);
  
  if (savedScrollY) {
    const scrollY = parseInt(savedScrollY, 10);
    
    if (scrollY > 0) {
      const behavior = smooth ? 'smooth' : 'auto';
      
      // Функция для выполнения прокрутки
      const doScroll = (delay: number = 0) => {
        setTimeout(() => {
          window.scrollTo({
            top: scrollY,
            behavior: behavior
          });
          
          console.log(`[ScrollUtils] Восстановлена позиция ${scrollY}px для ${path} (задержка: ${delay}ms)`);
        }, delay);
      };
      
      // Прокручиваем несколько раз с разными задержками
      doScroll(0);
      doScroll(50);
      doScroll(150);
      
      return true;
    }
  }
  
  console.log(`[ScrollUtils] Нет сохраненной позиции для ${path}`);
  return false;
}

/**
 * Инициализирует расширенную систему управления скроллом
 */
export function initScrollSystem(): void {
  if (isScrollSystemInitialized) return;
  
  console.log('[ScrollUtils] Инициализация системы управления скроллом...');
  
  try {
    // Устанавливаем ручной режим восстановления позиций скролла
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
      console.log('[ScrollUtils] История скролла установлена в ручной режим');
    }
    
    // Перехватываем все клики по ссылкам для сохранения позиции скролла
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Проверяем, является ли элемент или его родитель ссылкой
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        
        // Сохраняем текущую позицию скролла перед переходом
        if (href && href.startsWith('/') && href !== window.location.pathname) {
          saveCurrentScrollPosition();
          console.log(`[ScrollUtils] Клик по ссылке ${href}, позиция скролла сохранена`);
        }
      }
    }, true);
    
    // При любом клике по странице запоминаем текущую позицию скролла
    document.addEventListener('mousedown', (event) => {
      if (event.button === 0) { // Левая кнопка мыши
        saveCurrentScrollPosition();
      }
    }, { passive: true });
    
    // Сохраняем позицию скролла каждые 2 секунды
    const intervalId = setInterval(() => {
      saveCurrentScrollPosition();
    }, 2000);
    
    // Сохраняем позицию перед уходом со страницы
    window.addEventListener('beforeunload', () => {
      saveCurrentScrollPosition();
      clearInterval(intervalId);
    });
    
    // При переходе назад/вперед по истории браузера
    window.addEventListener('popstate', (event) => {
      // Получаем целевой путь
      const path = window.location.pathname;
      console.log(`[ScrollUtils] popstate: ${path}`);
      
      // Восстанавливаем позицию скролла для этого пути
      setTimeout(() => {
        restoreScrollPositionForPath(path, false);
      }, 100);
    });
    
    isScrollSystemInitialized = true;
    console.log('[ScrollUtils] Система управления скроллом инициализирована успешно');
    logScrollPositions();
    
  } catch (error) {
    console.error('[ScrollUtils] Ошибка при инициализации системы управления скроллом:', error);
  }
}

/**
 * Переходит на предыдущую страницу, сохраняя позицию скролла
 */
export function goBack(): void {
  saveCurrentScrollPosition();
  console.log('[ScrollUtils] Переход назад, текущая позиция сохранена');
  window.history.back();
}

// Константа для ключа позиции страницы аккаунта (для обратной совместимости)
const ACCOUNT_SCROLL_KEY = 'accountScrollPosition';

// Функции для совместимости с предыдущими версиями
export function saveAccountScrollPosition(): void {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  sessionStorage.setItem(ACCOUNT_SCROLL_KEY, scrollY.toString());
  saveScrollPositionForPath('/account');
}

export function restoreAccountScrollPosition(): void {
  // Пробуем сначала старый ключ, потом новый формат
  const oldPosition = sessionStorage.getItem(ACCOUNT_SCROLL_KEY);
  if (oldPosition) {
    const scrollY = parseInt(oldPosition, 10);
    window.scrollTo(0, scrollY);
  } else {
    restoreScrollPositionForPath('/account');
  }
}

export function saveScrollPosition(pathOverride?: string): void {
  if (pathOverride) {
    saveScrollPositionForPath(pathOverride);
  } else {
    saveCurrentScrollPosition();
  }
}

export function restoreScrollPosition(): void {
  restoreCurrentScrollPosition();
}

export function clearScrollPositionForPath(path: string): void {
  if (!path) return;
  
  try {
    sessionStorage.removeItem(`${SCROLL_POSITION_PREFIX}${path}`);
    delete currentPageScrollTops[path];
    console.log(`[ScrollUtils] Удалена позиция скролла для ${path}`);
  } catch (e) {
    console.error('[ScrollUtils] Ошибка при удалении позиции скролла:', e);
  }
}

export function clearScrollPosition(): void {
  clearScrollPositionForPath(window.location.pathname);
}

export function trackNavigation(): void {
  saveCurrentScrollPosition();
}

export function isNavigatingFrom(): boolean {
  return false; // Для совместимости со старым кодом
}

// Инициализируем систему при загрузке модуля
initScrollSystem();