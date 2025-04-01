/**
 * Скрипт для обновления страны пользователя с поддержкой ES модулей
 * 
 * Использование:
 * node update-country.mjs US - обновить страну пользователя на США
 * node update-country.mjs DE - обновить страну пользователя на Германию
 */

import { readFileSync } from 'fs';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';

// Получение кода страны из параметров командной строки
const countryCode = process.argv[2];

if (!countryCode) {
  console.error("Ошибка: код страны не указан.");
  console.log("Использование: node update-country.mjs COUNTRY_CODE");
  console.log("Например: node update-country.mjs DE");
  process.exit(1);
}

// Проверяем, является ли страна европейской
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

// Главная функция для обновления страны
async function updateUserCountry() {
  try {
    console.log(`Обновляем страну пользователя с ID 1 на ${countryCode}...`);
    
    // Читаем файл cookie для авторизации
    let cookieContent;
    try {
      cookieContent = readFileSync('cookie.txt', 'utf8');
    } catch (err) {
      console.error("Ошибка чтения cookie файла:", err.message);
      console.log("Убедитесь, что файл cookie.txt существует и содержит cookies авторизации");
      console.log("Для создания cookie.txt выполните команду:");
      console.log("curl -c cookie.txt -X POST http://localhost:5000/api/users/login -H \"Content-Type: application/json\" -d '{\"username\":\"testuser\",\"password\":\"Test123!\"}'");
      process.exit(1);
    }
    
    // Ищем строку с cookie 'connect.sid'
    const connectSidLine = cookieContent.split('\n').find(line => line.includes('connect.sid'));
    if (!connectSidLine) {
      console.error("Ошибка: cookie 'connect.sid' не найден в файле cookie.txt");
      process.exit(1);
    }
    
    // Извлекаем значение cookie
    const cookieValue = connectSidLine.split(/\s+/).pop();
    console.log(`Cookie найден: connect.sid=${cookieValue}`);
    
    // Формируем данные для обновления профиля
    const userData = {
      name: '',
      phone: '',
      country: countryCode,
      street: '',
      house: '',
      apartment: ''
    };
    
    // Отправляем запрос на обновление профиля пользователя
    const response = await fetch('http://localhost:5000/api/users/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `connect.sid=${cookieValue}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Сервер вернул ошибку: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const updatedUser = await response.json();
    
    // Определяем валюту на основе страны
    let currencyInfo = "USD (доллары США)";
    if (isEuropeanCountry(countryCode)) {
      currencyInfo = "EUR (евро)";
    }
    
    // Выводим информацию о результате
    console.log("=== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ОБНОВЛЕН ===");
    console.log(`User ID: ${updatedUser.id}`);
    console.log(`Username: ${updatedUser.username}`);
    console.log(`Country: ${updatedUser.country}`);
    console.log(`Валюта: ${currencyInfo}`);
    console.log("\nОбновите страницу приложения, чтобы увидеть изменения.");
    
  } catch (error) {
    console.error("Ошибка при обновлении страны пользователя:", error.message);
    process.exit(1);
  }
}

// Запускаем обновление
updateUserCountry();