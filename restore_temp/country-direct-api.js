/**
 * Скрипт для прямого управления страной пользователя через API
 * 
 * Использование:
 * node country-direct-api.js login testuser Test123!
 * node country-direct-api.js get
 * node country-direct-api.js set US
 * node country-direct-api.js set DE
 * 
 * Этот скрипт напрямую вызывает API без взаимодействия с браузером,
 * что помогает обойти проблемы с кэшированием и состоянием сессии.
 */

import fetch from 'node-fetch';
import fs from 'fs';

// Основные параметры
const API_URL = 'http://localhost:5000';
const COOKIE_FILE = 'user-cookie.txt';

// Сессионные данные
let sessionCookie = '';
let currentUserId = null;

// Вспомогательные функции для вывода информации
const log = (msg) => console.log(`\x1b[32m[INFO]\x1b[0m ${msg}`);
const error = (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`);
const divider = () => console.log('-'.repeat(60));

// Загрузка сохраненных cookie из файла
function loadCookieFromFile() {
  try {
    if (fs.existsSync(COOKIE_FILE)) {
      sessionCookie = fs.readFileSync(COOKIE_FILE, 'utf8').trim();
      log(`Загружены сохраненные cookie: ${sessionCookie.substring(0, 20)}...`);
      return true;
    }
  } catch (err) {
    error(`Ошибка загрузки cookie: ${err.message}`);
  }
  return false;
}

// Сохранение cookie в файл
function saveCookieToFile(cookie) {
  try {
    fs.writeFileSync(COOKIE_FILE, cookie);
    log(`Cookie сохранены в файл ${COOKIE_FILE}`);
  } catch (err) {
    error(`Ошибка при сохранении cookie: ${err.message}`);
  }
}

// Выполнение HTTP запроса с сессионным cookie
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    ...options.headers,
    ...(sessionCookie ? { 'Cookie': sessionCookie } : {})
  };
  
  log(`HTTP ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Проверяем и сохраняем Set-Cookie
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
      log(`Получен новый cookie: ${sessionCookie}`);
      saveCookieToFile(sessionCookie);
    }
    
    return response;
  } catch (err) {
    error(`Ошибка запроса: ${err.message}`);
    throw err;
  }
}

// Авторизация пользователя
async function login(username, password) {
  log(`Авторизация пользователя: ${username}`);
  
  try {
    const response = await apiRequest('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      error(`Ошибка авторизации: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const userData = await response.json();
    currentUserId = userData.id;
    
    log(`Успешная авторизация! ID пользователя: ${currentUserId}`);
    console.log('Данные пользователя:', userData);
    
    return true;
  } catch (err) {
    error(`Ошибка входа: ${err.message}`);
    return false;
  }
}

// Получение данных текущего пользователя
async function getCurrentUser() {
  log('Запрос данных текущего пользователя');
  
  try {
    const response = await apiRequest('/api/users/me');
    
    if (!response.ok) {
      if (response.status === 401) {
        error('Требуется авторизация - выполните команду login');
        return null;
      }
      
      error(`Ошибка получения данных: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const userData = await response.json();
    currentUserId = userData.id;
    
    log(`Данные текущего пользователя (ID: ${currentUserId}):`);
    console.log(userData);
    
    return userData;
  } catch (err) {
    error(`Ошибка запроса пользователя: ${err.message}`);
    return null;
  }
}

// Изменение страны пользователя
async function updateUserCountry(userId, country) {
  log(`Обновление страны пользователя ${userId} на ${country}`);
  
  try {
    const response = await apiRequest(`/api/users/${userId}`, {
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
      error(`Ошибка обновления страны: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const updatedData = await response.json();
    log('Страна пользователя успешно обновлена!');
    console.log('Обновленные данные:', updatedData);
    
    return true;
  } catch (err) {
    error(`Ошибка обновления страны: ${err.message}`);
    return false;
  }
}

// Основная функция управления скриптом
async function main() {
  divider();
  log('Скрипт прямого управления страной пользователя');
  divider();
  
  // Загружаем сохраненные cookie
  loadCookieFromFile();
  
  // Получаем команду и параметры
  const command = process.argv[2]?.toLowerCase();
  const param1 = process.argv[3];
  const param2 = process.argv[4];
  
  if (!command) {
    console.log(`
Использование:
  node country-direct-api.js login <username> <password>  - авторизация
  node country-direct-api.js get                          - получение данных
  node country-direct-api.js set <country>                - изменение страны (например, 'US' или 'DE')
    `);
    return;
  }
  
  // Обработка команд
  switch (command) {
    case 'login':
      if (!param1 || !param2) {
        error('Необходимо указать имя пользователя и пароль');
        return;
      }
      await login(param1, param2);
      break;
      
    case 'get':
      await getCurrentUser();
      break;
      
    case 'set':
      if (!param1) {
        error('Необходимо указать код страны (например, US или DE)');
        return;
      }
      
      // Если не указан ID пользователя, пытаемся получить его
      if (!currentUserId) {
        const user = await getCurrentUser();
        if (!user) {
          error('Не удалось определить ID пользователя. Выполните команду login');
          return;
        }
      }
      
      await updateUserCountry(currentUserId, param1);
      break;
      
    default:
      error(`Неизвестная команда: ${command}`);
      break;
  }
  
  divider();
}

// Запуск скрипта
main().catch(err => {
  error(`Необработанная ошибка: ${err.message}`);
  console.error(err);
});