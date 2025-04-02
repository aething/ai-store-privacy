/**
 * Скрипт для тестирования офлайн-режима PWA
 * 
 * Этот скрипт позволяет симулировать отключение интернета
 * без изменения настроек браузера и наблюдать поведение PWA
 * в офлайн-режиме.
 */

(function() {
  // Создаем UI для тестирования
  const createTestUI = () => {
    const container = document.createElement('div');
    container.id = 'offline-test-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-family: sans-serif;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Тестирование офлайн-режима';
    title.style.cssText = 'margin: 0 0 10px 0; font-size: 16px;';
    
    const status = document.createElement('div');
    status.id = 'offline-test-status';
    status.textContent = navigator.onLine ? 'Статус: Онлайн' : 'Статус: Офлайн';
    status.style.cssText = `
      margin-bottom: 10px;
      padding: 5px;
      background-color: ${navigator.onLine ? '#d1fae5' : '#fee2e2'};
      border-radius: 4px;
      font-weight: bold;
    `;
    
    const toggleButton = document.createElement('button');
    toggleButton.id = 'offline-test-toggle';
    toggleButton.textContent = navigator.onLine ? 'Симулировать офлайн' : 'Восстановить онлайн';
    toggleButton.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 12px;
      background-color: ${navigator.onLine ? '#ef4444' : '#10b981'};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-bottom: 10px;
    `;
    
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Перезагрузить страницу';
    reloadButton.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 12px;
      background-color: #6366f1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
    
    const info = document.createElement('div');
    info.textContent = 'Примечание: симуляция офлайн-режима работает только с запросами через fetch API';
    info.style.cssText = 'margin-top: 10px; font-size: 12px; color: #6b7280;';
    
    container.appendChild(title);
    container.appendChild(status);
    container.appendChild(toggleButton);
    container.appendChild(reloadButton);
    container.appendChild(info);
    
    document.body.appendChild(container);
    
    return {
      container,
      status,
      toggleButton,
      reloadButton
    };
  };
  
  // Патчим fetch для симуляции офлайн-режима
  const patchFetch = () => {
    const originalFetch = window.fetch;
    let isOfflineSimulated = false;
    
    window.fetch = function(input, init) {
      if (isOfflineSimulated) {
        return Promise.reject(new Error('Симуляция офлайн-режима активна'));
      }
      return originalFetch.apply(this, arguments);
    };
    
    // Метод для включения/выключения симуляции
    window.toggleOfflineSimulation = function() {
      isOfflineSimulated = !isOfflineSimulated;
      
      // Обновляем статус
      const status = document.getElementById('offline-test-status');
      const toggleButton = document.getElementById('offline-test-toggle');
      
      if (status) {
        status.textContent = isOfflineSimulated ? 'Статус: Офлайн (симуляция)' : 'Статус: Онлайн';
        status.style.backgroundColor = isOfflineSimulated ? '#fee2e2' : '#d1fae5';
      }
      
      if (toggleButton) {
        toggleButton.textContent = isOfflineSimulated ? 'Восстановить онлайн' : 'Симулировать офлайн';
        toggleButton.style.backgroundColor = isOfflineSimulated ? '#10b981' : '#ef4444';
      }
      
      // Вызываем соответствующие события
      const event = new Event(isOfflineSimulated ? 'offline' : 'online');
      window.dispatchEvent(event);
      
      // Обновляем navigator.onLine (хак)
      Object.defineProperty(navigator, 'onLine', {
        get: function() {
          return !isOfflineSimulated;
        },
        configurable: true
      });
      
      console.log(`[Offline Tester] ${isOfflineSimulated ? 'Симуляция офлайн-режима активирована' : 'Симуляция офлайн-режима деактивирована'}`);
    };
    
    return window.toggleOfflineSimulation;
  };
  
  // Инициализируем тестер
  const init = () => {
    // Патчим fetch
    const toggleOfflineSimulation = patchFetch();
    
    // Создаем UI
    const ui = createTestUI();
    
    // Добавляем обработчики событий
    ui.toggleButton.addEventListener('click', toggleOfflineSimulation);
    ui.reloadButton.addEventListener('click', () => {
      location.reload();
    });
    
    // Обрабатываем события онлайн/офлайн
    window.addEventListener('online', () => {
      console.log('[Offline Tester] Браузер перешел в режим онлайн');
      ui.status.textContent = 'Статус: Онлайн';
      ui.status.style.backgroundColor = '#d1fae5';
    });
    
    window.addEventListener('offline', () => {
      console.log('[Offline Tester] Браузер перешел в режим офлайн');
      ui.status.textContent = 'Статус: Офлайн';
      ui.status.style.backgroundColor = '#fee2e2';
    });
  };
  
  // Запускаем после загрузки страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();