/**
 * Утилиты для управления позицией скролла и ее сохранения при навигации
 * Полностью переработанная версия с надежным хранением и восстановлением позиций
 */

// Ключ для хранения позиций скролла в sessionStorage
const SCROLL_POSITIONS_KEY = 'scrollPositions';

// Ключ для хранения истории прехода между страницами
const NAVIGATION_HISTORY_KEY = 'navigationHistory';

// Класс для отслеживания и управления навигацией
class NavigationManager {
  private static instance: NavigationManager;
  private navHistory: string[] = [];
  private positions: Record<string, number> = {};
  private initialized = false;

  // Получение экземпляра синглтона
  public static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  // Приватный конструктор
  private constructor() {
    this.init();
  }

  // Инициализация менеджера
  private init(): void {
    if (this.initialized) return;
    
    try {
      // Восстанавливаем историю навигации
      const historyString = sessionStorage.getItem(NAVIGATION_HISTORY_KEY);
      if (historyString) {
        this.navHistory = JSON.parse(historyString);
      }
      
      // Восстанавливаем позиции скролла
      const positionsString = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
      if (positionsString) {
        this.positions = JSON.parse(positionsString);
      }
      
      console.log('[NavigationManager] Initialized with history:', this.navHistory);
      console.log('[NavigationManager] Initialized with positions:', this.positions);
      
      this.initialized = true;
    } catch (error) {
      console.error('[NavigationManager] Error initializing:', error);
      // В случае ошибки инициализируем пустыми данными
      this.navHistory = [];
      this.positions = {};
      this.initialized = true;
    }
  }

  // Сохранение текущего состояния в sessionStorage
  private saveState(): void {
    try {
      sessionStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(this.navHistory));
      sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(this.positions));
    } catch (error) {
      console.error('[NavigationManager] Error saving state:', error);
    }
  }

  // Добавление новой страницы в историю навигации
  public addToHistory(path: string): void {
    if (!path) return;
    
    // Проверяем, если последний путь совпадает с новым, не добавляем дубликат
    if (this.navHistory.length > 0 && this.navHistory[this.navHistory.length - 1] === path) {
      return;
    }
    
    // Добавляем путь в историю
    this.navHistory.push(path);
    
    // Ограничиваем размер истории
    if (this.navHistory.length > 10) {
      this.navHistory.shift();
    }
    
    console.log(`[NavigationManager] Added path to history: ${path}`);
    console.log(`[NavigationManager] Current history:`, this.navHistory);
    
    // Сохраняем обновленное состояние
    this.saveState();
  }

  // Получение предыдущей страницы из истории
  public getPreviousPath(): string | null {
    if (this.navHistory.length < 2) {
      return null;
    }
    return this.navHistory[this.navHistory.length - 2];
  }

  // Сохранение позиции скролла для пути
  public saveScrollPosition(path: string, position: number): void {
    if (!path) return;
    
    this.positions[path] = position;
    console.log(`[NavigationManager] Saved scroll position ${position}px for ${path}`);
    
    // Сохраняем обновленное состояние
    this.saveState();
  }

  // Получение сохраненной позиции скролла для пути
  public getScrollPosition(path: string): number | null {
    if (!path || !this.positions[path]) {
      return null;
    }
    
    return this.positions[path];
  }

  // Удаление сохраненной позиции скролла для пути
  public clearScrollPosition(path: string): void {
    if (!path || !this.positions[path]) {
      return;
    }
    
    delete this.positions[path];
    console.log(`[NavigationManager] Cleared scroll position for ${path}`);
    
    // Сохраняем обновленное состояние
    this.saveState();
  }

  // Проверка, был ли переход с указанного пути на текущий
  public isNavigationFrom(fromPath: string): boolean {
    if (this.navHistory.length < 2) {
      return false;
    }
    
    const previousPath = this.navHistory[this.navHistory.length - 2];
    return previousPath === fromPath;
  }
}

// Экземпляр менеджера навигации
const navigationManager = NavigationManager.getInstance();

/**
 * Сохраняет текущую позицию скролла для текущего пути
 * @param pathOverride Опциональный путь, если нужно сохранить позицию для другого пути
 */
export function saveScrollPosition(pathOverride?: string): void {
  const scrollY = window.scrollY || window.pageYOffset;
  const path = pathOverride || window.location.pathname;
  
  // Сохраняем позицию через менеджер навигации
  navigationManager.saveScrollPosition(path, scrollY);
}

/**
 * Восстанавливает сохраненную позицию скролла для текущего пути
 * @param options Параметры восстановления позиции
 * @param options.pathOverride Опциональный путь для восстановления
 * @param options.delay Задержка в мс перед восстановлением (по умолчанию 100)
 * @param options.defaultToTop Если true, скроллить к началу при отсутствии сохраненной позиции
 */
export function restoreScrollPosition(options: {
  pathOverride?: string, 
  delay?: number, 
  defaultToTop?: boolean
} = {}): void {
  const { 
    pathOverride, 
    delay = 100, 
    defaultToTop = true 
  } = options;
  
  const path = pathOverride || window.location.pathname;
  console.log(`[ScrollUtils] Restoring position for ${path} (delay: ${delay}ms)`);
  
  // Используем setTimeout для обеспечения корректной работы в случае, 
  // если DOM еще не полностью обновился после навигации
  setTimeout(() => {
    // Получаем сохраненную позицию через менеджер навигации
    const savedPosition = navigationManager.getScrollPosition(path);
    
    if (savedPosition !== null) {
      // Восстанавливаем позицию
      window.scrollTo({
        top: savedPosition,
        behavior: 'auto' // Мгновенный скролл, чтобы пользователь не видел промежуточных состояний
      });
      
      console.log(`[ScrollUtils] Restored scroll position to ${savedPosition}px for ${path}`);
    } else if (defaultToTop) {
      // Если нет сохраненной позиции и требуется скролл в начало
      window.scrollTo(0, 0);
      console.log(`[ScrollUtils] No saved position for ${path}, scrolled to top`);
    }
  }, delay);
}

/**
 * Удаляет сохраненную позицию скролла для текущего пути
 * @param pathOverride Опциональный путь, если нужно удалить позицию для другого пути
 */
export function clearScrollPosition(pathOverride?: string): void {
  const path = pathOverride || window.location.pathname;
  navigationManager.clearScrollPosition(path);
}

/**
 * Прокручивает страницу наверх с плавной анимацией
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
  
  // Очищаем сохраненную позицию
  clearScrollPosition();
  console.log('[ScrollUtils] Scrolled to top');
}

/**
 * Проверяет, был ли переход с указанного пути
 * @param fromPath Путь, с которого мог быть совершен переход
 */
export function isNavigatingFrom(fromPath: string): boolean {
  return navigationManager.isNavigationFrom(fromPath);
}

/**
 * Добавляет текущий путь в историю навигации
 * Вызывать при загрузке компонента страницы
 */
export function trackNavigation(): void {
  navigationManager.addToHistory(window.location.pathname);
}

/**
 * Прокручивает заданный контейнер наверх
 * @param containerRef Ссылка на контейнер для скролла
 * @param smooth Если true, использовать плавную анимацию
 */
export function scrollContainerToTop(containerRef: React.RefObject<HTMLElement>, smooth: boolean = true): void {
  console.log('[ScrollUtils] scrollContainerToTop called');
  
  // Функция для прокрутки с задержкой
  const performScroll = (delay: number = 0) => {
    setTimeout(() => {
      try {
        if (containerRef?.current) {
          // Скроллим контейнер в начало
          containerRef.current.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
          });
          
          // Также скроллим страницу в начало
          window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
          });
          
          console.log(`[ScrollUtils] Container and window scrolled to top (delay: ${delay}ms)`);
        } else {
          // Если контейнер не найден, скроллим только страницу
          window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
          });
          
          console.log(`[ScrollUtils] Only window scrolled to top (delay: ${delay}ms)`);
        }
      } catch (error) {
        console.error('[ScrollUtils] Error scrolling container to top:', error);
        
        // В случае ошибки пытаемся скроллить только окно
        window.scrollTo({
          top: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }, delay);
  };
  
  // Выполняем скролл несколько раз с разными задержками
  // для обеспечения надежности работы функции
  performScroll(0);   // Немедленно
  performScroll(100); // Через 100мс
  performScroll(300); // Через 300мс
}

// Инициализация - добавляем текущую страницу в историю навигации
trackNavigation();