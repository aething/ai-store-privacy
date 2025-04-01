import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { clearUserCache, clearAllCache, reloadPage, clearCacheAndReload } from "./utils/clearCache";
import * as serviceWorker from './registerServiceWorker';

// Инициализация отладочных функций
if (typeof window !== 'undefined') {
  window.appDebug = {
    clearUserCache: (preserveCountry = false) => clearUserCache(preserveCountry),
    clearAllCache,
    reloadPage,
    clearCacheAndReload: (preserveCountry = false) => clearCacheAndReload(preserveCountry)
  };
  
  console.log("🔍 Отладочные функции доступны через window.appDebug");
  console.log("📋 Примеры: window.appDebug.clearUserCache(), window.appDebug.clearCacheAndReload()");
}

createRoot(document.getElementById("root")!).render(<App />);

// Регистрация Service Worker для PWA функциональности
serviceWorker.register();
