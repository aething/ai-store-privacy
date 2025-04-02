/**
 * Модуль связи Service Worker для Android/Capacitor
 * 
 * Этот скрипт содержит дополнительный код для работы с PWA в контексте
 * Android-приложения через Capacitor.
 */

// Идентификатор для Android-специфичного кэша
const ANDROID_CACHE_NAME = 'ai-store-android-v1';

// Кэширование ресурсов специально для Android
self.addEventListener('message', async (event) => {
  // Обрабатываем сообщения для Android-приложения
  if (event.data && event.data.type === 'ANDROID_INIT') {
    console.log('[SW Android Bridge] Инициализация Android режима', event.data.timeStamp);
    
    // Активируем Android-специфичные функции
    await warmupAndroidCache();
    
    // Отправляем подтверждение инициализации
    if (event.source) {
      event.source.postMessage({
        type: 'ANDROID_INIT_RESPONSE',
        success: true,
        timeStamp: Date.now()
      });
    }
  }
  
  // Специальный обработчик для кэширования Android-ресурсов
  if (event.data && event.data.type === 'CACHE_ANDROID_RESOURCES') {
    const urls = event.data.payload?.urls || [];
    
    if (urls.length > 0) {
      try {
        await cacheAndroidResources(urls);
        event.ports[0].postMessage({
          type: 'CACHE_ANDROID_RESOURCES_RESPONSE',
          payload: { success: true, count: urls.length }
        });
      } catch (error) {
        console.error('[SW Android Bridge] Ошибка кэширования ресурсов:', error);
        event.ports[0].postMessage({
          type: 'CACHE_ANDROID_RESOURCES_ERROR',
          payload: { error: error.message || 'Ошибка кэширования' }
        });
      }
    } else {
      event.ports[0].postMessage({
        type: 'CACHE_ANDROID_RESOURCES_ERROR',
        payload: { error: 'Пустой список URL для кэширования' }
      });
    }
  }
});

/**
 * Предварительное наполнение кэша для Android
 */
async function warmupAndroidCache() {
  try {
    const cache = await caches.open(ANDROID_CACHE_NAME);
    
    // Основные ресурсы, необходимые для Android-приложения
    const androidEssentialResources = [
      '/',
      '/index.html',
      '/manifest.json',
      '/favicon.ico',
      '/logo192.png',
      '/logo512.png',
      '/offline-enhanced.html',
      '/index.css'
    ];
    
    await Promise.all(
      androidEssentialResources.map(async (url) => {
        try {
          const request = new Request(url);
          const response = await fetch(request, { cache: 'reload' });
          if (response.ok) {
            await cache.put(request, response.clone());
            console.log(`[SW Android Bridge] Кэширован ресурс: ${url}`);
          }
        } catch (err) {
          console.warn(`[SW Android Bridge] Не удалось кэшировать ${url}:`, err);
        }
      })
    );
    
    console.log('[SW Android Bridge] Android кэш инициализирован');
    return true;
  } catch (error) {
    console.error('[SW Android Bridge] Ошибка при инициализации Android кэша:', error);
    return false;
  }
}

/**
 * Кэширует ресурсы для Android-приложения
 */
async function cacheAndroidResources(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return false;
  }
  
  try {
    const cache = await caches.open(ANDROID_CACHE_NAME);
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const request = new Request(url);
          const response = await fetch(request, { cache: 'reload' });
          
          if (response.ok) {
            await cache.put(request, response.clone());
            return { url, success: true };
          } else {
            return { url, success: false, status: response.status };
          }
        } catch (error) {
          return { url, success: false, error: error.message };
        }
      })
    );
    
    const successful = results.filter(r => r.success).length;
    console.log(`[SW Android Bridge] Кэшировано ${successful}/${urls.length} ресурсов`);
    
    return results;
  } catch (error) {
    console.error('[SW Android Bridge] Ошибка при кэшировании ресурсов:', error);
    throw error;
  }
}

console.log('[SW Android Bridge] Модуль Android-интеграции загружен');