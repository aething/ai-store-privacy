/**
 * Принудительная регистрация Service Worker
 * Этот скрипт загружается непосредственно на всех страницах для обеспечения
 * надежной регистрации Service Worker даже при проблемах с основным приложением
 */

(function() {
  // Глобальный идентификатор для отслеживания состояния
  window.serviceWorkerStatus = {
    registered: false,
    active: false,
    controlling: false
  };
  
  // Убедимся, что скрипт выполняется только один раз
  if (window.serviceWorkerInitialized) {
    console.log('🔄 SW-installer уже запущен, пропускаем инициализацию');
    return;
  }
  
  window.serviceWorkerInitialized = true;
  console.log('🚀 SW-installer запущен впервые');
  
  // Запускаем регистрацию только после полной загрузки страницы
  if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') {
    registerServiceWorker();
  } else {
    window.addEventListener('DOMContentLoaded', registerServiceWorker);
  }

  /**
   * Регистрирует Service Worker с повторными попытками
   */
  function registerServiceWorker() {
    console.log('🛠️ Старт прямой регистрации Service Worker...');
    
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker не поддерживается в этом браузере');
      updateStatus(false, 'не поддерживается браузером');
      return;
    }
    
    // Функция для регистрации с повторными попытками
    function attemptRegistration(attempt = 1, maxAttempts = 3) {
      console.log(`🔄 Попытка регистрации Service Worker: ${attempt}/${maxAttempts}`);
      
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then(function(registration) {
          console.log('✅ Service Worker успешно зарегистрирован, scope:', registration.scope);
          
          // Обновляем статус отображения
          updateStatus(true, 'зарегистрирован');
          
          // Если есть ожидающий Service Worker, активируем его
          if (registration.waiting) {
            console.log('🔄 Активация ожидающего Service Worker');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          
          // Интервал проверки контроллера - для подтверждения активации
          const checkInterval = setInterval(function() {
            if (navigator.serviceWorker.controller) {
              console.log('✅ Service Worker контролирует страницу');
              updateStatus(true, 'активен и контролирует страницу');
              clearInterval(checkInterval);
            }
          }, 1000);
          
          // Таймаут для остановки проверок через 10 секунд
          setTimeout(function() {
            clearInterval(checkInterval);
          }, 10000);
        })
        .catch(function(error) {
          console.error('❌ Ошибка при регистрации Service Worker:', error);
          
          // Если не достигли максимального количества попыток - пробуем еще раз
          if (attempt < maxAttempts) {
            setTimeout(function() {
              attemptRegistration(attempt + 1, maxAttempts);
            }, 2000); // Задержка перед следующей попыткой
          } else {
            updateStatus(false, 'ошибка регистрации');
            console.error('❌ Достигнуто максимальное количество попыток регистрации Service Worker');
          }
        });
    }
    
    // Обновляем глобальный статус
    window.serviceWorkerStatus.registered = false;
    window.serviceWorkerStatus.active = false;
    window.serviceWorkerStatus.controlling = false;
    
    // Применяем более агрессивную стратегию регистрации
    const forceRegistration = true; // Всегда регистрируем заново
    
    // Проверяем текущие регистрации
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      // Обновляем статус регистрации
      window.serviceWorkerStatus.registered = registrations.length > 0;
      
      // Проверяем, есть ли активный контроллер
      if (navigator.serviceWorker.controller) {
        console.log('✅ Service Worker уже контролирует страницу');
        window.serviceWorkerStatus.controlling = true;
        updateStatus(true, 'уже активен и контролирует страницу');
        
        // Если включено принудительное обновление, делаем это несмотря на наличие контроллера
        if (forceRegistration) {
          console.log('🔄 Принудительная повторная регистрация Service Worker...');
          attemptRegistration();
          return;
        }
      }
      
      // Проверяем, есть ли уже активные регистрации
      if (registrations.length > 0) {
        console.log(`🔍 Найдено ${registrations.length} существующих регистраций`);
        
        // Проверяем их состояние
        let hasWaiting = false;
        let hasActive = false;
        
        registrations.forEach(reg => {
          if (reg.waiting) {
            hasWaiting = true;
            console.log('🔄 Есть ожидающий Service Worker, активируем его');
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          if (reg.active) {
            hasActive = true;
            window.serviceWorkerStatus.active = true;
            console.log('🔄 Есть активный Service Worker, скажем ему пропустить ожидание');
            reg.active.postMessage({ type: 'SKIP_WAITING' });
          }
          
          // Проверяем состояние регистрации для отладки
          console.log('📊 Состояние регистрации:', {
            scope: reg.scope,
            active: !!reg.active,
            activeState: reg.active ? reg.active.state : null,
            waiting: !!reg.waiting,
            waitingState: reg.waiting ? reg.waiting.state : null
          });
        });
        
        // Если нет активного контроллера, принудительно создаем его
        if (!navigator.serviceWorker.controller && (hasActive || hasWaiting)) {
          console.log('⚠️ Есть регистрации, но нет активного контроллера - принудительное обновление страницы');
          
          // Сохраняем состояние перед перезагрузкой
          localStorage.setItem('sw_force_reload', 'true');
          
          // Перезагружаем страницу для захвата контроллера
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        }
      }
      
      console.log('🔍 Нет активных регистраций Service Worker, регистрируем новый');
      // Если регистраций нет или они все неактивны, регистрируем заново
      attemptRegistration();
    }).catch(function(error) {
      console.error('❌ Ошибка при получении регистраций:', error);
      // В случае ошибки всё равно пробуем зарегистрировать
      attemptRegistration();
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