/**
 * Отладочный скрипт для изменения страны пользователя и проверки сессии
 * 
 * Этот скрипт выполняет детальную отладку и показывает все подробности о текущей сессии и
 * процессе обновления страны пользователя.
 * 
 * Использование:
 * node country-debug.js testuser Test123! DE
 * 
 * Аргументы:
 * 1. Имя пользователя
 * 2. Пароль
 * 3. Новая страна (DE для Германии, US для США и т.д.)
 */

const fetch = require('node-fetch');
const fs = require('fs');

// Константы
const API_BASE_URL = 'http://localhost:5000';

// Получение аргументов командной строки
const username = process.argv[2];
const password = process.argv[3];
const newCountry = process.argv[4];

// Хранение сессионных данных
let sessionCookies = [];
let userId = null;

// Функции для форматированного вывода
const log = (message) => console.log(`INFO: ${message}`);
const warn = (message) => console.log(`\x1b[33mWARN: ${message}\x1b[0m`);
const error = (message) => console.log(`\x1b[31mERROR: ${message}\x1b[0m`);
const success = (message) => console.log(`\x1b[32mSUCCESS: ${message}\x1b[0m`);
const logJson = (label, obj) => console.log(`${label}:\n`, JSON.stringify(obj, null, 2));

// Функция для обновления куки из ответа
function updateCookies(response) {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    const newCookies = setCookieHeader.split(',').map(c => c.split(';')[0]);
    for (const cookie of newCookies) {
      // Удаляем существующие куки с таким же именем
      const cookieName = cookie.split('=')[0];
      sessionCookies = sessionCookies.filter(c => !c.startsWith(`${cookieName}=`));
      // Добавляем новую куку
      sessionCookies.push(cookie);
    }
    log(`Получены новые куки: ${newCookies.join(', ')}`);
  }
}

// Функция для HTTP запросов с сессионными куки
async function fetchWithSession(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const headers = {
    ...options.headers,
    Cookie: sessionCookies.join('; ')
  };
  
  log(`Запрос: ${options.method || 'GET'} ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });
    
    log(`Ответ: ${response.status} ${response.statusText}`);
    updateCookies(response);
    
    return response;
  } catch (err) {
    error(`Ошибка сетевого запроса: ${err.message}`);
    throw err;
  }
}

// Функция для авторизации
async function login(username, password) {
  log(`Авторизация пользователя ${username}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    updateCookies(response);
    
    if (!response.ok) {
      throw new Error(`HTTP ошибка ${response.status}: ${response.statusText}`);
    }
    
    const userData = await response.json();
    userId = userData.id;
    
    success(`Успешная авторизация! ID пользователя: ${userId}`);
    logJson('Данные пользователя', userData);
    
    return userData;
  } catch (err) {
    error(`Ошибка авторизации: ${err.message}`);
    throw err;
  }
}

// Функция для получения данных текущего пользователя
async function getCurrentUser() {
  log('Получение данных текущего пользователя...');
  
  try {
    const response = await fetchWithSession('/api/users/me');
    
    if (!response.ok) {
      if (response.status === 401) {
        warn('Пользователь не авторизован (401 Unauthorized)');
        return null;
      }
      throw new Error(`HTTP ошибка ${response.status}: ${response.statusText}`);
    }
    
    const userData = await response.json();
    success('Данные пользователя получены успешно');
    logJson('Данные пользователя', userData);
    
    return userData;
  } catch (err) {
    error(`Ошибка получения данных пользователя: ${err.message}`);
    return null;
  }
}

// Функция для проверки, использует ли страна евро
function shouldUseEUR(country) {
  // Список стран еврозоны
  const euroCountries = [
    'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 
    'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'HR',
    'BG', 'CZ', 'DK', 'HU', 'PL', 'RO', 'SE'
  ];
  
  return euroCountries.includes(country);
}

// Функция для определения валюты на основе страны
function getCurrencyForCountry(country) {
  return shouldUseEUR(country) ? 'EUR' : 'USD';
}

// Функция для обновления страны пользователя
async function updateUserCountry(userId, country) {
  log(`Обновление страны пользователя ${userId} на ${country}...`);
  
  try {
    const response = await fetchWithSession(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '',
        phone: '',
        country: country,
        street: '',
        house: '',
        apartment: ''
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ошибка ${response.status}: ${response.statusText}`);
    }
    
    const updatedData = await response.json();
    success(`Страна пользователя обновлена на ${country}`);
    logJson('Обновленные данные', updatedData);
    
    // Вычисляем ожидаемую валюту для новой страны
    const expectedCurrency = getCurrencyForCountry(country);
    log(`Ожидаемая валюта для страны ${country}: ${expectedCurrency}`);
    
    return updatedData;
  } catch (err) {
    error(`Ошибка обновления страны: ${err.message}`);
    throw err;
  }
}

// Функция для получения всех товаров
async function getProducts() {
  log('Получение списка товаров...');
  
  try {
    const response = await fetchWithSession('/api/products');
    
    if (!response.ok) {
      throw new Error(`HTTP ошибка ${response.status}: ${response.statusText}`);
    }
    
    const products = await response.json();
    success(`Получено ${products.length} товаров`);
    
    // Выводим информацию о ценах в разных валютах
    products.forEach(product => {
      log(`Товар: ${product.title}`);
      log(`  - Цена USD: ${product.price}`);
      log(`  - Цена EUR: ${product.priceEUR || 'не указана'}`);
    });
    
    return products;
  } catch (err) {
    error(`Ошибка получения товаров: ${err.message}`);
    return [];
  }
}

// Проверка состояния localStorage в браузере
function checkLocalStorageStatus() {
  log('Для полной диагностики выполните следующие команды в консоли браузера:');
  console.log(`
  // Проверить текущие данные пользователя в localStorage
  console.log('User in localStorage:', JSON.parse(localStorage.getItem('user')));
  
  // Проверить текущие данные в контексте React приложения
  console.log('User in React context:', window.debugContext ? window.debugContext.user : 'Debug context not available');
  
  // Очистить кэш и перезагрузить страницу
  if (window.appDebug && window.appDebug.clearCacheAndReload) {
    // Сохраняем информацию о стране
    window.appDebug.clearCacheAndReload(true);
  } else {
    console.log('Debug functions not available');
  }
  `);
}

// Функция для вывода расширенной отладочной информации
function outputDebugInfo() {
  console.log('\n====== ОТЛАДОЧНАЯ ИНФОРМАЦИЯ ======\n');
  log('Информация о сессии:');
  log(`Количество активных куки: ${sessionCookies.length}`);
  log(`Куки: ${sessionCookies.join('; ')}`);
  
  log('\nИнформация о пользователе:');
  log(`ID пользователя: ${userId || 'не определен'}`);
  
  console.log('\n====== СЛЕДУЮЩИЕ ШАГИ ======\n');
  log('1. Обновите страницу в браузере');
  log('2. Проверьте валюту на карточках товаров');
  log('3. Проверьте данные в localStorage');
  
  checkLocalStorageStatus();
}

// Основная функция
async function main() {
  console.log('===== ОТЛАДКА СМЕНЫ СТРАНЫ ПОЛЬЗОВАТЕЛЯ =====\n');
  
  if (!username || !password || !newCountry) {
    error('Необходимо указать имя пользователя, пароль и новую страну');
    console.log('Пример: node country-debug.js testuser Test123! DE');
    return;
  }
  
  try {
    // Шаг 1: Авторизация
    await login(username, password);
    
    // Шаг 2: Получение текущего пользователя
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      error('Не удалось получить данные текущего пользователя');
      return;
    }
    
    // Шаг 3: Получение товаров до изменения страны
    log('\n--- Товары до изменения страны ---');
    const productsBefore = await getProducts();
    
    // Шаг 4: Обновление страны пользователя
    log('\n--- Обновление страны пользователя ---');
    await updateUserCountry(currentUser.id, newCountry);
    
    // Шаг 5: Проверка обновленных данных пользователя
    log('\n--- Проверка обновленных данных пользователя ---');
    const updatedUser = await getCurrentUser();
    if (!updatedUser) {
      error('Не удалось получить обновленные данные пользователя');
      return;
    }
    
    // Шаг 6: Получение товаров после изменения страны
    log('\n--- Товары после изменения страны ---');
    const productsAfter = await getProducts();
    
    // Вывод отладочной информации
    outputDebugInfo();
    
  } catch (err) {
    error(`Произошла ошибка во время выполнения: ${err.message}`);
  }
}

// Запуск скрипта
main();