/**
 * Сервис для логирования ошибок приложения и их отправки на сервер для анализа.
 * 
 * Этот модуль обеспечивает централизованное логирование всех ошибок в приложении,
 * собирает дополнительную диагностическую информацию и отправляет их на сервер.
 */

// Типы событий логирования
export enum LogEventType {
  ERROR = 'error',          // Общая ошибка
  WARNING = 'warning',      // Предупреждение
  NETWORK_ERROR = 'network_error', // Ошибка сети
  API_ERROR = 'api_error',  // Ошибка API
  PAYMENT_ERROR = 'payment_error', // Ошибка платежа
  APP_CRASH = 'app_crash',  // Краш приложения
  RENDER_ERROR = 'render_error', // Ошибка рендеринга
  NAVIGATION_ERROR = 'navigation_error', // Ошибка навигации
  STATE_ERROR = 'state_error', // Ошибка состояния
  AUTH_ERROR = 'auth_error', // Ошибка аутентификации
  FORM_ERROR = 'form_error', // Ошибка формы
  VALIDATION_ERROR = 'validation_error', // Ошибка валидации
  APP_LAUNCH = 'app_launch', // Запуск приложения
  PERFORMANCE_ISSUE = 'performance_issue', // Проблема производительности
}

// Интерфейс для базового лога
interface BaseLog {
  type: LogEventType;
  message: string;
  timestamp: number;
  deviceInfo: {
    platform: string;
    userAgent?: string;
    screenSize?: { width: number; height: number };
    language?: string;
    networkStatus?: string;
    memoryInfo?: any;
  };
  contextData?: Record<string, any>;
}

// Опции для настройки логгера
interface LoggerOptions {
  batchSize?: number; // Количество логов для отправки одним запросом
  maxQueueSize?: number; // Максимальный размер очереди логов
  sendInterval?: number; // Интервал авто-отправки в мс
  enabled?: boolean; // Включить/выключить логирование
  devMode?: boolean; // Режим разработки с подробным выводом в консоль
}

class ErrorLogger {
  private logs: BaseLog[] = [];
  private options: LoggerOptions;
  private sendTimer: number | null = null;
  private isSending: boolean = false;

  constructor(options: LoggerOptions = {}) {
    // Настройки по умолчанию
    this.options = {
      batchSize: 10,
      maxQueueSize: 100,
      sendInterval: 10000, // 10 секунд
      enabled: true,
      devMode: process.env.NODE_ENV === 'development',
      ...options,
    };

    // Подписываемся на ошибки в браузере
    this.setupBrowserErrorHandlers();

    // Запускаем таймер отправки логов
    this.startSendTimer();

    // Логируем запуск приложения
    this.logAppLaunch();
  }

  /**
   * Настройка обработчиков браузерных ошибок
   */
  private setupBrowserErrorHandlers() {
    // Глобальные необработанные ошибки
    window.addEventListener('error', (event) => {
      this.logError(
        LogEventType.ERROR,
        event.error?.message || event.message || 'Unknown error',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        }
      );
    });

    // Ошибки React
    window.addEventListener('react-error', (event: any) => {
      const detail = event.detail || {};
      this.logError(
        LogEventType.RENDER_ERROR,
        detail.message || 'React rendering error',
        {
          componentStack: detail.componentStack,
          ...detail
        }
      );
    });
  }

  /**
   * Запуск таймера для отправки накопленных логов
   */
  private startSendTimer() {
    if (this.sendTimer) {
      clearInterval(this.sendTimer);
    }

    if (this.options.enabled && this.options.sendInterval) {
      this.sendTimer = window.setInterval(() => {
        this.sendLogs();
      }, this.options.sendInterval);
    }
  }

  /**
   * Логирование запуска приложения
   */
  private logAppLaunch() {
    const performanceData = window.performance?.timing ? {
      loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
      domReadyTime: window.performance.timing.domComplete - window.performance.timing.domLoading,
      navigationTime: window.performance.timing.responseEnd - window.performance.timing.navigationStart,
    } : {};

    this.logEvent(LogEventType.APP_LAUNCH, 'Application launched', performanceData);
  }

  /**
   * Получение информации об устройстве пользователя
   */
  private getDeviceInfo() {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      language: navigator.language,
      networkStatus: navigator.onLine ? 'online' : 'offline',
      memoryInfo: (performance as any)?.memory ? {
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : undefined,
    };
  }

  /**
   * Добавление лога в очередь и автоматическая отправка при достижении порога
   */
  private addLog(log: BaseLog) {
    if (!this.options.enabled) return;

    // В режиме разработки выводим лог в консоль
    if (this.options.devMode) {
      console.group(`[ErrorLogger] ${log.type}`);
      console.log('Message:', log.message);
      console.log('Context:', log.contextData);
      console.log('Device:', log.deviceInfo);
      console.groupEnd();
    }

    // Добавляем лог в очередь
    this.logs.push(log);

    // Если очередь превысила максимальный размер, удаляем самые старые логи
    if (this.options.maxQueueSize && this.logs.length > this.options.maxQueueSize) {
      this.logs = this.logs.slice(this.logs.length - this.options.maxQueueSize);
    }

    // Если достигли порога для отправки, отправляем логи
    if (this.logs.length >= (this.options.batchSize || 1)) {
      this.sendLogs();
    }
  }

  /**
   * Отправка накопленных логов на сервер
   */
  private async sendLogs() {
    if (this.isSending || this.logs.length === 0 || !this.options.enabled) return;

    try {
      this.isSending = true;
      const logsToSend = [...this.logs];
      this.logs = [];

      // Отправляем логи на сервер
      // В режиме разработки можем только логировать, не отправляя на сервер
      if (!this.options.devMode || window.location.hostname !== 'localhost') {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logsToSend),
          // Используем keepalive для гарантии отправки даже при закрытии окна
          keepalive: true
        });
      }
    } catch (error) {
      // Если не удалось отправить, возвращаем логи обратно в очередь
      this.logs = [...this.logs, ...this.logs];
      
      if (this.options.devMode) {
        console.error('[ErrorLogger] Failed to send logs:', error);
      }
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Логирование произвольного события
   */
  public logEvent(type: LogEventType, message: string, contextData?: Record<string, any>) {
    this.addLog({
      type,
      message,
      timestamp: Date.now(),
      deviceInfo: this.getDeviceInfo(),
      contextData
    });
  }

  /**
   * Логирование ошибки
   */
  public logError(type: LogEventType, message: string, contextData?: Record<string, any>) {
    this.addLog({
      type,
      message,
      timestamp: Date.now(),
      deviceInfo: this.getDeviceInfo(),
      contextData: {
        url: window.location.href,
        route: window.location.pathname,
        ...contextData
      }
    });
  }

  /**
   * Логирование ошибки сети
   */
  public logNetworkError(message: string, contextData?: Record<string, any>) {
    this.logError(LogEventType.NETWORK_ERROR, message, contextData);
  }

  /**
   * Логирование ошибки API
   */
  public logApiError(message: string, contextData?: Record<string, any>) {
    this.logError(LogEventType.API_ERROR, message, contextData);
  }

  /**
   * Логирование ошибки платежа
   */
  public logPaymentError(message: string, contextData?: Record<string, any>) {
    this.logError(LogEventType.PAYMENT_ERROR, message, contextData);
  }

  /**
   * Логирование проблемы производительности
   */
  public logPerformanceIssue(message: string, measurements: Record<string, number>) {
    this.logEvent(LogEventType.PERFORMANCE_ISSUE, message, measurements);
  }
}

// Создаем и экспортируем экземпляр логгера для использования в приложении
export const errorLogger = new ErrorLogger();

// Экспортируем класс для возможности создания других экземпляров
export default ErrorLogger;