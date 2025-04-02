import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { 
  clearUserCache, 
  clearAllCache, 
  reloadPage, 
  clearCacheAndReload,
  clearServiceWorkerCache,
  refreshServiceWorkerCache,
  checkOfflineSupport,
  isOffline,
  resetAppCache
} from "./utils/clearCache";
import * as serviceWorker from './registerServiceWorker';

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
    refreshServiceWorkerCache,
    checkOfflineSupport,
    isOffline,
    resetAppCache,
    
    // Доступ к внутренним API Service Worker
    swAPI: {
      getVersion: async () => {
        if (window.AIStoreMaintenance) {
          return window.AIStoreMaintenance.getVersion();
        }
        return 'unknown';
      },
      getCacheInfo: async () => {
        if (window.AIStoreMaintenance) {
          return window.AIStoreMaintenance.getCacheInfo();
        }
        return { error: 'API not available' };
      },
      cacheUrls: async (urls: string[]) => {
        if (window.AIStoreMaintenance) {
          return window.AIStoreMaintenance.cacheUrls(urls);
        }
        return { error: 'API not available' };
      },
      checkResource: async (url: string) => {
        if (window.AIStoreMaintenance) {
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
serviceWorker.register();
