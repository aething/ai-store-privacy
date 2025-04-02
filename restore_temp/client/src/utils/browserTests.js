/**
 * Тесты для проверки новой системы управления скроллом и навигацией
 * Эти функции можно запускать в консоли браузера для проверки
 */

/**
 * Тест 1: Проверка восстановления позиции скролла при возврате из страницы Policy
 * Шаги:
 * 1. Прокрутить страницу Account до раздела Policy
 * 2. Сохранить текущую позицию скролла
 * 3. Открыть любую политику
 * 4. Вернуться обратно на страницу Account
 * 5. Проверить, что позиция скролла восстановлена
 */
function testScrollPositionRestoration() {
  console.log('=== ТЕСТ ВОССТАНОВЛЕНИЯ ПОЗИЦИИ СКРОЛЛА ===');
  
  // Проверяем, находимся ли мы на странице Account
  if (!window.location.pathname.includes('/account')) {
    console.error('Этот тест должен запускаться на странице Account');
    return;
  }
  
  // Запрашиваем доступ к навигационному менеджеру
  const getNM = () => {
    // Доступ к внутреннему менеджеру навигации через глобальное пространство имен
    try {
      return window.__debug_navigation_manager = 
        window.__debug_navigation_manager || 
        (window.__NAVIGATION_MANAGER_DEBUG__ = true,
         Object.values(require('@/lib/scrollUtils')), 
         window.NavigationManager?.getInstance());
    } catch (e) {
      console.error('Не удалось получить доступ к менеджеру навигации', e);
      return null;
    }
  };
  
  // Получаем менеджер навигации для отладки
  const nm = getNM();
  if (nm) {
    console.log('Текущее состояние менеджера навигации:', {
      history: nm.getPreviousPath ? ('История доступна: ' + (nm.getPreviousPath() || 'пусто')) : 'История недоступна',
      position: nm.getScrollPosition ? ('Позиция скролла: ' + (nm.getScrollPosition(window.location.pathname) || 'не сохранена')) : 'Позиция недоступна'
    });
  } else {
    console.warn('Менеджер навигации недоступен, будем отслеживать только конечный результат');
  }
  
  // Запоминаем начальную позицию страницы
  const initialScrollY = window.scrollY;
  console.log(`Начальная позиция скролла: ${initialScrollY}px`);
  
  // Прокручиваем страницу до раздела политик 
  // Находим заголовок раздела политик для более точного скролла
  const policiesHeader = Array.from(document.querySelectorAll('h2')).find(
    h => h.textContent && h.textContent.includes('Policies')
  );
  
  let targetScrollY = 1000; // По умолчанию скроллим на 1000px вниз
  
  // Если нашли заголовок, скроллим к нему
  if (policiesHeader) {
    const headerRect = policiesHeader.getBoundingClientRect();
    targetScrollY = window.scrollY + headerRect.top - 100; // 100px отступ сверху
    console.log(`Найден заголовок раздела политик на позиции ${targetScrollY}px`);
  } else {
    console.log(`Заголовок раздела политик не найден, используем позицию по умолчанию ${targetScrollY}px`);
  }
  
  // Прокручиваем страницу до выбранной позиции
  window.scrollTo({
    top: targetScrollY,
    behavior: 'auto'
  });
  
  // Ждем 500мс, чтобы скролл завершился
  setTimeout(() => {
    const scrolledPosition = window.scrollY;
    console.log(`Прокрученная позиция: ${scrolledPosition}px`);
    
    // Сохраняем позицию в глобальной переменной для последующей проверки
    window._testScrollPosition = scrolledPosition;
    
    // Находим ссылку на Privacy Policy
    const policyLink = Array.from(document.querySelectorAll('a, button')).find(
      el => el.textContent && el.textContent.includes('Privacy Policy')
    );
    
    if (!policyLink) {
      console.error('Не найдена ссылка на Privacy Policy');
      return;
    }
    
    console.log(`Переходим на страницу политики: ${policyLink.textContent}`);
    
    // Задержка перед кликом для гарантии сохранения позиции
    setTimeout(() => {
      policyLink.click();
      
      // Проверяем, что мы перешли на страницу Policy
      setTimeout(() => {
        if (!window.location.pathname.includes('/policy/')) {
          console.error('Не удалось перейти на страницу политики');
          return;
        }
        
        console.log('Успешно перешли на страницу политики');
        
        // Информация о текущем состоянии менеджера навигации
        const nm = getNM();
        if (nm) {
          console.log('Текущее состояние менеджера навигации (на странице политики):', {
            previousPath: nm.getPreviousPath ? nm.getPreviousPath() : 'недоступно',
            accountPosition: nm.getScrollPosition ? nm.getScrollPosition('/account') : 'недоступно'
          });
        }
        
        // Находим кнопку "Закрыть" и возвращаемся обратно
        setTimeout(() => {
          const closeButton = document.querySelector('button[aria-label="Close"]');
          if (!closeButton) {
            console.error('Не найдена кнопка закрытия');
            return;
          }
          
          console.log('Возвращаемся на страницу Account');
          closeButton.click();
          
          // Проверяем, вернулись ли мы на страницу Account и проверяем позицию скролла
          setTimeout(() => {
            if (!window.location.pathname.includes('/account')) {
              console.error('Не удалось вернуться на страницу Account');
              return;
            }
            
            console.log('Успешно вернулись на страницу Account');
            
            // Даем дополнительное время на восстановление позиции скролла
            setTimeout(() => {
              // Проверяем, восстановилась ли позиция скролла
              const currentPosition = window.scrollY;
              const savedPosition = window._testScrollPosition;
              
              console.log(`Текущая позиция: ${currentPosition}px`);
              console.log(`Ожидаемая позиция: ${savedPosition}px`);
              
              // Информация о текущем состоянии менеджера навигации после возврата
              const nm = getNM();
              if (nm) {
                console.log('Состояние менеджера навигации после возврата:', {
                  previousPath: nm.getPreviousPath ? nm.getPreviousPath() : 'недоступно',
                  accountPosition: nm.getScrollPosition ? nm.getScrollPosition('/account') : 'недоступно'
                });
              }
              
              // Допустимая погрешность - 100px
              if (Math.abs(currentPosition - savedPosition) < 100) {
                console.log('✅ ТЕСТ ПРОЙДЕН: Позиция скролла успешно восстановлена');
              } else {
                console.error('❌ ТЕСТ ПРОВАЛЕН: Позиция скролла не восстановлена');
                console.error(`Разница: ${Math.abs(currentPosition - savedPosition)}px`);
              }
            }, 500);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 500);
  }, 500);
}

/**
 * Тест 2: Проверка работы кнопки "Back to Top" на странице Policy
 * Шаги:
 * 1. Открыть страницу с политикой (Privacy Policy)
 * 2. Прокрутить страницу до конца
 * 3. Нажать кнопку "Back to Top"
 * 4. Проверить, что страница прокручена в начало
 */
function testBackToTopButton() {
  console.log('=== ТЕСТ КНОПКИ "BACK TO TOP" ===');
  
  // Проверяем, находимся ли мы на странице Policy
  if (!window.location.pathname.includes('/policy/')) {
    console.error('Этот тест должен запускаться на странице Policy');
    return;
  }
  
  // Запоминаем начальную позицию
  const initialScrollY = window.scrollY;
  console.log(`Начальная позиция скролла: ${initialScrollY}px`);
  
  // Прокручиваем страницу до конца (используем контент-контейнер, если доступен)
  const contentContainer = document.querySelector('.overflow-auto');
  let scrollTarget, scrollMethod;
  
  if (contentContainer && contentContainer.scrollHeight > contentContainer.clientHeight) {
    scrollTarget = contentContainer;
    scrollMethod = () => {
      contentContainer.scrollTo({
        top: contentContainer.scrollHeight,
        behavior: 'auto'
      });
    };
    console.log('Используем прокрутку контент-контейнера');
  } else {
    scrollTarget = window;
    scrollMethod = () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'auto'
      });
    };
    console.log('Используем прокрутку окна');
  }
  
  // Выполняем прокрутку
  scrollMethod();
  
  // Ждем 500мс, чтобы скролл завершился
  setTimeout(() => {
    const scrolledPosition = scrollTarget === window 
      ? window.scrollY 
      : contentContainer.scrollTop;
    
    console.log(`Прокрученная позиция: ${scrolledPosition}px`);
    
    // Проверяем, что контейнер действительно прокрутился
    const initialPosition = scrollTarget === window 
      ? initialScrollY 
      : 0;
    
    if (scrolledPosition <= initialPosition) {
      console.error('Контейнер не прокрутился вниз');
      return;
    }
    
    // Находим кнопку "Back to Top"
    const backToTopButton = Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent && (
        btn.textContent.includes('Back to Top') || 
        btn.querySelector('svg[data-lucide="arrow-up"]')
      )
    );
    
    if (!backToTopButton) {
      console.error('Не найдена кнопка "Back to Top"');
      return;
    }
    
    console.log('Нажимаем кнопку "Back to Top"');
    
    // Кликаем по кнопке
    backToTopButton.click();
    
    // Проверяем, прокрутилась ли страница в начало
    setTimeout(() => {
      const finalPosition = scrollTarget === window 
        ? window.scrollY 
        : contentContainer.scrollTop;
      
      console.log(`Конечная позиция: ${finalPosition}px`);
      
      if (finalPosition < 50) {
        console.log('✅ ТЕСТ ПРОЙДЕН: Контейнер успешно прокручен в начало');
      } else {
        console.error('❌ ТЕСТ ПРОВАЛЕН: Контейнер не прокручен в начало');
        console.error(`Конечная позиция: ${finalPosition}px`);
      }
    }, 1000);
  }, 500);
}

/**
 * Тест 3: Проверка сохранения истории навигации
 * Шаги:
 * 1. Перейти между несколькими страницами
 * 2. Проверить, что история навигации корректно сохраняется
 */
function testNavigationHistory() {
  console.log('=== ТЕСТ ИСТОРИИ НАВИГАЦИИ ===');
  
  // Пытаемся получить доступ к менеджеру навигации
  try {
    const getNM = () => {
      window.__debug_navigation_manager = null;
      // Устанавливаем флаг отладки и пытаемся получить менеджер
      window.__NAVIGATION_MANAGER_DEBUG__ = true;
      
      // Загружаем модуль scrollUtils и пытаемся получить доступ к менеджеру
      const scrollUtils = require('@/lib/scrollUtils');
      
      // Доступ к внутреннему менеджеру навигации через глобальное пространство имен
      return window.__debug_navigation_manager = scrollUtils.NavigationManager?.getInstance();
    };
    
    const nm = getNM();
    
    if (!nm) {
      console.error('Не удалось получить доступ к менеджеру навигации');
      return;
    }
    
    // Получаем текущую историю навигации
    const history = nm.navHistory || [];
    const positions = nm.positions || {};
    
    console.log('Текущая история навигации:', history);
    console.log('Сохраненные позиции скролла:', positions);
    
    // Проверяем, что история содержит хотя бы текущий путь
    if (history.length > 0) {
      console.log('✅ История навигации содержит записи');
    } else {
      console.error('❌ История навигации пуста');
    }
    
  } catch (error) {
    console.error('Ошибка при получении доступа к менеджеру навигации:', error);
  }
}

// Экспортируем тесты
window.testScrollPositionRestoration = testScrollPositionRestoration;
window.testBackToTopButton = testBackToTopButton;
window.testNavigationHistory = testNavigationHistory;

console.log('Тесты скроллинга доступны в консоли браузера:');
console.log('1. testScrollPositionRestoration() - тест восстановления позиции скролла');
console.log('2. testBackToTopButton() - тест кнопки "Back to Top"');
console.log('3. testNavigationHistory() - тест истории навигации');