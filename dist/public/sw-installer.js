/**
 * Принудительная регистрация Service Worker
 * Этот скрипт загружается непосредственно на всех страницах для обеспечения
 * надежной регистрации Service Worker даже при проблемах с основным приложением
 * 
 * ОБНОВЛЕНО: Добавлены проверки против частых перезагрузок и "дергания" страницы
 */

(function() {
  // Глобальный идентификатор для отслеживания состояния
  window.serviceWorkerStatus = {
    registered: false,
    active: false,
    controlling: false
  };
  
  // Убедимся, что скрипт выполняется только один раз за сессию
  if (window.serviceWorkerInitialized) {
    console.log('SW-installer уже запущен, пропускаем повторную инициализацию');
    return;
  }
  
  window.serviceWorkerInitialized = true;
  console.log('SW-installer запущен');
  
  // Защита от слишком частых регистраций
  const lastRegistrationAttempt = parseInt(localStorage.getItem('sw_last_registration') || '0');
  const now = Date.now();
  const MIN_REGISTRATION_INTERVAL = 60000; // Минимум 1 минута между попытками регистрации
  
  if (now - lastRegistrationAttempt < MIN_REGISTRATION_INTERVAL) {
    console.log('Последняя попытка регистрации Service Worker была недавно, откладываем регистрацию');
    return;
  }
  
  // Запоминаем время попытки регистрации
  localStorage.setItem('sw_last_registration', now.toString());
  
  // Защита от слишком частых перезагрузок страницы
  const lastPageReload = parseInt(localStorage.getItem('sw_last_reload') || '0');
  const PAGE_RELOAD_THRESHOLD = 10000; // 10 секунд между перезагрузками
  
  if (now - lastPageReload < PAGE_RELOAD_THRESHOLD) {
    console.warn('Возможно зацикливание перезагрузок, пропускаем регистрацию Service Worker');
    return;
  }
  
  // Запускаем регистрацию после некоторой задержки, чтобы не мешать загрузке страницы
  // и проверяем, что страница полностью загружена
  if (document.readyState === 'complete') {
    // Страница уже загружена - запускаем через небольшую задержку
    setTimeout(registerServiceWorker, 1000);
  } else {
    // Ждем полной загрузки страницы
    window.addEventListener('load', function() {
      setTimeout(registerServiceWorker, 1000);
    });
  }

  /**
   * Регистрирует Service Worker без лишних повторных попыток
   */
  function registerServiceWorker() {
    console.log('Начинаем регистрацию Service Worker...');
    
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker не поддерживается в этом браузере');
      updateStatus(false, 'не поддерживается браузером');
      return;
    }
    
    // Проверяем, контролирует ли уже Service Worker страницу
    if (navigator.serviceWorker.controller) {
      console.log('Service Worker уже контролирует страницу');
      window.serviceWorkerStatus.controlling = true;
      window.serviceWorkerStatus.active = true;
      window.serviceWorkerStatus.registered = true;
      updateStatus(true, 'уже активен');
      return; // Не нужно ничего делать, если контроллер уже есть
    }
    
    // Функция для однократной регистрации без агрессивных повторов
    function attemptRegistration() {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function(registration) {
          console.log('Service Worker успешно зарегистрирован, scope:', registration.scope);
          
          // Обновляем статус
          window.serviceWorkerStatus.registered = true;
          updateStatus(true, 'зарегистрирован');
          
          // Не вызываем принудительную активацию, так как это может вызвать перезагрузку
          // и "дергание" страницы
        })
        .catch(function(error) {
          console.error('Ошибка при регистрации Service Worker:', error);
          updateStatus(false, 'ошибка регистрации');
        });
    }
    
    // Проверяем текущие регистрации перед созданием новой
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      // Если нет регистраций, создаем новую
      if (registrations.length === 0) {
        console.log('Нет активных регистраций Service Worker, регистрируем новый');
        attemptRegistration();
        return;
      }
      
      // Если есть регистрации, проверим их состояние
      console.log(`Найдено ${registrations.length} существующих регистраций Service Worker`);
      
      // Проверяем, есть ли активный Service Worker
      let hasActive = false;
      
      registrations.forEach(reg => {
        if (reg.active) {
          hasActive = true;
          window.serviceWorkerStatus.active = true;
          console.log('Найден активный Service Worker');
        }
      });
      
      // Если нет активного Service Worker, регистрируем новый
      if (!hasActive) {
        console.log('Нет активных Service Worker, регистрируем новый');
        attemptRegistration();
      } else {
        console.log('Service Worker уже активен, не требуется повторная регистрация');
        updateStatus(true, 'активен');
      }
    }).catch(function(error) {
      console.error('Ошибка при получении регистраций Service Worker:', error);
    });
  }
  
  /**
   * Обновляет статус отображения в документе, если элемент существует
   */
  function updateStatus(isRegistered, message) {
    try {
      // Обновляем статус в элементе, если он существует
      const statusElement = document.getElementById('service-worker-status');
      if (statusElement) {
        if (isRegistered) {
          statusElement.textContent = '✓ Оффлайн режим активен (Service Worker ' + message + ')';
          statusElement.style.color = '#4CAF50';
        } else {
          statusElement.textContent = '✗ Оффлайн режим недоступен (Service Worker ' + message + ')';
          statusElement.style.color = '#F44336';
        }
      }
    } catch (e) {
      console.error('Ошибка при обновлении статуса:', e);
    }
  }
})();