// Глобальный интерфейс для сервис-воркера
declare global {
  interface Window {
    swUpdateReady: boolean;
    swRegistration: ServiceWorkerRegistration | null;
    promptUpdate: () => void;
    checkForOfflineSupport: () => Promise<boolean>;
    clearCache: () => Promise<boolean>;
  }
}

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
      
      // Глобальные настройки для работы с сервис-воркером
      window.swUpdateReady = false;
      window.swRegistration = null;
      
      // Функция для обновления сервис-воркера
      window.promptUpdate = () => {
        if (window.swUpdateReady && window.swRegistration && window.swRegistration.waiting) {
          window.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
          return true;
        }
        return false;
      };
      
      // Функция для проверки поддержки оффлайн-режима
      window.checkForOfflineSupport = async () => {
        try {
          const cache = await caches.open('ai-store-v1');
          const offlinePage = await cache.match('/offline.html');
          return !!offlinePage;
        } catch (error) {
          console.error('Error checking offline support:', error);
          return false;
        }
      };
      
      // Функция для очистки кэша
      window.clearCache = async () => {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
          console.log('Cache cleared successfully');
          return true;
        } catch (error) {
          console.error('Error clearing cache:', error);
          return false;
        }
      };
      
      // Регистрация сервис-воркера
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('Service Worker registered: ', registration);
          window.swRegistration = registration;
          
          // Мониторинг обновлений
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Обновление доступно
                    console.log('New content is available; please refresh.');
                    window.swUpdateReady = true;
                    
                    // Здесь можно отобразить уведомление для пользователя
                    if (confirm('Доступно обновление приложения. Установить сейчас?')) {
                      window.promptUpdate();
                    }
                  } else {
                    // Все закэшировано для использования офлайн
                    console.log('Content is cached for offline use.');
                    
                    // Проверяем наличие офлайн-страницы
                    window.checkForOfflineSupport().then(hasOfflineSupport => {
                      if (hasOfflineSupport) {
                        console.log('Offline page is available');
                      } else {
                        console.warn('Offline page is not cached');
                      }
                    });
                  }
                }
              };
            }
          };
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
      
      // Обработка обновлений
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}