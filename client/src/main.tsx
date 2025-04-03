import { createRoot } from "react-dom/client";
import App from "./App";
import AppCheck from "./AppCheck";
import "./index.css";
import { clearUserCache, clearAllCache, reloadPage, clearCacheAndReload } from "./utils/clearCache";

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

console.log("Инициализация приложения с проверкой ошибок хуков React");

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    // Используем AppCheck вместо App для перехвата ошибок хуков
    const root = createRoot(rootElement);
    root.render(<AppCheck />);
    console.log("Приложение успешно инициализировано");
  } catch (error) {
    console.error("Критическая ошибка при инициализации React:", error);
    
    // В случае критической ошибки показываем сообщение и ссылку на очистку кэша
    rootElement.innerHTML = `
      <div style="font-family: system-ui; max-width: 500px; margin: 100px auto; padding: 20px; text-align: center; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #e63946;">Ошибка загрузки приложения</h1>
        <p>Произошла критическая ошибка при загрузке приложения.</p>
        <p style="margin: 20px 0;">
          <a href="/force-update/" style="display: inline-block; background: #457b9d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Очистить кэш и перезагрузить
          </a>
        </p>
      </div>
    `;
  }
} else {
  console.error("Элемент #root не найден в DOM");
}
