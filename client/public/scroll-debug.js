/**
 * Скрипт для диагностики и отладки проблем со скроллингом
 * Этот скрипт отслеживает изменения URL и позиции скролла, а также перехватывает
 * события прокрутки и навигации для диагностики проблем
 */

(function() {
  // Флаг для включения/выключения логирования
  const DEBUG = true;
  
  // Хранит последние несколько событий для анализа
  const eventLog = [];
  const MAX_LOG_SIZE = 50;
  
  // Хранит информацию о текущем и предыдущем URL
  let currentUrl = window.location.pathname;
  let previousUrl = null;
  
  // Хранит информацию о позиции скролла
  let scrollPositions = {};
  
  // Логирует событие с временной меткой
  function logEvent(type, details) {
    if (!DEBUG) return;
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const event = {
      timestamp,
      type,
      url: window.location.pathname,
      scrollY: window.scrollY,
      details
    };
    
    eventLog.unshift(event);
    if (eventLog.length > MAX_LOG_SIZE) {
      eventLog.pop();
    }
    
    console.log(`[ScrollDebug] ${timestamp} | ${type} | ${window.location.pathname} | scrollY: ${window.scrollY}`, details);
  }
  
  // Отображает текущий журнал событий в консоли
  window.showScrollDebugLog = function() {
    console.log('%c === Журнал событий скроллинга === ', 'background: #222; color: #bada55; font-size: 16px;');
    eventLog.forEach((event, index) => {
      console.log(`${index}. ${event.timestamp} | ${event.type} | ${event.url} | scrollY: ${event.scrollY}`, event.details);
    });
    console.log('%c ================================== ', 'background: #222; color: #bada55; font-size: 16px;');
  };
  
  // Отслеживает изменения URL
  function checkUrlChange() {
    const newUrl = window.location.pathname;
    if (newUrl !== currentUrl) {
      previousUrl = currentUrl;
      currentUrl = newUrl;
      logEvent('URL_CHANGE', { from: previousUrl, to: currentUrl });
      
      // Запускаем серию проверок после изменения URL
      setTimeout(checkScrollAfterNavigation, 10);
      setTimeout(checkScrollAfterNavigation, 100);
      setTimeout(checkScrollAfterNavigation, 300);
      setTimeout(checkScrollAfterNavigation, 500);
      setTimeout(checkScrollAfterNavigation, 1000);
      
      // Сохраняем позицию скролла для предыдущей страницы
      if (previousUrl) {
        scrollPositions[previousUrl] = window.scrollY;
      }
    }
  }
  
  // Проверяет позицию скролла после навигации
  function checkScrollAfterNavigation() {
    const scrollY = window.scrollY;
    logEvent('SCROLL_CHECK', { scrollY });
    
    // Анализируем состояние для определенных путей
    if (currentUrl.startsWith('/policy/')) {
      if (scrollY > 10) {
        logEvent('SCROLL_ISSUE', { 
          message: 'Страница Policy не прокручена в начало!',
          currentUrl,
          scrollY
        });
      } else {
        logEvent('SCROLL_OK', { 
          message: 'Страница Policy правильно прокручена в начало',
          currentUrl,
          scrollY
        });
      }
    }
  }
  
  // Перехватывает события скролла
  function handleScroll() {
    // Ограничиваем частоту логирования скролла для производительности
    if (!handleScroll.throttled) {
      handleScroll.throttled = true;
      setTimeout(() => {
        logEvent('SCROLL', { y: window.scrollY });
        handleScroll.throttled = false;
      }, 100);
    }
  }
  
  // Принудительно прокручивает страницу наверх
  window.forceScrollTopDebug = function() {
    logEvent('FORCE_SCROLL_TOP', { before: window.scrollY });
    
    // Применяем разные методы прокрутки
    window.scrollTo(0, 0);
    
    // Поиск контейнеров скролла и их прокрутка
    const scrollContainers = [
      document.querySelector('#policy-root div.overflow-auto'),
      document.querySelector('#app main'),
      ...Array.from(document.querySelectorAll('.overflow-auto'))
    ].filter(el => el);
    
    scrollContainers.forEach(container => {
      if (container) {
        container.scrollTop = 0;
        logEvent('SCROLL_CONTAINER', { 
          element: container.tagName + (container.id ? `#${container.id}` : ''), 
          scrollTop: container.scrollTop 
        });
      }
    });
    
    setTimeout(() => {
      logEvent('FORCE_SCROLL_TOP_AFTER', { after: window.scrollY });
    }, 50);
  };
  
  // Анализирует DOM для поиска потенциальных проблем
  window.analyzeDOMForScrollIssues = function() {
    const results = {
      bodyHeight: document.body.clientHeight,
      windowHeight: window.innerHeight,
      scrollY: window.scrollY,
      scrollableElements: []
    };
    
    // Поиск всех скроллируемых элементов
    const scrollableElementSelectors = [
      'div.overflow-auto', 
      'div.overflow-y-auto',
      '[style*="overflow"]'
    ];
    
    scrollableElementSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        results.scrollableElements.push({
          selector: getElementPath(el),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          scrollTop: el.scrollTop,
          overflow: getComputedStyle(el).overflow,
          position: getComputedStyle(el).position
        });
      });
    });
    
    console.log('%c === Анализ DOM для скроллинга === ', 'background: #222; color: #bada55; font-size: 16px;');
    console.log(results);
    console.log('%c ================================== ', 'background: #222; color: #bada55; font-size: 16px;');
    
    return results;
  };
  
  // Служебная функция для получения пути к элементу в DOM
  function getElementPath(el) {
    if (!el) return 'null';
    let path = '';
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += `#${el.id}`;
      } else {
        const sib = el.parentNode?.children;
        if (sib) {
          let sibCount = 0;
          for (let i = 0; i < sib.length; i++) {
            if (sib[i].nodeName.toLowerCase() === selector) sibCount++;
            if (sib[i] === el) {
              selector += `:nth-of-type(${sibCount})`;
              break;
            }
          }
        }
      }
      path = selector + (path ? ' > ' + path : '');
      el = el.parentNode;
      
      // Ограничиваем глубину пути для читаемости
      if (path.length > 100) {
        path = '... > ' + path.slice(-100);
        break;
      }
    }
    return path;
  }

  // Проверяет страницу Policy на проблемы со скроллом
  window.checkPolicyPageScroll = function() {
    // Сохраняем текущий URL и позицию
    const currentURL = window.location.pathname;
    const currentScrollY = window.scrollY;
    
    // Проверяем, находимся ли мы на странице Policy
    if (currentURL.startsWith('/policy/')) {
      logEvent('POLICY_PAGE_CHECK', { url: currentURL, scrollY: currentScrollY });
      
      // Если страница прокручена, выводим предупреждение
      if (currentScrollY > 10) {
        console.error(`%c!!! ПРОБЛЕМА СКРОЛЛА !!! Policy страница открылась с прокруткой ${currentScrollY}px`, 
          'background: red; color: white; font-size: 16px;');
        return {
          status: 'ERROR',
          message: `Страница Policy открылась с прокруткой ${currentScrollY}px`,
          url: currentURL
        };
      } else {
        console.log(`%c✓ СКРОЛЛ В ПОРЯДКЕ. Policy страница открылась без прокрутки (${currentScrollY}px)`, 
          'background: green; color: white; font-size: 16px;');
        return {
          status: 'OK',
          message: `Страница Policy открылась без прокрутки (${currentScrollY}px)`,
          url: currentURL
        };
      }
    } else {
      return {
        status: 'SKIPPED',
        message: 'Текущая страница не является страницей Policy',
        url: currentURL
      };
    }
  };
  
  // Запускаем проверку URL каждые 100мс
  setInterval(checkUrlChange, 100);
  
  // Устанавливаем обработчики событий
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('popstate', () => logEvent('POPSTATE', { url: window.location.pathname }));
  
  // Перехватываем стандартные функции навигации
  const originalPushState = history.pushState;
  history.pushState = function() {
    logEvent('PUSHSTATE', { arguments });
    return originalPushState.apply(this, arguments);
  };
  
  const originalReplaceState = history.replaceState;
  history.replaceState = function() {
    logEvent('REPLACESTATE', { arguments });
    return originalReplaceState.apply(this, arguments);
  };
  
  // Инициализация скрипта
  logEvent('SCRIPT_INIT', { url: window.location.pathname, scrollY: window.scrollY });
  
  // Выводим инструкции по использованию в консоль
  console.log('%c === Скрипт отладки скроллинга активирован === ', 'background: #222; color: #bada55; font-size: 16px;');
  console.log(`
    Доступные команды:
    - showScrollDebugLog() - показать журнал событий скроллинга
    - forceScrollTopDebug() - принудительно прокрутить страницу наверх
    - analyzeDOMForScrollIssues() - анализировать DOM на наличие проблем со скроллом
    - checkPolicyPageScroll() - проверить скролл на странице Policy
  `);
  console.log('%c ===================================== ', 'background: #222; color: #bada55; font-size: 16px;');
})();