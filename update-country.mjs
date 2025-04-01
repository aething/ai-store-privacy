/**
 * Скрипт для обновления страны пользователя
 * 
 * Использование:
 * node update-country.mjs US - обновить страну пользователя на США
 * node update-country.mjs DE - обновить страну пользователя на Германию
 */
import fs from 'fs';
import { request } from 'http';

// Тестовый пользователь (всегда с ID=1)
const TEST_USER_ID = 1;

// Проверяем аргументы командной строки
const countryCode = process.argv[2];

if (!countryCode) {
  console.log("Укажите код страны. Например:");
  console.log("node update-country.mjs US - для США (цены в USD)");
  console.log("node update-country.mjs DE - для Германии (цены в EUR)");
  process.exit(1);
}

console.log(`Обновляем страну пользователя с ID ${TEST_USER_ID} на ${countryCode}...`);

// Читаем содержимое cookie.txt
// В cookie.txt строки имеют формат с табуляцией как разделителем
// domain, httpOnly, path, secure, expiry, name, value
let cookieHeader = '';
try {
  const cookieContent = fs.readFileSync('./cookie.txt', 'utf8');
  
  // Ищем строку с именем connect.sid, это наша сессионная куки
  const connectSidMatch = cookieContent.match(/(#HttpOnly_)?[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+connect\.sid\s+([^\s]+)/);
  
  if (connectSidMatch && connectSidMatch[2]) {
    cookieHeader = `connect.sid=${connectSidMatch[2]}`;
    console.log("Cookie найден:", cookieHeader);
  } else {
    throw new Error("Не удалось найти cookie connect.sid в файле");
  }
} catch (err) {
  console.error("Ошибка при чтении cookie.txt:", err.message);
  console.log("Выполните сначала вход в систему:");
  console.log("curl -c cookie.txt -X POST http://localhost:5000/api/users/login -H \"Content-Type: application/json\" -d '{\"username\":\"testuser\",\"password\":\"Test123!\"}'");
  process.exit(1);
}

// Опции запроса
const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/users/${TEST_USER_ID}`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': cookieHeader
  }
};

// Данные запроса
const requestData = JSON.stringify({
  country: countryCode
});

// Отправляем запрос
const req = request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const userData = JSON.parse(data);
        console.log("=== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ОБНОВЛЕН ===");
        console.log("User ID:", userData.id);
        console.log("Username:", userData.username);
        console.log("Country:", userData.country || "Не указана");
        
        if (userData.country === "DE" || userData.country === "FR" || userData.country === "IT" || userData.country === "ES") {
          console.log("Валюта: EUR (евро)");
        } else {
          console.log("Валюта: USD (доллары США)");
        }
        
        console.log("\nОбновите страницу приложения, чтобы увидеть изменения.");
      } catch (e) {
        console.error("Ошибка при разборе ответа:", e.message);
        console.log("Ответ сервера:", data);
      }
    } else {
      console.error(`Ошибка: ${res.statusCode} ${res.statusMessage}`);
      console.log("Ответ сервера:", data);
    }
  });
});

req.on('error', (error) => {
  console.error("Ошибка при отправке запроса:", error.message);
});

// Отправляем данные
req.write(requestData);
req.end();