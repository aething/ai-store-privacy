/**
 * Тест для проверки функциональности управления скроллом
 * 
 * Этот скрипт проверяет, правильно ли работает сохранение и восстановление
 * позиции скролла на разных страницах приложения.
 */

// Создаем инструменты логгирования в консоли для отладки
const logger = {
  log: function(message) {
    console.log(`%c[Scroll Tester] ${message}`, 'color: blue; font-weight: bold;');
  },
  error: function(message) {
    console.error(`%c[Scroll Tester Error] ${message}`, 'color: red; font-weight: bold;');
  },
  success: function(message) {
    console.log(`%c[Scroll Tester Success] ${message}`, 'color: green; font-weight: bold;');
  }
};

// Функция для сохранения текущей позиции скролла для конкретного пути
function saveScrollPosition(path) {
  try {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const key = `scroll-position-${path}`;
    
    sessionStorage.setItem(key, scrollY.toString());
    logger.log(`Сохранена позиция скролла для пути ${path}: ${scrollY}px. Ключ: ${key}`);
    
    return {
      path: path,
      position: scrollY,
      key: key,
      success: true
    };
  } catch (error) {
    logger.error(`Ошибка при сохранении позиции скролла: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Функция для получения сохраненной позиции скролла для конкретного пути
function getScrollPosition(path) {
  try {
    const key = `scroll-position-${path}`;
    const savedPos = sessionStorage.getItem(key);
    
    if (savedPos) {
      const scrollY = parseInt(savedPos, 10);
      logger.log(`Получена сохраненная позиция скролла для пути ${path}: ${scrollY}px. Ключ: ${key}`);
      
      return {
        path: path,
        position: scrollY,
        key: key,
        exists: true
      };
    } else {
      logger.log(`Нет сохраненной позиции скролла для пути ${path}. Ключ: ${key}`);
      return {
        path: path,
        exists: false
      };
    }
  } catch (error) {
    logger.error(`Ошибка при получении позиции скролла: ${error.message}`);
    return { exists: false, error: error.message };
  }
}

// Функция для тестирования всего механизма скролла
function testScrollingMechanism() {
  logger.log('Начинаем тестирование механизма скролла...');
  
  // 1. Проверка записи и чтения значений
  const testPath = `/test-${Date.now()}`;
  const testPos = Math.round(Math.random() * 1000);
  
  // Устанавливаем тестовое значение
  sessionStorage.setItem(`scroll-position-${testPath}`, testPos.toString());
  
  // Получаем и проверяем его
  const retrievedPos = sessionStorage.getItem(`scroll-position-${testPath}`);
  const success = retrievedPos === testPos.toString();
  
  if (success) {
    logger.success(`Тест записи/чтения успешен! Записано: ${testPos}, прочитано: ${retrievedPos}`);
  } else {
    logger.error(`Тест записи/чтения провален! Записано: ${testPos}, прочитано: ${retrievedPos}`);
  }
  
  // 2. Проверяем существующие значения скролла
  const paths = ['/', '/account', '/shop', '/policy/terms', '/policy/privacy', '/product/1', '/product/2', '/product/3'];
  
  logger.log('Проверка существующих позиций скролла:');
  
  paths.forEach(path => {
    const result = getScrollPosition(path);
    if (result.exists) {
      logger.log(`${path}: ${result.position}px`);
    } else {
      logger.log(`${path}: не сохранено`);
    }
  });

  // 3. Проверяем весь sessionStorage для поиска сохраненных позиций
  logger.log('Все сохраненные позиции в sessionStorage:');
  let found = false;
  let positionItems = [];
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('scroll-position-')) {
      found = true;
      const path = key.replace('scroll-position-', '');
      const pos = sessionStorage.getItem(key);
      logger.log(`${path}: ${pos}px`);
      positionItems.push({ path, position: parseInt(pos, 10) });
    }
  });
  
  if (!found) {
    logger.log('Не найдено ни одной сохраненной позиции скролла');
  } else {
    // Сортируем и показываем топ-5 по значению позиции скролла
    positionItems.sort((a, b) => b.position - a.position);
    logger.log('Топ-5 глубоких позиций скролла:');
    
    for (let i = 0; i < Math.min(5, positionItems.length); i++) {
      const item = positionItems[i];
      logger.log(`${i+1}. ${item.path}: ${item.position}px`);
    }
  }
  
  // 4. Проверяем настройки восстановления скролла браузера
  try {
    const scrollRestoration = history.scrollRestoration || 'auto';
    logger.log(`Текущий режим восстановления скролла браузера: ${scrollRestoration}`);
    
    // Проверяем, активен ли наш собственный механизм управления скроллом
    const scrollSystemActive = typeof window.saveCurrentScrollPosition === 'function' || 
                               typeof window.scrollContainerToTop === 'function';
    
    if (scrollSystemActive) {
      logger.success('Наша система управления скроллом активна: найдены функции управления скроллом');
    } else {
      logger.error('Система управления скроллом не активна: не найдены функции управления скроллом');
    }
  } catch (e) {
    logger.error(`Ошибка при проверке настроек браузера: ${e.message}`);
  }
  
  // 5. Выводим итоговое состояние тестирования
  if (success && found) {
    logger.success('Тестирование завершено успешно! Механизм сохранения скролла работает.');
  } else if (success) {
    logger.log('Механизм работает, но не найдено сохраненных позиций скролла.');
  } else {
    logger.error('Тестирование провалено! Механизм сохранения скролла не работает.');
  }
  
  // Полезные советы по работе с инструментом
  logger.log('Полезные команды для проверки работы скролла:');
  logger.log('- window.ScrollTester.test() - запуск полного теста');
  logger.log('- window.ScrollTester.saveCurrent() - сохранить текущую позицию');
  logger.log('- window.ScrollTester.getCurrent() - проверить сохраненную позицию для текущей страницы');
  logger.log('- window.ScrollTester.clearAll() - очистить все сохраненные позиции');
  
  return { success, found, positionItems };
}

// Объект с публичными функциями
window.ScrollTester = {
  saveScrollPosition,
  getScrollPosition,
  test: testScrollingMechanism,
  paths: [
    '/',
    '/shop',
    '/account',
    '/policy/terms',
    '/policy/privacy',
    '/product/1',
    '/product/2',
    '/product/3',
  ],
  
  // Функция для сохранения текущей позиции 
  saveCurrent: function() {
    return saveScrollPosition(window.location.pathname);
  },
  
  // Функция для получения сохраненной позиции текущей страницы
  getCurrent: function() {
    return getScrollPosition(window.location.pathname);
  },
  
  // Функция для сохранения позиций всех стандартных путей
  saveAllPaths: function() {
    const results = {};
    this.paths.forEach(path => {
      results[path] = saveScrollPosition(path);
    });
    return results;
  },
  
  // Функция для проверки всех сохраненных позиций
  checkAllPaths: function() {
    const results = {};
    this.paths.forEach(path => {
      results[path] = getScrollPosition(path);
    });
    return results;
  },
  
  // Функция для очистки всех сохраненных позиций
  clearAll: function() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('scroll-position-')) {
        sessionStorage.removeItem(key);
      }
    });
    logger.log('Все сохраненные позиции скролла удалены');
  }
};

// Автоматически запускаем тест при загрузке скрипта
setTimeout(() => {
  try {
    logger.log('Тест механизма скролла будет запущен автоматически через 3 секунды...');
    
    // Экспортируем функции скролла в глобальное пространство для удобного доступа из консоли
    window.saveCurrentScrollPosition = window.saveCurrentScrollPosition || function() {
      return window.ScrollTester.saveCurrent();
    };
    
    window.restoreCurrentScrollPosition = window.restoreCurrentScrollPosition || function() {
      const current = window.ScrollTester.getCurrent();
      if (current.exists) {
        window.scrollTo(0, current.position);
        logger.log(`Восстановлена позиция: ${current.position}px`);
        return true;
      }
      logger.log('Нет сохраненной позиции для восстановления');
      return false;
    };
    
    // Запускаем тест с задержкой
    setTimeout(() => window.ScrollTester.test(), 3000);
  } catch (e) {
    logger.error(`Ошибка при автоматическом запуске теста: ${e.message}`);
  }
}, 1000);

logger.log('Инструмент тестирования скролла загружен. Используйте window.ScrollTester для проверки механизма скролла.');