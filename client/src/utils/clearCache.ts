/**
 * Утилита для очистки кэша приложения и обновления страны пользователя
 * Эта функция используется для принудительного обновления данных пользователя
 * из localStorage и сервера, гарантируя правильное отображение цен в валюте
 * соответствующей стране пользователя.
 */

import { User } from "@shared/schema";
import { clearAllCaches } from "@/lib/cache-utils";

// Вспомогательная функция для перезагрузки страницы 
export function reloadPage() {
  console.log('[clearCache] Reloading page...');
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

// Экспортируем функцию clearAllCache для совместимости с существующим кодом
export const clearAllCache = clearAllCaches;

/**
 * Очищает данные пользователя в localStorage, сохраняя настройки страны
 * @param preserveCountry Если true, сохраняем настройку страны пользователя
 */
export function clearUserCache(preserveCountry = false) {
  console.log('[clearCache] Clearing user cache...');
  
  // Сохраняем страну, если нужно
  let country = null;
  if (preserveCountry) {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      country = userData.country || null;
    } catch (e) {
      console.error('[clearCache] Error preserving country', e);
    }
  }
  
  // Удаляем данные пользователя
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  // Восстанавливаем страну, если нужно
  if (preserveCountry && country) {
    try {
      localStorage.setItem('country', country);
      console.log(`[clearCache] Preserved country: ${country}`);
    } catch (e) {
      console.error('[clearCache] Error saving country', e);
    }
  }
  
  console.log('[clearCache] User cache cleared');
}

/**
 * Очищает все кэши и перезагружает страницу
 * @param preserveCountry Если true, сохраняем настройку страны пользователя
 */
export function clearCacheAndReload(preserveCountry = false) {
  clearUserCache(preserveCountry);
  clearAllCaches().then(() => reloadPage());
}

/**
 * Очищает кэш приложения и запускает перезагрузку страницы
 * @param countryCode Код страны, который нужно установить (опционально)
 */
export async function clearAppCache(countryCode?: string): Promise<void> {
  console.log('[clearCache] Clearing application cache...');
  
  // Сохраняем данные пользователя, чтобы не потерять авторизацию
  let userData: User | null = null;
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      userData = JSON.parse(userJson);
      
      // Если указан код страны, обновляем его в данных пользователя
      if (countryCode && userData) {
        userData.country = countryCode;
        console.log(`[clearCache] Updated user country to: ${countryCode}`);
      }
    }
  } catch (e) {
    console.error('[clearCache] Error parsing user data:', e);
  }
  
  // Очищаем все кэши приложения через общую утилиту
  try {
    await clearAllCaches();
    console.log('[clearCache] Application caches cleared');
  } catch (e) {
    console.error('[clearCache] Error clearing caches:', e);
  }
  
  // Очищаем localStorage и sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Восстанавливаем данные пользователя, если они были
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('[clearCache] Restored user data with updated country');
  }
  
  // Перезагружаем страницу
  console.log('[clearCache] Reloading page...');
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

/**
 * Обновляет страну пользователя на указанную и перезагружает приложение
 * @param countryCode Код страны (например, 'US' или 'DE')
 */
export async function updateUserCountry(countryCode: string): Promise<void> {
  if (!countryCode || countryCode.length !== 2) {
    console.error('[updateUserCountry] Invalid country code:', countryCode);
    return;
  }
  
  console.log(`[updateUserCountry] Updating user country to: ${countryCode}`);
  await clearAppCache(countryCode);
}