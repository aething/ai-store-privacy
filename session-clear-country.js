/**
 * Скрипт для сброса страны пользователя в сессии и базе данных
 * 
 * Этот скрипт выполняет прямые запросы к базе данных и сессии,
 * чтобы принудительно сбросить выбранную страну пользователя
 * и позволить системе использовать передаваемые значения.
 */

import fetch from 'node-fetch';

// Функция для загрузки cookie из файла
function loadCookie() {
  try {
    const fs = require('fs');
    return fs.readFileSync('cookie.txt', 'utf8');
  } catch (error) {
    console.error('Ошибка при загрузке cookie:', error.message);
    return '';
  }
}

// Функция для выполнения запросов с cookie
async function fetchWithCookie(url, options = {}) {
  const cookie = loadCookie();
  
  const defaultOptions = {
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json'
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  return fetch(url, mergedOptions);
}

// Функция для получения текущего пользователя
async function getCurrentUser() {
  try {
    const response = await fetchWithCookie('http://localhost:5000/api/users/me');
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error.message);
    return null;
  }
}

// Функция для обновления страны пользователя
async function updateUserCountry(userId, country) {
  try {
    const response = await fetchWithCookie(
      'http://localhost:5000/api/users/update',
      {
        method: 'PATCH',
        body: JSON.stringify({ userId, country, force: true }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении страны:', error.message);
    return null;
  }
}

// Функция для сброса кэша сессии
async function clearSessionCache() {
  try {
    console.log('Пытаемся сбросить кэш сессии...');
    
    const response = await fetchWithCookie(
      'http://localhost:5000/api/session/clear-cache',
      {
        method: 'POST',
        body: JSON.stringify({ key: 'country' }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при сбросе кэша:', error.message);
    return null;
  }
}

// Основная функция
async function main() {
  console.log('='.repeat(80));
  console.log('СБРОС СТРАНЫ ПОЛЬЗОВАТЕЛЯ В СЕССИИ И БАЗЕ ДАННЫХ');
  console.log('='.repeat(80));
  
  // Получаем текущего пользователя
  const user = await getCurrentUser();
  if (!user) {
    console.log('Не удалось получить текущего пользователя. Убедитесь, что вы авторизованы и cookie.txt актуален.');
    return;
  }
  
  console.log('Текущий пользователь:', JSON.stringify(user, null, 2));
  console.log('Текущая страна пользователя:', user.country || 'не задана');
  
  // Определяем новую страну из аргументов командной строки или используем DE по умолчанию
  const newCountry = process.argv[2] || 'DE';
  console.log(`\nУстанавливаем новую страну: ${newCountry}`);
  
  // Обновляем страну пользователя
  const updateResult = await updateUserCountry(user.id, newCountry);
  if (updateResult) {
    console.log('Страна пользователя успешно обновлена:', JSON.stringify(updateResult, null, 2));
  } else {
    console.log('Не удалось обновить страну пользователя');
  }
  
  // Сбрасываем кэш сессии
  const clearResult = await clearSessionCache();
  if (clearResult) {
    console.log('Кэш сессии успешно сброшен:', JSON.stringify(clearResult, null, 2));
  } else {
    console.log('Не удалось сбросить кэш сессии');
  }
  
  // Проверяем, что страна обновилась
  const updatedUser = await getCurrentUser();
  if (updatedUser) {
    console.log('\nОбновленный пользователь:', JSON.stringify(updatedUser, null, 2));
    console.log('Новая страна пользователя:', updatedUser.country || 'не задана');
    
    if (updatedUser.country === newCountry) {
      console.log('\n✓ УСПЕХ: Страна пользователя успешно обновлена!');
    } else {
      console.log('\n✗ ОШИБКА: Страна пользователя не обновилась!');
    }
  } else {
    console.log('Не удалось получить обновленные данные пользователя');
  }
}

// Запускаем скрипт
main().catch(console.error);