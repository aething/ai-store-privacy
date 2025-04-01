
const http = require('http');

// Логин и пароль тестового пользователя
const TEST_USER = {
  username: 'testuser',
  password: 'Test123!'
};

// Функция для выполнения HTTP-запроса
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(responseData);
            resolve({ statusCode: res.statusCode, data: jsonData, headers: res.headers });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: responseData, headers: res.headers });
          }
        } else {
          reject({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Основная функция для теста смены страны
async function testCountryChange(newCountry) {
  if (!newCountry) {
    console.log('Пожалуйста, укажите код страны. Например:');
    console.log('node test-country-change.js US - для США (цены в USD)');
    console.log('node test-country-change.js DE - для Германии (цены в EUR)');
    process.exit(1);
  }
  
  console.log(`=== ТЕСТИРОВАНИЕ СМЕНЫ СТРАНЫ НА ${newCountry} ===`);
  
  try {
    // Шаг 1: Вход в систему
    console.log('Вход в систему...');
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginResponse = await makeRequest(loginOptions, TEST_USER);
    console.log(`Вход успешен! ID пользователя: ${loginResponse.data.id}`);
    
    // Сохраняем cookie для следующего запроса
    const cookies = loginResponse.headers['set-cookie'];
    
    if (!cookies) {
      throw new Error('Cookie не получены после логина. Возможно, сессия не создается на сервере.');
    }
    
    // Шаг 2: Обновление страны пользователя
    console.log(`Обновляем страну на ${newCountry}...`);
    const updateOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/users/${loginResponse.data.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };
    
    const updateData = {
      country: newCountry
    };
    
    const updateResponse = await makeRequest(updateOptions, updateData);
    console.log('Страна успешно обновлена!');
    console.log('Данные пользователя:', updateResponse.data);
    
    // Определяем валюту по стране
    const eurCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];
    
    const currency = eurCountries.includes(newCountry) ? 'EUR' : 'USD';
    
    console.log(`\n=== РЕЗУЛЬТАТ ===`);
    console.log(`Пользователь: ${updateResponse.data.username}`);
    console.log(`Страна: ${updateResponse.data.country}`);
    console.log(`Используемая валюта: ${currency}`);
    console.log(`\nТеперь откройте приложение в браузере, и вы должны увидеть цены в ${currency}`);
    
  } catch (error) {
    console.error('Ошибка:', error);
    if (error.statusCode) {
      console.error(`Статус ошибки: ${error.statusCode}`);
      console.error('Ответ сервера:', error.data);
    }
  }
}

// Запуск функции с аргументом командной строки
const newCountry = process.argv[2];
testCountryChange(newCountry);
