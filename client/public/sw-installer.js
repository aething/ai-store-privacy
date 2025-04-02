/**
 * Принудительная регистрация Service Worker
 * Этот скрипт загружается непосредственно на всех страницах для обеспечения
 * надежной регистрации Service Worker даже при проблемах с основным приложением
 */

(function() {
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
    
    // Проверяем текущие регистрации
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      // Проверяем, есть ли уже активные регистрации
      if (registrations.length > 0) {
        console.log(`🔍 Найдено ${registrations.length} существующих регистраций`);
        
        // Проверяем, есть ли активный контроллер
        if (navigator.serviceWorker.controller) {
          console.log('✅ Service Worker уже контролирует страницу');
          updateStatus(true, 'уже активен и контролирует страницу');
          
          // Проверяем, нужно ли обновить какой-то из сервис-воркеров
          let needsUpdate = false;
          registrations.forEach(reg => {
            if (reg.waiting) {
              needsUpdate = true;
              console.log('🔄 Активация ожидающего Service Worker');
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          });
          
          if (!needsUpdate) {
            // Если всё уже работает и не требует обновления - просто возвращаемся
            return;
          }
        } else {
          // Если нет активного контроллера, но есть регистрации - активируем
          console.log('⚠️ Есть регистрации, но нет активного контроллера');
          // Пробуем активировать существующие регистрации
          registrations.forEach(reg => {
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else if (reg.active) {
              reg.active.postMessage({ type: 'SKIP_WAITING' });
            }
          });
          
          // Даём контроллеру время на активацию
          setTimeout(() => {
            // Если контроллер появился, не регистрируем заново
            if (navigator.serviceWorker.controller) {
              console.log('✅ Service Worker успешно активирован');
              updateStatus(true, 'активирован');
              return;
            }
            // Иначе регистрируем заново
            attemptRegistration();
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