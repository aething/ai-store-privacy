// Скрипт для отслеживания консоли браузера
(function() {
  // Оригинальные методы консоли
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
  };

  // Функция для записи логов
  function saveLog(type, args) {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        type,
        messages: [...args].map(arg => {
          try {
            return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
          } catch (e) {
            return `[Неконвертируемый объект: ${typeof arg}]`;
          }
        })
      };

      // Отправляем лог на сервер
      fetch('/api/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      }).catch(() => {
        // Если не удалось отправить, сохраняем локально
        const logs = JSON.parse(localStorage.getItem('debug-logs') || '[]');
        logs.push(logData);
        localStorage.setItem('debug-logs', JSON.stringify(logs));
      });
    } catch (e) {
      // Используем оригинальный console.error для отчета об ошибках
      originalConsole.error('Ошибка при сохранении лога:', e);
    }
  }

  // Перехватываем методы консоли
  console.log = function() {
    saveLog('log', arguments);
    return originalConsole.log.apply(console, arguments);
  };

  console.error = function() {
    saveLog('error', arguments);
    return originalConsole.error.apply(console, arguments);
  };

  console.warn = function() {
    saveLog('warn', arguments);
    return originalConsole.warn.apply(console, arguments);
  };

  // Отслеживаем необработанные ошибки
  window.addEventListener('error', function(event) {
    saveLog('uncaught', [event.error ? event.error.toString() : event.message, 
      event.filename, `Line: ${event.lineno}, Col: ${event.colno}`]);
  });

  // Отслеживаем отклоненные промисы
  window.addEventListener('unhandledrejection', function(event) {
    saveLog('unhandledrejection', [event.reason ? event.reason.toString() : 'Unhandled Promise Rejection']);
  });

  // Сохраняем объект с информацией о важных ошибках
  window.debugInfo = {
    reactErrors: [],
    hookErrors: [],
    importErrors: [],
    renderErrors: []
  };

  // Инициализация
  console.log('Debug console initialized');
})();