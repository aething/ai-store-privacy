/**
 * Скрипт для обновления страны пользователя
 * 
 * Использование:
 * node update-country.js US - обновить страну пользователя на США
 * node update-country.js DE - обновить страну пользователя на Германию
 */
const fs = require('fs');
const http = require('http');

// Тестовый пользователь (всегда с ID=1)
const TEST_USER_ID = 1;

// Проверяем аргументы командной строки
const countryCode = process.argv[2];

if (!countryCode) {
  console.log("Укажите код страны. Например:");
  console.log("node update-country.js US - для США (цены в USD)");
  console.log("node update-country.js DE - для Германии (цены в EUR)");
  process.exit(1);
}

console.log(`Обновляем страну пользователя с ID ${TEST_USER_ID} на ${countryCode}...`);

// Читаем содержимое cookie.txt
// Формат куки: domain\ttrue\tpath\ttrue\texpiry\tname\tvalue
let cookieHeader = '';
try {
  const cookieContent = fs.readFileSync('./cookie.txt', 'utf8');
  const cookieLines = cookieContent.split('\n').filter(line => !line.startsWith('#') && line.trim());
  
  // Создаем строку Cookie для заголовка
  for (const line of cookieLines) {
    const parts = line.split('\t');
    if (parts.length >= 7) {
      const name = parts[5];
      const value = parts[6];
      if (cookieHeader) cookieHeader += '; ';
      cookieHeader += `${name}=${value}`;
    }
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
const req = http.request(options, (res) => {
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