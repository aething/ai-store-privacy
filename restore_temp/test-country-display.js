/**
 * Полный сценарий тестирования отображения цен в зависимости от страны пользователя
 * 
 * Этот скрипт выполняет следующие действия:
 * 1. Авторизует пользователя (если логин/пароль не предоставлены, использует тестового пользователя)
 * 2. Выполняет запрос на получение продуктов с сервера
 * 3. Проверяет текущую страну пользователя и отображаемую валюту
 * 4. Изменяет страну пользователя (если указан параметр newCountry)
 * 5. Проверяет обновленные данные и валюту
 * 
 * Использование:
 * node test-country-display.js [username] [password] [newCountry]
 * 
 * Примеры:
 * node test-country-display.js                   - проверка текущей страны для тестового пользователя
 * node test-country-display.js testuser Test123! - проверка текущей страны пользователя с указанными учетными данными
 * node test-country-display.js testuser Test123! DE - изменение страны пользователя на Германию
 * node test-country-display.js testuser Test123! US - изменение страны пользователя на США
 */

import fetch from 'node-fetch';
import fs from 'fs';

// Параметры из командной строки
const username = process.argv[2] || 'testuser';
const password = process.argv[3] || 'Test123!';
const newCountry = process.argv[4]; // Опциональный параметр для смены страны

// HTTP клиент с поддержкой сессионных Cookie
let cookies = [];

// Функция для определения валюты по стране
function shouldUseEUR(country) {
  if (!country) return false;
  
  // EU country codes
  const eurCountryCodes = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  // Checking for country code (if length is 2 characters)
  if (country.length === 2) {
    return eurCountryCodes.includes(country.toUpperCase());
  }
  
  // EU country names
  const eurCountries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
  ];
  
  // Check for full country name
  return eurCountries.includes(country);
}

// Функция для добавления полученных куки в массив
function updateCookies(response) {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Получаем новые куки и добавляем в массив
    const newCookies = setCookieHeader.split(',').map(c => c.split(';')[0]);
    cookies = [...cookies, ...newCookies];
  }
}

// Функция для выполнения HTTP запросов с куки
async function fetchWithCookies(url, options = {}) {
  const headers = {
    ...options.headers,
    Cookie: cookies.join('; ')
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  updateCookies(response);
  return response;
}

// Функция печати разделителя для вывода в консоль
function printDivider() {
  console.log('\n' + '='.repeat(70) + '\n');
}

// Функция для удобного отображения информации о стране и валюте
function printCurrencyInfo(country, expectedCurrency) {
  console.log(`Информация о стране и валюте:`);
  console.log(`- Страна пользователя: ${country || 'не указана'}`);
  console.log(`- Ожидаемая валюта: ${expectedCurrency}`);
  console.log(`- Используем EUR: ${shouldUseEUR(country) ? 'Да' : 'Нет'}`);
}

// Функция для анализа JSON ответа
async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    console.error('Ошибка при разборе JSON:', error);
    console.log('Ответ сервера:', await response.text());
    throw error;
  }
}

// Основная функция для тестирования
async function runTest() {
  try {
    // Шаг 1: Авторизация
    console.log(`Выполняем вход как ${username}...`);
    
    // Отправляем запрос на авторизацию
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    // Сохраняем полученные куки
    updateCookies(loginResponse);
    
    if (!loginResponse.ok) {
      throw new Error(`Ошибка авторизации: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const user = await parseJsonResponse(loginResponse);
    
    console.log('Успешно авторизован!');
    console.log(`- ID пользователя: ${user.id}`);
    console.log(`- Имя пользователя: ${user.username}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Страна: ${user.country || 'не указана'}`);
    
    // Определяем валюту на основе страны
    const currency = shouldUseEUR(user.country) ? 'EUR' : 'USD';
    console.log(`- Ожидаемая валюта: ${currency}`);
    
    printDivider();
    
    // Шаг 2: Получение списка продуктов
    console.log('Запрашиваем список продуктов...');
    
    const productsResponse = await fetchWithCookies('http://localhost:5000/api/products');
    
    if (!productsResponse.ok) {
      throw new Error(`Ошибка получения продуктов: ${productsResponse.status} ${productsResponse.statusText}`);
    }
    
    const products = await parseJsonResponse(productsResponse);
    
    console.log(`Получено ${products.length} продуктов`);
    
    // Выводим информацию о первом продукте
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('\nПример продукта:');
      console.log(`- ID: ${firstProduct.id}`);
      console.log(`- Название: ${firstProduct.title}`);
      console.log(`- Цена в USD: ${firstProduct.price}`);
      console.log(`- Цена в EUR: ${firstProduct.priceEUR}`);
      
      // Выводим, какая цена должна отображаться
      const displayPrice = currency === 'EUR' ? firstProduct.priceEUR : firstProduct.price;
      console.log(`- Отображаемая цена: ${displayPrice} ${currency}`);
    }
    
    printDivider();
    
    // Шаг 3: Изменение страны пользователя (если указан параметр)
    if (newCountry) {
      console.log(`Меняем страну пользователя на: ${newCountry}`);
      
      const updateResponse = await fetchWithCookies(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user.name || '',
          phone: user.phone || '',
          country: newCountry,
          street: user.street || '',
          house: user.house || '',
          apartment: user.apartment || ''
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Ошибка изменения страны: ${updateResponse.status} ${updateResponse.statusText}`);
      }
      
      const updatedUser = await parseJsonResponse(updateResponse);
      const newCurrency = shouldUseEUR(updatedUser.country) ? 'EUR' : 'USD';
      
      console.log('\nПрофиль пользователя обновлен:');
      console.log(`- ID: ${updatedUser.id}`);
      console.log(`- Страна: ${updatedUser.country}`);
      console.log(`- Ожидаемая валюта: ${newCurrency}`);
      
      printDivider();
      
      // Шаг 4: Получаем продукты после изменения страны
      console.log('Запрашиваем продукты с новой страной...');
      
      const updatedProductsResponse = await fetchWithCookies(`http://localhost:5000/api/products?country=${newCountry}`);
      
      if (!updatedProductsResponse.ok) {
        throw new Error(`Ошибка получения продуктов: ${updatedProductsResponse.status} ${updatedProductsResponse.statusText}`);
      }
      
      const updatedProducts = await parseJsonResponse(updatedProductsResponse);
      
      if (updatedProducts.length > 0) {
        const firstProduct = updatedProducts[0];
        console.log('\nПример продукта с новой валютой:');
        console.log(`- ID: ${firstProduct.id}`);
        console.log(`- Название: ${firstProduct.title}`);
        console.log(`- Цена в USD: ${firstProduct.price}`);
        console.log(`- Цена в EUR: ${firstProduct.priceEUR}`);
        
        // Выводим, какая цена должна отображаться
        const displayPrice = newCurrency === 'EUR' ? firstProduct.priceEUR : firstProduct.price;
        console.log(`- Отображаемая цена: ${displayPrice} ${newCurrency}`);
      }
    }
    
    printDivider();
    console.log('Тестирование завершено успешно! 🎉');
    
    // Сообщение-инструкция пользователю
    console.log('\n✅ Для применения изменений в браузере:');
    console.log('1. Обновите страницу');
    console.log('2. Или используйте функцию window.appDebug.clearCacheAndReload() в консоли браузера');
    console.log('3. Для отладки также доступна страница cache-busting-country-info.html');
  } catch (error) {
    console.error('Произошла ошибка:', error);
    process.exit(1);
  }
}

// Запускаем тест
runTest();