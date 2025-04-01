/**
 * Скрипт для быстрого обновления страны пользователя (для вставки в консоль)
 * Версия с обновлением на сервере через API и сессию
 */

// Функция для обновления страны пользователя
async function updateCountry(countryCode) {
  try {
    // Проверяем, что код страны передан и не пустой
    if (!countryCode) {
      console.error("Код страны не указан");
      return;
    }
    
    // Получаем информацию о текущем пользователе из localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.error("Пользователь не авторизован (нет данных в localStorage)");
      return;
    }
    
    // Парсим данные пользователя
    const user = JSON.parse(userStr);
    console.log("Текущие данные пользователя:", user);
    
    // Создаем объект с данными для обновления
    // Сохраняем все текущие значения и обновляем только страну
    const updateData = {
      name: user.name || "",
      phone: user.phone || "",
      country: countryCode,
      street: user.street || "",
      house: user.house || "",
      apartment: user.apartment || ""
    };
    
    console.log("Данные для обновления:", updateData);
    
    // Выполняем запрос на обновление данных пользователя
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateData),
      credentials: "include" // Важно для отправки cookies
    });
    
    // Обрабатываем ответ
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка обновления данных пользователя: ${errorText}`);
    }
    
    // Получаем обновленные данные пользователя
    const updatedUser = await response.json();
    console.log("Обновленные данные пользователя:", updatedUser);
    
    // Обновляем пользователя в localStorage
    localStorage.setItem("user", JSON.stringify({
      ...user,
      ...updatedUser
    }));
    
    // Обновляем интерфейс - перезагружаем страницу для применения изменений
    console.log("Обновление завершено. Перезагрузите страницу для применения изменений");
    
    // Показываем информацию о валюте
    let currencyInfo = "USD (доллары США)";
    if (isEuropeanCountry(countryCode)) {
      currencyInfo = "EUR (евро)";
    }
    
    // Выводим успешное сообщение
    console.log(`=== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ОБНОВЛЕН ===
User ID: ${user.id}
Username: ${user.username}
Country: ${countryCode}
Валюта: ${currencyInfo}

Обновите страницу приложения для применения изменений.`);
    
    return true;
  } catch (error) {
    // Выводим ошибку в консоль
    console.error("Ошибка при обновлении страны:", error.message);
    return false;
  }
}

// Функция для проверки, является ли страна европейской
function isEuropeanCountry(countryCode) {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  // Приводим код страны к верхнему регистру для надежного сравнения
  const normalizedCode = countryCode.toUpperCase();
  
  return euCountries.includes(normalizedCode);
}

// Для выполнения в консоли разработчика в браузере
console.log('Функция updateCountry готова к использованию.');
console.log('Пример использования:');
console.log('- updateCountry("US") - установить страну США (USD)');
console.log('- updateCountry("DE") - установить страну Германия (EUR)');

// Если скрипт выполняется напрямую с параметрами, используем их
if (typeof process !== 'undefined' && process.argv && process.argv.length > 2) {
  updateCountry(process.argv[2]);
}