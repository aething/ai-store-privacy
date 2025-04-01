/**
 * Скрипт для принудительного изменения страны пользователя на Германию (DE)
 * с автоматическим обновлением кэша и сессии
 * 
 * Использование:
 * node force-country.js
 * 
 * После выполнения скрипта будет создан файл user-update.js, который нужно 
 * выполнить в консоли браузера для обновления сессии.
 */

import fetch from 'node-fetch';
import fs from 'fs';

// Основные параметры
const API_URL = 'http://localhost:5000'; // Локальный URL для использования внутри Replit
const COOKIE_FILE = 'user-cookie.txt';
const BROWSER_SCRIPT_FILE = 'user-update.js';
const USERNAME = 'testuser';
const PASSWORD = 'Test123!';
const TARGET_COUNTRY = 'DE'; // Германия - евро зона

// Вспомогательные функции для вывода информации
const log = (msg) => console.log(`\x1b[32m[INFO]\x1b[0m ${msg}`);
const error = (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`);
const divider = () => console.log('-'.repeat(60));

// Очистка сессионного cookie
let sessionCookie = '';
let currentUser = null;

// Функция для выполнения API запросов
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Добавляем cookie в заголовки, если они есть
  if (sessionCookie) {
    options.headers = {
      ...options.headers,
      'Cookie': sessionCookie
    };
  }
  
  log(`HTTP ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, options);
    
    // Сохраняем cookie из ответа, если они есть
    if (response.headers.get('set-cookie')) {
      sessionCookie = response.headers.get('set-cookie');
      fs.writeFileSync(COOKIE_FILE, sessionCookie);
      log(`Новая сессия сохранена: ${sessionCookie.substring(0, 20)}...`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    error(`API запрос не удался: ${err.message}`);
    throw err;
  }
}

// Авторизация пользователя
async function login(username, password) {
  log(`Авторизация пользователя: ${username}`);
  
  const userData = await apiRequest('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  currentUser = userData;
  log(`Успешная авторизация! ID пользователя: ${userData.id}`);
  log(`Данные пользователя: ${JSON.stringify(userData, null, 2)}`);
  
  return userData;
}

// Получение данных текущего пользователя
async function getCurrentUser() {
  log('Запрос данных текущего пользователя');
  
  try {
    const userData = await apiRequest('/api/users/me');
    currentUser = userData;
    
    log(`Данные текущего пользователя (ID: ${userData.id}):`);
    log(JSON.stringify(userData, null, 2));
    
    return userData;
  } catch (err) {
    error('Ошибка получения данных пользователя. Возможно, сессия устарела.');
    return null;
  }
}

// Обновление страны пользователя
async function updateUserCountry(userId, country) {
  log(`Обновление страны пользователя ${userId} на ${country}`);
  
  const updatedData = await apiRequest(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '',
      phone: '',
      country: country,
      street: '',
      house: '',
      apartment: ''
    })
  });
  
  log('Страна пользователя успешно обновлена!');
  log(`Обновленные данные: ${JSON.stringify(updatedData, null, 2)}`);
  
  return updatedData;
}

// Генерация JavaScript для обновления данных в браузере
function generateBrowserScript(user) {
  const script = `
// Скрипт для обновления данных пользователя в браузере
// Запустите этот код в консоли разработчика на странице сайта

// Очистим существующую сессию
console.log('1. Очистка данных сессии...');
localStorage.removeItem('user');
sessionStorage.clear();

// Установим нового пользователя с правильной страной
console.log('2. Установка обновленных данных пользователя...');
const userData = ${JSON.stringify(user, null, 2)};
localStorage.setItem('user', JSON.stringify(userData));

console.log('3. Перезагрузка страницы для применения изменений...');
setTimeout(() => {
  window.location.reload();
}, 500);

console.log('Готово! Страна пользователя обновлена на: ${user.country}');
`;

  fs.writeFileSync(BROWSER_SCRIPT_FILE, script);
  log(`Скрипт для браузера сохранен в файл: ${BROWSER_SCRIPT_FILE}`);
  
  return script;
}

// Основная функция
async function main() {
  divider();
  log('Скрипт принудительной установки страны пользователя на Германию (DE)');
  divider();
  
  try {
    // Шаг 1: Авторизация пользователя
    await login(USERNAME, PASSWORD);
    
    // Шаг 2: Обновление страны пользователя на DE (Германия)
    const updatedUser = await updateUserCountry(currentUser.id, TARGET_COUNTRY);
    
    // Шаг 3: Генерация скрипта для обновления данных в браузере
    generateBrowserScript(updatedUser);
    
    // Инструкции для пользователя
    divider();
    log('ИНСТРУКЦИИ:');
    log('1. Для применения изменений откройте инструменты разработчика в браузере (F12)');
    log('2. Перейдите на вкладку Console (Консоль)');
    log(`3. Скопируйте и вставьте содержимое файла ${BROWSER_SCRIPT_FILE} в консоль`);
    log('4. Нажмите Enter для выполнения');
    log('5. После перезагрузки страницы страна пользователя будет изменена на DE (Германия)');
    divider();
  } catch (err) {
    error(`Произошла ошибка: ${err.message}`);
  }
}

// Запуск скрипта
main();