/**
 * PWA Tester - скрипт для тестирования функциональности Progressive Web App
 * 
 * Этот скрипт помогает проверить:
 * 1. Регистрацию и состояние Service Worker
 * 2. Содержимое кэша
 * 3. Поведение в офлайн-режиме
 * 4. Поддержку установки PWA
 */

class PWATester {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.cacheContents = {};
    this.installPromptEvent = null;
    
    this.init();
  }

  /**
   * Инициализация тестера PWA
   */
  init() {
    // Сохраняем событие установки для дальнейшего использования
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPromptEvent = event;
      console.log('[PWA Tester] Install prompt event captured and saved');
    });
    
    // Слушаем изменения состояния онлайн/офлайн
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[PWA Tester] Device is now online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[PWA Tester] Device is now offline');
    });
    
    // Проверяем регистрацию Service Worker
    if ('serviceWorker' in navigator) {
      this.checkServiceWorker();
    } else {
      console.warn('[PWA Tester] Service Worker не поддерживается в этом браузере');
    }
  }

  /**
   * Проверка регистрации и состояния Service Worker
   */
  async checkServiceWorker() {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.warn('[PWA Tester] Service Worker не зарегистрирован');
        return;
      }
      
      this.swRegistration = registrations[0];
      console.log('[PWA Tester] Service Worker зарегистрирован');
      console.log('[PWA Tester] Service Worker scope:', this.swRegistration.scope);
      console.log('[PWA Tester] Service Worker state:', this.swRegistration.active ? this.swRegistration.active.state : 'not active');
      
      // Проверяем содержимое кэша
      this.checkCacheContents();
      
    } catch (error) {
      console.error('[PWA Tester] Ошибка при проверке Service Worker:', error);
    }
  }

  /**
   * Проверка содержимого кэша
   */
  async checkCacheContents() {
    try {
      const cacheNames = await caches.keys();
      
      if (cacheNames.length === 0) {
        console.warn('[PWA Tester] Кэш не найден');
        return;
      }
      
      console.log('[PWA Tester] Найдены кэши:', cacheNames);
      
      // Получаем содержимое каждого кэша
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        const urls = requests.map(request => request.url);
        this.cacheContents[cacheName] = urls;
        
        console.log(`[PWA Tester] Кэш "${cacheName}" содержит ${urls.length} ресурсов`);
      }
      
      // Проверяем базовые ресурсы
      this.checkCriticalResources();
      
    } catch (error) {
      console.error('[PWA Tester] Ошибка при проверке кэша:', error);
    }
  }

  /**
   * Проверка наличия критических ресурсов в кэше
   */
  checkCriticalResources() {
    const criticalResources = [
      '/index.html',
      '/manifest.json',
      '/offline.html'
    ];
    
    const allCachedUrls = Object.values(this.cacheContents).flat();
    
    const missingResources = criticalResources.filter(resource => {
      return !allCachedUrls.some(url => url.includes(resource));
    });
    
    if (missingResources.length > 0) {
      console.warn('[PWA Tester] Отсутствуют важные ресурсы в кэше:', missingResources);
    } else {
      console.log('[PWA Tester] Все критические ресурсы находятся в кэше');
    }
  }

  /**
   * Тестирование оффлайн-режима
   */
  async testOfflineMode() {
    if (!this.swRegistration) {
      console.warn('[PWA Tester] Service Worker не зарегистрирован, невозможно тестировать оффлайн-режим');
      return;
    }
    
    console.log('[PWA Tester] Симуляция оффлайн-режима...');
    console.log('[PWA Tester] Для полного тестирования используйте режим оффлайн в DevTools');
    
    // Получение всех кэшированных URL
    const allCachedUrls = Object.values(this.cacheContents).flat();
    const pageUrls = allCachedUrls.filter(url => url.endsWith('.html') || url.endsWith('/'));
    
    if (pageUrls.length > 0) {
      console.log('[PWA Tester] Кэшированные страницы, которые должны работать оффлайн:', pageUrls);
    } else {
      console.warn('[PWA Tester] Не найдены кэшированные страницы');
    }
  }

  /**
   * Тестирование возможности установки PWA
   */
  async testInstallability() {
    if (this.installPromptEvent) {
      console.log('[PWA Tester] PWA может быть установлено на это устройство');
      return true;
    }
    
    try {
      // Проверка манифеста
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        console.warn('[PWA Tester] Манифест не найден в документе');
        return false;
      }
      
      const manifestUrl = manifestLink.href;
      const response = await fetch(manifestUrl);
      const manifest = await response.json();
      
      console.log('[PWA Tester] Манифест загружен:', manifest);
      
      // Проверка обязательных полей
      const requiredFields = ['name', 'short_name', 'icons', 'start_url', 'display'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        console.warn('[PWA Tester] В манифесте отсутствуют обязательные поля:', missingFields);
        return false;
      }
      
      // Проверка иконок
      const hasRequiredIcons = manifest.icons && 
                              manifest.icons.some(icon => parseInt(icon.sizes.split('x')[0]) >= 192);
      
      if (!hasRequiredIcons) {
        console.warn('[PWA Tester] Отсутствуют иконки требуемого размера (минимум 192x192)');
        return false;
      }
      
      console.log('[PWA Tester] Манифест соответствует требованиям для установки');
      
      return true;
    } catch (error) {
      console.error('[PWA Tester] Ошибка при проверке возможности установки:', error);
      return false;
    }
  }

  /**
   * Запуск всех тестов
   */
  async runAllTests() {
    console.group('[PWA Tester] Запуск всех тестов');
    
    console.log('[PWA Tester] Текущее состояние: ' + (this.isOnline ? 'онлайн' : 'офлайн'));
    
    await this.checkServiceWorker();
    await this.testOfflineMode();
    
    const installable = await this.testInstallability();
    console.log('[PWA Tester] Возможность установки:', installable ? 'Да' : 'Нет');
    
    console.groupEnd();
    
    return {
      serviceWorkerActive: !!this.swRegistration && !!this.swRegistration.active,
      cacheAvailable: Object.keys(this.cacheContents).length > 0,
      isOnline: this.isOnline,
      isInstallable: installable
    };
  }

  /**
   * Попытка установки PWA
   */
  async promptInstall() {
    if (!this.installPromptEvent) {
      console.warn('[PWA Tester] Событие установки не доступно');
      return false;
    }
    
    try {
      this.installPromptEvent.prompt();
      const choiceResult = await this.installPromptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA Tester] Пользователь согласился установить PWA');
        this.installPromptEvent = null;
        return true;
      } else {
        console.log('[PWA Tester] Пользователь отказался от установки PWA');
        return false;
      }
    } catch (error) {
      console.error('[PWA Tester] Ошибка при попытке установки:', error);
      return false;
    }
  }
}

// Создаем глобальный экземпляр тестера
window.pwaTester = new PWATester();

// Запускаем тесты при загрузке страницы
window.addEventListener('load', () => {
  console.log('[PWA Tester] Страница загружена, запуск тестов...');
  window.pwaTester.runAllTests().then(results => {
    console.log('[PWA Tester] Результаты тестов:', results);
  });
});