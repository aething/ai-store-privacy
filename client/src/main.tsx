import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { 
  clearUserCache, 
  clearAllCache, 
  reloadPage, 
  clearCacheAndReload,
  clearServiceWorkerCache,
  checkOfflineSupport,
  isOffline,
  resetAppStorage,
  updateServiceWorker,
  cacheUtils
} from "./utils/clearCache";
import { registerServiceWorker, sendMessageToServiceWorker } from './registerServiceWorker';

// Расширение типа window для отладочных функций
declare global {
  interface Window {
    appDebug: {
      // Базовые функции очистки
      clearUserCache: (preserveCountry?: boolean) => void;
      clearAllCache: () => void;
      reloadPage: () => void;
      clearCacheAndReload: (preserveCountry?: boolean) => void;
      
      // PWA и Service Worker функции
      clearServiceWorkerCache: () => Promise<boolean>;
      refreshServiceWorkerCache: () => Promise<boolean>;
      checkOfflineSupport: () => Promise<boolean>;
      isOffline: () => boolean;
      resetAppCache: (preserveUserData?: boolean) => Promise<boolean>;
      
      // Доступ к внутренним API Service Worker
      swAPI: {
        getVersion: () => Promise<string>;
        getCacheInfo: () => Promise<any>;
        cacheUrls: (urls: string[]) => Promise<any>;
        checkResource: (url: string) => Promise<boolean>;
      }
    };
    
    // Legacy API для обратной совместимости
    AIStoreMaintenance?: {
      clearCache?: () => Promise<boolean>;
      registerSW?: () => Promise<boolean>;
      updateSW?: () => Promise<boolean>;
      refresh?: () => Promise<boolean>;
      getVersion?: () => Promise<string>;
      getCacheInfo?: () => Promise<any>;
      cacheUrls?: (urls: string[]) => Promise<any>;
      checkResource?: (url: string) => Promise<boolean>;
    };
  }
}

// Инициализация расширенных отладочных функций с поддержкой PWA
if (typeof window !== 'undefined') {
  window.appDebug = {
    // Базовые функции очистки
    clearUserCache: (preserveCountry = false) => clearUserCache(preserveCountry),
    clearAllCache,
    reloadPage,
    clearCacheAndReload: (preserveCountry = false) => clearCacheAndReload(preserveCountry),
    
    // PWA и Service Worker функции
    clearServiceWorkerCache,
    refreshServiceWorkerCache: clearServiceWorkerCache, // Временный алиас
    checkOfflineSupport,
    isOffline,
    resetAppCache: resetAppStorage,
    
    // Доступ к внутренним API Service Worker
    swAPI: {
      getVersion: async () => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          try {
            const result = await sendMessageToServiceWorker({
              type: 'GET_VERSION'
            });
            return result?.payload?.version || 'unknown';
          } catch (error) {
            console.error('Error getting service worker version:', error);
            return 'unknown';
          }
        }
        
        // Fallback для обратной совместимости
        if (window.AIStoreMaintenance && window.AIStoreMaintenance.getVersion) {
          return window.AIStoreMaintenance.getVersion();
        }
        
        return 'unknown';
      },
      getCacheInfo: async () => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          try {
            const result = await sendMessageToServiceWorker({
              type: 'GET_CACHE_INFO'
            });
            return result?.payload || { items: 0, size: 0 };
          } catch (error) {
            console.error('Error getting cache info:', error);
            return { items: 0, size: 0 };
          }
        }
        
        // Fallback для обратной совместимости
        if (window.AIStoreMaintenance && window.AIStoreMaintenance.getCacheInfo) {
          return window.AIStoreMaintenance.getCacheInfo();
        }
        
        return { items: 0, size: 0 };
      },
      cacheUrls: async (urls: string[]) => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          try {
            const result = await sendMessageToServiceWorker({
              type: 'CACHE_URLS',
              payload: { urls }
            });
            return result?.payload || { success: 0, failed: 0 };
          } catch (error) {
            console.error('Error caching urls:', error);
            return { success: 0, failed: 0 };
          }
        }
        
        // Fallback для обратной совместимости
        if (window.AIStoreMaintenance && window.AIStoreMaintenance.cacheUrls) {
          return window.AIStoreMaintenance.cacheUrls(urls);
        }
        
        return { success: 0, failed: 0 };
      },
      checkResource: async (url: string) => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          try {
            const result = await sendMessageToServiceWorker({
              type: 'CHECK_RESOURCE',
              payload: { url }
            });
            return result?.payload?.cached || false;
          } catch (error) {
            console.error('Error checking resource:', error);
            return false;
          }
        }
        
        // Fallback для обратной совместимости
        if (window.AIStoreMaintenance && window.AIStoreMaintenance.checkResource) {
          return window.AIStoreMaintenance.checkResource(url);
        }
        
        return false;
      }
    }
  };
  
  console.log("🔍 Расширенные отладочные функции доступны через window.appDebug");
  console.log("📋 Примеры:");
  console.log(" - window.appDebug.clearUserCache()");
  console.log(" - window.appDebug.checkOfflineSupport()");
  console.log(" - window.appDebug.swAPI.getCacheInfo()");
}

// Инициализация и рендеринг приложения
createRoot(document.getElementById("root")!).render(<App />);

// Регистрация Service Worker для PWA функциональности
console.log("🔄 Инициализация Service Worker...");

// Функция для повторных попыток регистрации
const registerWithRetry = async (maxRetries = 3, delay = 1000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const success = await registerServiceWorker({
        scriptPath: '/service-worker.js',
        reloadOnUpdate: false, // Не перезагружаем автоматически, чтобы не прерывать пользователя
        debug: true // Включаем отладочные сообщения
      });
      
      if (success) {
        console.log(`✅ Service Worker успешно зарегистрирован (попытка ${retries + 1})`);
        return true;
      } else {
        console.warn(`⚠️ Service Worker не удалось зарегистрировать (попытка ${retries + 1})`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при регистрации Service Worker (попытка ${retries + 1}):`, error);
    }
    
    retries++;
    
    if (retries < maxRetries) {
      console.log(`⏱️ Ожидание перед следующей попыткой регистрации Service Worker (${delay}ms)...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};

// Запускаем регистрацию с повторными попытками
registerWithRetry().then(success => {
  if (!success) {
    console.error("❌ Не удалось зарегистрировать Service Worker после всех попыток");
  }
});
