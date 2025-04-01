/**
 * Скрипт для проверки состояния локального хранилища и статуса авторизации
 * 
 * Как использовать:
 * 1. Запустите этот скрипт в консоли браузера на странице вашего приложения
 * 2. Он покажет текущего пользователя и его данные, включая страну и валюту
 * 
 * Для запуска в консоли:
 * - Скопируйте весь скрипт и вставьте в консоль
 * - Или загрузите скрипт как файл JavaScript в браузер
 */

(function checkLoginStatus() {
  console.log("=== ПРОВЕРКА АВТОРИЗАЦИИ ===");
  
  try {
    // Проверяем наличие данных пользователя в localStorage
    const userStr = localStorage.getItem("user");
    
    if (!userStr) {
      console.log("🔴 Пользователь НЕ авторизован в localStorage");
      console.log("Рекомендации: выполните вход в систему");
      return;
    }
    
    // Парсим данные пользователя
    const user = JSON.parse(userStr);
    console.log("🟢 Пользователь авторизован в localStorage");
    
    // Проверяем информацию о стране и определяем валюту
    const country = user.country || "Не указана";
    
    let currencyInfo = "USD (доллары США)";
    let europeanStatus = "Не европейская страна";
    
    // Проверяем, является ли страна европейской
    if (country) {
      const euCountries = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
      ];
      
      if (euCountries.includes(country.toUpperCase())) {
        currencyInfo = "EUR (евро)";
        europeanStatus = "Европейская страна (зона EUR)";
      }
    }
    
    // Выводим информацию о пользователе
    console.log(`
=== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ===
ID: ${user.id || "Не задан"}
Имя пользователя: ${user.username || "Не задано"}
Email: ${user.email || "Не задан"}
Статус верификации: ${user.isVerified ? "✓ Подтвержден" : "✗ Не подтвержден"}
Страна: ${country}
Валюта: ${currencyInfo}
Статус страны: ${europeanStatus}

Полные данные пользователя:`, user);
    
    // Проверяем статус авторизации на сервере
    console.log("Проверка статуса авторизации на сервере...");
    
    // Асинхронная проверка статуса на сервере
    fetch("/api/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include" // Важно для отправки cookies
    })
    .then(response => {
      if (response.ok) {
        return response.json().then(serverUser => {
          console.log("🟢 Сессия на сервере активна");
          console.log("Данные пользователя с сервера:", serverUser);
          
          // Проверяем синхронизацию между localStorage и сервером
          if (serverUser.id === user.id) {
            console.log("✓ Данные пользователя в localStorage и на сервере синхронизированы");
            
            // Проверяем синхронизацию страны
            if (serverUser.country !== user.country) {
              console.log("⚠️ Страна в localStorage и на сервере различаются:");
              console.log(`   - localStorage: ${user.country || "не указана"}`);
              console.log(`   - Сервер: ${serverUser.country || "не указана"}`);
              console.log("   Рекомендуется обновить страну с помощью updateCountry-session.js");
            }
          } else {
            console.log("⚠️ Данные пользователя в localStorage и на сервере НЕ совпадают");
            console.log(`   - ID в localStorage: ${user.id}`);
            console.log(`   - ID на сервере: ${serverUser.id}`);
            console.log("   Рекомендуется перелогиниться для синхронизации данных");
          }
        });
      } else {
        console.log("🔴 Сессия на сервере НЕ активна");
        console.log("Вы авторизованы локально, но не авторизованы на сервере");
        console.log("Рекомендуется перелогиниться для восстановления сессии");
      }
    })
    .catch(error => {
      console.error("Ошибка при проверке статуса на сервере:", error);
    });
    
  } catch (error) {
    console.error("Ошибка при проверке авторизации:", error);
  }
})();