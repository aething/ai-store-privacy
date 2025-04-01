/**
 * Скрипт для авторизации и изменения страны пользователя
 * 
 * Использование:
 * node test-country-change.js DE - изменить страну на Германию
 * node test-country-change.js US - изменить страну на США
 */

import fetch from 'node-fetch';

// Тестовые учетные данные
const USERNAME = "testuser";
const PASSWORD = "Test123!";

// Базовый URL API
const API_URL = "http://localhost:5000/api";

// Получаем код страны из аргументов командной строки
const countryCode = process.argv[2];
if (!countryCode) {
  console.error("Ошибка: необходимо указать код страны");
  console.log("Пример использования: node test-country-change.js DE");
  process.exit(1);
}

// Функция, которая выполняет авторизацию и обновление страны
async function loginAndUpdateCountry(country) {
  try {
    console.log(`Авторизуемся как ${USERNAME}...`);
    
    // Шаг 1: Авторизация
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
      const errorText = await loginResponse.text();
      throw new Error(`Ошибка авторизации: ${loginResponse.status} ${errorText}`);
    }
    
    const userData = await loginResponse.json();
    console.log(`Успешная авторизация! ID пользователя: ${userData.id}`);
    
    // Получаем cookie из ответа
    const cookies = loginResponse.headers.get('set-cookie');
    if (!cookies) {
      console.warn("Предупреждение: не получены cookies после авторизации");
    }
    
    // Шаг 2: Обновление страны пользователя
    console.log(`Обновляем страну пользователя на ${country}...`);
    
    const updateResponse = await fetch(`${API_URL}/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        name: userData.name || "",
        phone: userData.phone || "",
        country: country,
        street: userData.street || "",
        house: userData.house || "",
        apartment: userData.apartment || ""
      }),
      credentials: 'include'
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Ошибка обновления страны: ${updateResponse.status} ${errorText}`);
    }
    
    const updatedUserData = await updateResponse.json();
    
    // Определяем валюту
    const isEuropeanCountry = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ].includes(country.toUpperCase());
    
    const currency = isEuropeanCountry ? "EUR" : "USD";
    
    console.log(`
=== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ОБНОВЛЕН ===
User ID: ${updatedUserData.id}
Username: ${updatedUserData.username}
Email: ${updatedUserData.email}
Country: ${updatedUserData.country}
Текущая валюта: ${currency}

✅ Операция выполнена успешно!
➡️ Обновите страницу браузера, чтобы увидеть изменения.
    `);
    
  } catch (error) {
    console.error("Произошла ошибка:", error.message);
    process.exit(1);
  }
}

// Запускаем функцию с указанным кодом страны
loginAndUpdateCountry(countryCode);