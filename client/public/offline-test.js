/**
 * Утилиты для тестирования оффлайн-функциональности PWA
 * 
 * Этот файл предоставляет инструменты для диагностики и проверки
 * работоспособности оффлайн-режима Progressive Web App.
 */

// Глобальный объект для инструментов тестирования
window.PWAOfflineTest = {
  // Состояние сети
  isOnline: navigator.onLine,
  
  // Состояние Service Worker
  serviceWorkerStatus: {
    supported: 'serviceWorker' in navigator,
    registered: false,
    active: false,
    version: null
  },
  
  // Информация о кэше
  cacheInfo: {
    caches: [],
    totalSize: 0,
    entryCount: 0
  },
  
  // Статистика по ресурсам
  resourceStats: {
    html: { count: 0, size: 0 },
    css: { count: 0, size: 0 },
    js: { count: 0, size: 0 },
    images: { count: 0, size: 0 },
    fonts: { count: 0, size: 0 },
    other: { count: 0, size: 0 }
  },
  
  /**
   * Инициализация тестового инструмента
   */
  init() {
    console.log('🔍 Initializing PWA Offline Test Tool');
    this.setupEventListeners();
    this.checkServiceWorker();
    
    // Обновляем UI с начальными данными
    this.updateNetworkStatusUI();
    
    return this;
  },
  
  /**
   * Настройка слушателей событий
   */
  setupEventListeners() {
    // Слушаем изменения состояния сети
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateNetworkStatusUI();
      console.log('✅ Network connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateNetworkStatusUI();
      console.log('❌ Network connection lost');
    });
    
    // Обработчик для кнопок тестирования
    document.addEventListener('DOMContentLoaded', () => {
      // Кнопка для проверки кэша
      const checkCacheBtn = document.getElementById('check-cache-btn');
      if (checkCacheBtn) {
        checkCacheBtn.addEventListener('click', () => this.analyzeCaches());
      }
      
      // Кнопка для очистки кэша
      const clearCacheBtn = document.getElementById('clear-cache-btn');
      if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => this.clearAllCaches());
      }
      
      // Кнопка для обновления страницы
      const refreshBtn = document.getElementById('refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => window.location.reload());
      }
      
      // Кнопка для просмотра оффлайн-страницы
      const viewOfflineBtn = document.getElementById('view-offline-btn');
      if (viewOfflineBtn) {
        viewOfflineBtn.addEventListener('click', () => window.open('/offline.html', '_blank'));
      }
      
      // Кнопка для синхронизации сервис воркера
      const updateSWBtn = document.getElementById('update-sw-btn');
      if (updateSWBtn) {
        updateSWBtn.addEventListener('click', () => this.updateServiceWorker());
      }
    });
  },
  
  /**
   * Обновление UI для отображения состояния сети
   */
  updateNetworkStatusUI() {
    const statusElement = document.getElementById('network-status');
    const statusIconElement = document.getElementById('network-status-icon');
    
    if (statusElement) {
      statusElement.textContent = this.isOnline ? 'Онлайн' : 'Оффлайн';
      statusElement.className = this.isOnline ? 'status-online' : 'status-offline';
    }
    
    if (statusIconElement) {
      statusIconElement.className = this.isOnline ? 'status-icon-online' : 'status-icon-offline';
    }
    
    // Обновляем индикатор в заголовке страницы
    document.title = `${this.isOnline ? '🟢' : '🔴'} PWA Тест | AI Store`;
  },
  
  /**
   * Проверка статуса Service Worker
   */
  async checkServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker is not supported in this browser');
      this.serviceWorkerStatus.supported = false;
      this.updateServiceWorkerUI();
      return;
    }
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.warn('⚠️ No Service Worker registrations found');
        this.serviceWorkerStatus.registered = false;
      } else {
        this.serviceWorkerStatus.registered = true;
        const mainRegistration = registrations[0];
        
        // Проверяем активный сервис-воркер
        this.serviceWorkerStatus.active = !!mainRegistration.active;
        
        // Пытаемся получить версию
        if (mainRegistration.active) {
          // TODO: Реализовать получение версии через сообщения
          this.serviceWorkerStatus.version = 'Unknown';
        }
        
        console.log('✅ Service Worker is registered and active');
      }
    } catch (error) {
      console.error('❌ Error checking Service Worker:', error);
    }
    
    this.updateServiceWorkerUI();
  },
  
  /**
   * Обновление UI для отображения статуса Service Worker
   */
  updateServiceWorkerUI() {
    const swStatusElement = document.getElementById('sw-status');
    const swVersionElement = document.getElementById('sw-version');
    
    if (swStatusElement) {
      if (!this.serviceWorkerStatus.supported) {
        swStatusElement.textContent = 'Не поддерживается';
        swStatusElement.className = 'status-error';
      } else if (!this.serviceWorkerStatus.registered) {
        swStatusElement.textContent = 'Не зарегистрирован';
        swStatusElement.className = 'status-warning';
      } else if (!this.serviceWorkerStatus.active) {
        swStatusElement.textContent = 'Зарегистрирован, но не активен';
        swStatusElement.className = 'status-warning';
      } else {
        swStatusElement.textContent = 'Активен';
        swStatusElement.className = 'status-success';
      }
    }
    
    if (swVersionElement && this.serviceWorkerStatus.version) {
      swVersionElement.textContent = this.serviceWorkerStatus.version;
    }
  },
  
  /**
   * Анализ кэшей и их содержимого
   */
  async analyzeCaches() {
    if (!('caches' in window)) {
      console.error('❌ Cache API is not supported in this browser');
      return;
    }
    
    try {
      // Очищаем предыдущие данные
      this.cacheInfo = {
        caches: [],
        totalSize: 0,
        entryCount: 0
      };
      
      this.resourceStats = {
        html: { count: 0, size: 0 },
        css: { count: 0, size: 0 },
        js: { count: 0, size: 0 },
        images: { count: 0, size: 0 },
        fonts: { count: 0, size: 0 },
        other: { count: 0, size: 0 }
      };
      
      // Получаем список кэшей
      const cacheNames = await caches.keys();
      
      if (cacheNames.length === 0) {
        console.warn('⚠️ No caches found');
        this.updateCacheUI();
        return;
      }
      
      // Обрабатываем каждый кэш
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        let cacheSize = 0;
        let entries = [];
        
        // Анализируем каждый запрос в кэше
        for (const request of requests) {
          const response = await cache.match(request);
          if (!response) continue;
          
          const blob = await response.clone().blob();
          const size = blob.size;
          cacheSize += size;
          
          // Категоризируем ресурс
          const url = request.url;
          const type = this.getResourceType(url);
          this.resourceStats[type].count++;
          this.resourceStats[type].size += size;
          
          entries.push({
            url,
            size,
            type,
            timestamp: response.headers.get('sw-cache-timestamp') || 'unknown'
          });
        }
        
        this.cacheInfo.caches.push({
          name: cacheName,
          size: cacheSize,
          entryCount: requests.length,
          entries
        });
        
        this.cacheInfo.totalSize += cacheSize;
        this.cacheInfo.entryCount += requests.length;
      }
      
      console.log('📊 Cache analysis completed:', this.cacheInfo);
      this.updateCacheUI();
      
    } catch (error) {
      console.error('❌ Error analyzing caches:', error);
    }
  },
  
  /**
   * Обновление UI для отображения информации о кэше
   */
  updateCacheUI() {
    const cacheListElement = document.getElementById('cache-list');
    const cacheSizeElement = document.getElementById('cache-size');
    const cacheCountElement = document.getElementById('cache-count');
    
    if (cacheSizeElement) {
      cacheSizeElement.textContent = this.formatSize(this.cacheInfo.totalSize);
    }
    
    if (cacheCountElement) {
      cacheCountElement.textContent = this.cacheInfo.entryCount.toString();
    }
    
    if (cacheListElement) {
      // Очищаем список
      cacheListElement.innerHTML = '';
      
      if (this.cacheInfo.caches.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'cache-empty';
        emptyItem.textContent = 'Нет кэшированных данных';
        cacheListElement.appendChild(emptyItem);
        return;
      }
      
      // Добавляем информацию о каждом кэше
      for (const cache of this.cacheInfo.caches) {
        const cacheItem = document.createElement('li');
        cacheItem.className = 'cache-item';
        
        const cacheName = document.createElement('div');
        cacheName.className = 'cache-name';
        cacheName.textContent = cache.name;
        
        const cacheDetails = document.createElement('div');
        cacheDetails.className = 'cache-details';
        cacheDetails.textContent = `${this.formatSize(cache.size)} • ${cache.entryCount} файлов`;
        
        cacheItem.appendChild(cacheName);
        cacheItem.appendChild(cacheDetails);
        cacheListElement.appendChild(cacheItem);
      }
      
      // Обновляем статистику по типам ресурсов
      this.updateResourceStatsUI();
    }
  },
  
  /**
   * Обновление UI для отображения статистики по типам ресурсов
   */
  updateResourceStatsUI() {
    const resourceStatsElement = document.getElementById('resource-stats');
    
    if (resourceStatsElement) {
      // Очищаем содержимое
      resourceStatsElement.innerHTML = '';
      
      const types = [
        { id: 'html', label: 'HTML' },
        { id: 'css', label: 'CSS' },
        { id: 'js', label: 'JavaScript' },
        { id: 'images', label: 'Изображения' },
        { id: 'fonts', label: 'Шрифты' },
        { id: 'other', label: 'Прочее' }
      ];
      
      for (const type of types) {
        const stat = this.resourceStats[type.id];
        if (stat.count === 0) continue;
        
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        
        const statLabel = document.createElement('span');
        statLabel.className = 'stat-label';
        statLabel.textContent = type.label;
        
        const statValue = document.createElement('span');
        statValue.className = 'stat-value';
        statValue.textContent = `${stat.count} (${this.formatSize(stat.size)})`;
        
        statItem.appendChild(statLabel);
        statItem.appendChild(statValue);
        resourceStatsElement.appendChild(statItem);
      }
    }
  },
  
  /**
   * Очистка всех кэшей
   */
  async clearAllCaches() {
    if (!('caches' in window)) {
      console.error('❌ Cache API is not supported in this browser');
      return;
    }
    
    try {
      const cacheNames = await caches.keys();
      
      if (cacheNames.length === 0) {
        console.warn('⚠️ No caches to clear');
        return;
      }
      
      // Удаляем каждый кэш
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log(`🗑️ Cache "${cacheName}" deleted`);
      }
      
      console.log('✅ All caches cleared');
      
      // Обновляем информацию о кэше
      await this.analyzeCaches();
      
      // Даем пользователю обратную связь
      alert('Кэш успешно очищен');
      
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      alert('Ошибка при очистке кэша: ' + error.message);
    }
  },
  
  /**
   * Обновление Service Worker
   */
  async updateServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker is not supported in this browser');
      return;
    }
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.warn('⚠️ No Service Worker registrations to update');
        return;
      }
      
      // Пытаемся обновить каждую регистрацию
      for (const registration of registrations) {
        const updatedRegistration = await registration.update();
        console.log('🔄 Service Worker updated:', updatedRegistration);
      }
      
      console.log('✅ Service Worker update check completed');
      
      // Проверяем статус обновленного воркера
      await this.checkServiceWorker();
      
      // Даем пользователю обратную связь
      alert('Проверка обновлений Service Worker завершена. Обновите страницу для применения изменений.');
      
    } catch (error) {
      console.error('❌ Error updating Service Worker:', error);
      alert('Ошибка при обновлении Service Worker: ' + error.message);
    }
  },
  
  /**
   * Определение типа ресурса по URL
   */
  getResourceType(url) {
    const extension = url.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'js';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
      case 'ico':
        return 'images';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'eot':
      case 'otf':
        return 'fonts';
      default:
        return 'other';
    }
  },
  
  /**
   * Форматирование размера в читаемый вид
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
};

// Автоматически инициализируем инструмент при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем тестовый инструмент
  window.PWAOfflineTest.init();
  
  console.log('✅ PWA Offline Test Tool initialized');
});