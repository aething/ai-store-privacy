/**
 * Скрипт для диагностики проблем сессии и аутентификации
 * 
 * Запуск:
 * node session-debug.js [username] [password]
 * 
 * Примеры:
 * node session-debug.js - попытается использовать cookie из файла cookie.txt
 * node session-debug.js testuser Test123! - выполнит вход и диагностику с указанными учетными данными
 */

import fetch from 'node-fetch';
import fs from 'fs';

// Параметры из командной строки
const username = process.argv[2];
const password = process.argv[3];

// HTTP клиент с поддержкой сессионных Cookie
let cookies = [];

// Функция для добавления полученных куки в массив
function updateCookies(response) {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Получаем новые куки и добавляем в массив
    const newCookies = setCookieHeader.split(',').map(c => c.split(';')[0]);
    cookies = [...cookies, ...newCookies];
    console.log('Получены новые куки:', newCookies);
  }
}

// Функция для загрузки куки из файла
function loadCookiesFromFile(filename = 'cookie.txt') {
  try {
    if (fs.existsSync(filename)) {
      const cookieData = fs.readFileSync(filename, 'utf8');
      const cookieLines = cookieData.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      for (const line of cookieLines) {
        const parts = line.split('\t');
        if (parts.length >= 7) {
          const name = parts[5];
          const value = parts[6];
          if (name && value) {
            cookies.push(`${name}=${value}`);
          }
        }
      }
      
      console.log(`Загружено ${cookies.length} куки из файла ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Ошибка при загрузке куки из файла ${filename}:`, error);
    return false;
  }
}

// Функция для выполнения HTTP запросов с куки
async function fetchWithCookies(url, options = {}) {
  const headers = {
    ...options.headers,
    Cookie: cookies.join('; ')
  };
  
  console.log(`Запрос: ${options.method || 'GET'} ${url}`);
  console.log('С куки:', cookies.join('; '));
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  console.log(`Ответ: ${response.status} ${response.statusText}`);
  
  updateCookies(response);
  return response;
}

// Функция для авторизации
async function login(username, password) {
  try {
    console.log(`Выполняем вход как ${username}...`);
    
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    updateCookies(response);
    
    if (!response.ok) {
      throw new Error(`Ошибка авторизации: ${response.status} ${response.statusText}`);
    }
    
    const userData = await response.json();
    console.log('Успешная авторизация!');
    console.log('Данные пользователя:', userData);
    
    return userData;
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    throw error;
  }
}

// Функция для получения данных текущего пользователя
async function getCurrentUser() {
  try {
    console.log('Запрашиваем данные текущего пользователя...');
    
    const response = await fetchWithCookies('http://localhost:5000/api/users/me');
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('Пользователь не авторизован');
        return null;
      }
      throw new Error(`Ошибка получения данных пользователя: ${response.status} ${response.statusText}`);
    }
    
    const userData = await response.json();
    console.log('Данные текущего пользователя:', userData);
    
    return userData;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
}

// Функция для обновления данных пользователя
async function updateUserCountry(userId, country) {
  try {
    console.log(`Обновляем страну пользователя ${userId} на ${country}...`);
    
    const response = await fetchWithCookies(`http://localhost:5000/api/users/${userId}`, {
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
      throw new Error(`Ошибка обновления страны: ${response.status} ${response.statusText}`);
    }
    
    const updatedUser = await response.json();
    console.log('Данные пользователя обновлены:', updatedUser);
    
    return updatedUser;
  } catch (error) {
    console.error('Ошибка при обновлении страны пользователя:', error);
    throw error;
  }
}

// Функция для диагностики проблемы
async function diagnoseSession() {
  console.log('\n===== ДИАГНОСТИКА СЕССИИ =====\n');
  
  // Проверка 1: Есть ли авторизованный пользователь
  const user = await getCurrentUser();
  
  if (!user) {
    console.log('ПРОБЛЕМА: Отсутствует авторизованный пользователь');
    console.log('РЕШЕНИЕ: Необходимо выполнить вход');
    
    if (username && password) {
      const loggedInUser = await login(username, password);
      console.log('Пользователь успешно авторизован');
      
      // Проверяем еще раз получение данных пользователя
      console.log('\nПроверяем авторизацию после входа...');
      const verifiedUser = await getCurrentUser();
      
      if (!verifiedUser) {
        console.log('КРИТИЧЕСКАЯ ПРОБЛЕМА: Не удалось получить данные пользователя даже после авторизации');
        console.log('Возможные причины:');
        console.log('- Проблемы с сессией на сервере');
        console.log('- Проблемы с cookies');
        return false;
      }
      
      console.log('Авторизация подтверждена.');
      
      // Тестируем обновление страны пользователя
      console.log('\nТестируем обновление страны пользователя...');
      try {
        const updatedUser = await updateUserCountry(verifiedUser.id, 'DE');
        console.log('УСПЕХ: Страна пользователя успешно обновлена');
        return true;
      } catch (error) {
        console.log('ПРОБЛЕМА: Не удалось обновить страну пользователя');
        console.log('Причина:', error.message);
        return false;
      }
    } else {
      console.log('Для решения необходимо указать имя пользователя и пароль:');
      console.log('node session-debug.js testuser Test123!');
      return false;
    }
  } else {
    console.log('Текущий пользователь:', user);
    
    // Тестируем обновление страны пользователя
    console.log('\nТестируем обновление страны пользователя...');
    try {
      const updatedUser = await updateUserCountry(user.id, 'DE');
      console.log('УСПЕХ: Страна пользователя успешно обновлена');
      return true;
    } catch (error) {
      console.log('ПРОБЛЕМА: Не удалось обновить страну пользователя');
      console.log('Причина:', error.message);
      
      // Проблема может быть в сессии, пробуем перелогиниться
      if (username && password) {
        console.log('\nПробуем повторно войти в систему...');
        await login(username, password);
        
        console.log('\nПовторяем попытку обновления страны...');
        try {
          const loggedInUser = await getCurrentUser();
          if (loggedInUser) {
            const updatedUser = await updateUserCountry(loggedInUser.id, 'DE');
            console.log('УСПЕХ: Страна пользователя успешно обновлена после повторного входа');
            return true;
          } else {
            console.log('КРИТИЧЕСКАЯ ПРОБЛЕМА: Не удалось получить данные пользователя после повторного входа');
            return false;
          }
        } catch (e) {
          console.log('КРИТИЧЕСКАЯ ПРОБЛЕМА: Не удалось обновить страну пользователя даже после повторного входа');
          return false;
        }
      } else {
        console.log('Для решения необходимо указать имя пользователя и пароль:');
        console.log('node session-debug.js testuser Test123!');
        return false;
      }
    }
  }
}

// Основная функция
async function main() {
  console.log('====== ДИАГНОСТИКА ПРОБЛЕМ СЕССИИ ======');
  
  // Если не указаны учетные данные, пробуем загрузить куки из файла
  if (!username || !password) {
    const loadedCookies = loadCookiesFromFile();
    if (!loadedCookies) {
      console.log('Не удалось загрузить куки из файла и не указаны учетные данные.');
      console.log('Запустите скрипт с параметрами: node session-debug.js testuser Test123!');
      return;
    }
  }
  
  await diagnoseSession();
}

// Запуск скрипта
main().catch(error => {
  console.error('Необработанная ошибка:', error);
});