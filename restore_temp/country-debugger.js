/**
 * Скрипт для полного цикла отладки обновления страны пользователя
 * 
 * Этот скрипт выполняет:
 * 1. Авторизацию пользователя
 * 2. Получение продуктов до изменения страны
 * 3. Обновление страны пользователя
 * 4. Проверку обновленных данных пользователя
 * 5. Получение продуктов после изменения страны
 */

import fetch from 'node-fetch';

// Базовый URL API
const API_URL = "http://localhost:5000/api";

// Тестовые учетные данные
const USERNAME = "testuser";
const PASSWORD = "Test123!";

// Функция определения валюты для страны
function shouldUseEUR(country) {
  if (!country) return false;
  
  const eurCountryCodes = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  if (country.length === 2) {
    return eurCountryCodes.includes(country.toUpperCase());
  }
  
  const eurCountries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
  ];
  
  return eurCountries.includes(country);
}

// Получение валюты для страны
function getCurrencyForCountry(country) {
  return shouldUseEUR(country) ? 'EUR' : 'USD';
}

// Вспомогательная функция для форматирования вывода
function printDivider() {
  console.log("\n" + "=".repeat(60) + "\n");
}

// Вспомогательная функция для вывода объекта как JSON с отступами
function printJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

// Главная функция для тестирования
async function testFullCycle() {
  const cookies = { value: '' };
  let userId = null;
  
  printDivider();
  console.log("🔶 НАЧАЛО ПОЛНОГО ЦИКЛА ТЕСТИРОВАНИЯ СМЕНЫ СТРАНЫ");
  printDivider();
  
  try {
    // ШАГ 1: Авторизация пользователя
    console.log("🔷 ШАГ 1: Авторизация пользователя");
    
    const loginResponse = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: USERNAME,
        password: PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Ошибка авторизации: ${loginResponse.status}`);
    }
    
    const userData = await loginResponse.json();
    userId = userData.id;
    
    console.log("✅ Авторизация успешна");
    console.log("📋 Данные пользователя:");
    printJSON(userData);
    
    // Сохраняем cookie для последующих запросов
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies.value = setCookieHeader;
      console.log("🍪 Получены cookie для сессии");
    } else {
      console.warn("⚠️ Cookie не получены, возможны проблемы с аутентификацией");
    }
    
    // ШАГ 2: Получение продуктов до изменения страны
    printDivider();
    console.log("🔷 ШАГ 2: Получение продуктов ДО изменения страны");
    
    let originalCountry = userData.country || 'не указана';
    let originalCurrency = getCurrencyForCountry(userData.country);
    
    console.log(`📍 Текущая страна пользователя: ${originalCountry}`);
    console.log(`💰 Текущая валюта: ${originalCurrency}`);
    
    const productsResponse = await fetch(`${API_URL}/products${userData.country ? `?country=${userData.country}` : ''}`, {
      headers: {
        Cookie: cookies.value
      }
    });
    
    if (!productsResponse.ok) {
      throw new Error(`Ошибка получения продуктов: ${productsResponse.status}`);
    }
    
    const products = await productsResponse.json();
    
    console.log("✅ Продукты успешно получены");
    console.log(`📦 Получено ${products.length} продуктов`);
    
    if (products.length > 0) {
      console.log("📋 Первый продукт:");
      printJSON({
        id: products[0].id,
        title: products[0].title,
        price: products[0].price,
        priceEUR: products[0].priceEUR
      });
    }
    
    // ШАГ 3: Обновление страны пользователя
    printDivider();
    console.log("🔷 ШАГ 3: Обновление страны пользователя");
    
    // Выбираем новую страну - противоположную текущей
    const newCountry = originalCountry === 'US' ? 'DE' : 'US';
    const newCurrency = getCurrencyForCountry(newCountry);
    
    console.log(`🔄 Меняем страну с ${originalCountry} на ${newCountry}`);
    console.log(`🔄 Ожидаемая новая валюта: ${newCurrency}`);
    
    const updateResponse = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies.value
      },
      body: JSON.stringify({
        name: userData.name || "",
        phone: userData.phone || "",
        country: newCountry,
        street: userData.street || "",
        house: userData.house || "",
        apartment: userData.apartment || ""
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Ошибка обновления страны: ${updateResponse.status}`);
    }
    
    const updatedUserData = await updateResponse.json();
    
    console.log("✅ Страна пользователя успешно обновлена");
    console.log("📋 Обновленные данные пользователя:");
    printJSON(updatedUserData);
    
    // ШАГ 4: Проверка обновленных данных пользователя
    printDivider();
    console.log("🔷 ШАГ 4: Проверка обновленных данных пользователя");
    
    const meResponse = await fetch(`${API_URL}/users/me`, {
      headers: {
        Cookie: cookies.value
      }
    });
    
    if (!meResponse.ok) {
      throw new Error(`Ошибка получения данных пользователя: ${meResponse.status}`);
    }
    
    const currentUserData = await meResponse.json();
    
    console.log("✅ Данные пользователя успешно получены");
    console.log("📋 Текущие данные пользователя:");
    printJSON(currentUserData);
    
    // Проверяем, что страна действительно обновилась
    if (currentUserData.country !== newCountry) {
      console.error(`❌ ОШИБКА: Страна не обновилась. Ожидалось: ${newCountry}, получено: ${currentUserData.country}`);
    } else {
      console.log(`✅ Страна успешно обновлена на ${newCountry}`);
    }
    
    // ШАГ 5: Получение продуктов после изменения страны
    printDivider();
    console.log("🔷 ШАГ 5: Получение продуктов ПОСЛЕ изменения страны");
    
    // Получаем продукты с явным указанием страны в запросе
    const newProductsResponse = await fetch(`${API_URL}/products?country=${newCountry}`, {
      headers: {
        Cookie: cookies.value
      }
    });
    
    if (!newProductsResponse.ok) {
      throw new Error(`Ошибка получения продуктов: ${newProductsResponse.status}`);
    }
    
    const newProducts = await newProductsResponse.json();
    
    console.log("✅ Продукты успешно получены с новой страной");
    console.log(`📦 Получено ${newProducts.length} продуктов`);
    
    if (newProducts.length > 0) {
      console.log("📋 Первый продукт:");
      printJSON({
        id: newProducts[0].id,
        title: newProducts[0].title,
        price: newProducts[0].price,
        priceEUR: newProducts[0].priceEUR
      });
      
      // Определяем, какая цена должна использоваться с учетом новой страны
      const expectedPrice = newCurrency === 'EUR' ? newProducts[0].priceEUR : newProducts[0].price;
      console.log(`💰 Ожидаемая цена для отображения: ${expectedPrice} ${newCurrency}`);
    }
    
    // ИТОГ
    printDivider();
    console.log("🔶 ИТОГИ ТЕСТИРОВАНИЯ");
    printDivider();
    
    console.log(`✅ Исходная страна: ${originalCountry} (валюта: ${originalCurrency})`);
    console.log(`✅ Новая страна: ${currentUserData.country} (валюта: ${getCurrencyForCountry(currentUserData.country)})`);
    console.log(`✅ Данные успешно обновлены на сервере`);
    console.log(`ℹ️ Для обновления данных в браузере может потребоваться перезагрузка страницы`);
    
  } catch (error) {
    console.error("❌ ПРОИЗОШЛА ОШИБКА:");
    console.error(error);
  }
}

// Запускаем тестирование
testFullCycle();