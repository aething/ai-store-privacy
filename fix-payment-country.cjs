/**
 * Скрипт для исправления проблемы с передачей страны в API создания PaymentIntent
 * 
 * Этот скрипт проверяет и фиксирует проблему, когда страна страны из профиля пользователя
 * не передается правильно в PaymentIntent
 */

// Используем curl через spawn для HTTP-запросов
const { spawn } = require('child_process');

/**
 * Выполняет HTTP-запрос с помощью curl
 * @param {string} url - URL для запроса
 * @param {Object} options - Опции запроса
 * @returns {Promise<Object>} - Ответ от сервера
 */
async function fetchWithCurl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const args = ['-s'];
    
    // Добавляем метод
    if (options.method) {
      args.push('-X', options.method);
    }
    
    // Добавляем заголовки
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        args.push('-H', `${key}: ${value}`);
      });
    }
    
    // Добавляем тело запроса
    if (options.body) {
      args.push('-d', options.body);
    }
    
    // Добавляем URL
    args.push(url);
    
    // Выполняем команду curl
    const curl = spawn('curl', args);
    
    let responseData = '';
    let errorData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    curl.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`curl exited with code ${code}: ${errorData}`));
        return;
      }
      
      try {
        // Парсим JSON-ответ
        const data = JSON.parse(responseData);
        resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(data),
          data // Добавляем прямой доступ к данным для упрощения
        });
      } catch (error) {
        reject(new Error(`Failed to parse JSON response: ${error.message}\nResponse: ${responseData}`));
      }
    });
  });
}

// URL для тестирования
const API_URL = 'http://localhost:5000/api/create-payment-intent';

// Тестовые данные
const TEST_DATA = {
  amount: 10000,
  userId: 1,
  productId: 1,
  currency: 'eur',
  country: 'FR',
  force_country: true
};

// Функция для тестирования с принудительным указанием страны
async function testPaymentIntentWithForcedCountry() {
  console.log("TEST 1: Тестирование с force_country=true и указанной страной");
  console.log(`Отправляем данные: ${JSON.stringify(TEST_DATA, null, 2)}`);
  
  try {
    const response = await fetchWithCurl(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_DATA)
    });
    
    const data = response.data;
    
    console.log(`\nОтвет API: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`✅ Успешно создан PaymentIntent`);
      console.log(`✅ Client Secret: ${data.clientSecret.substring(0, 20)}...`);
      
      if (data.tax) {
        console.log(`\n📊 Информация о налоге:`);
        console.log(`   Ставка: ${data.tax.rate * 100}%`);
        console.log(`   Метка: ${data.tax.label}`);
        console.log(`   Сумма: ${data.tax.amount} EUR`);
      } else {
        console.log(`❌ Информация о налоге отсутствует в ответе`);
      }
    } else {
      console.log(`❌ Ошибка: ${data.message || JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`❌ Ошибка запроса: ${error.message}`);
  }
}

// Функция для тестирования без принудительного указания страны
async function testPaymentIntentWithoutForcedCountry() {
  console.log("\nTEST 2: Тестирование без force_country");
  
  const testData = {
    ...TEST_DATA
  };
  delete testData.force_country;
  
  console.log(`Отправляем данные: ${JSON.stringify(testData, null, 2)}`);
  
  try {
    const response = await fetchWithCurl(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = response.data;
    
    console.log(`\nОтвет API: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`✅ Успешно создан PaymentIntent`);
      console.log(`✅ Client Secret: ${data.clientSecret.substring(0, 20)}...`);
      
      if (data.tax) {
        console.log(`\n📊 Информация о налоге:`);
        console.log(`   Ставка: ${data.tax.rate * 100}%`);
        console.log(`   Метка: ${data.tax.label}`);
        console.log(`   Сумма: ${data.tax.amount} EUR`);
      } else {
        console.log(`❌ Информация о налоге отсутствует в ответе`);
      }
    } else {
      console.log(`❌ Ошибка: ${data.message || JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`❌ Ошибка запроса: ${error.message}`);
  }
}

// Функция для тестирования с передачей страны в запросе по URL параметрам
async function testPaymentIntentWithCountryParam() {
  console.log("\nTEST 3: Тестирование с передачей страны в URL параметре");
  
  const testData = {
    amount: 10000,
    userId: 1,
    productId: 1,
    currency: 'eur'
  };
  
  console.log(`Отправляем данные: ${JSON.stringify(testData, null, 2)}`);
  
  try {
    const url = `${API_URL}?country=FR`;
    console.log(`URL: ${url}`);
    
    const response = await fetchWithCurl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = response.data;
    
    console.log(`\nОтвет API: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`✅ Успешно создан PaymentIntent`);
      console.log(`✅ Client Secret: ${data.clientSecret.substring(0, 20)}...`);
      
      if (data.tax) {
        console.log(`\n📊 Информация о налоге:`);
        console.log(`   Ставка: ${data.tax.rate * 100}%`);
        console.log(`   Метка: ${data.tax.label}`);
        console.log(`   Сумма: ${data.tax.amount} EUR`);
      } else {
        console.log(`❌ Информация о налоге отсутствует в ответе`);
      }
    } else {
      console.log(`❌ Ошибка: ${data.message || JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`❌ Ошибка запроса: ${error.message}`);
  }
}

// Основная функция для запуска всех тестов
async function runTests() {
  console.log("=".repeat(60));
  console.log("ТЕСТИРОВАНИЕ API СОЗДАНИЯ PAYMENT INTENT С РАЗЛИЧНЫМИ ПАРАМЕТРАМИ СТРАНЫ");
  console.log("=".repeat(60));
  
  await testPaymentIntentWithForcedCountry();
  await testPaymentIntentWithoutForcedCountry();
  await testPaymentIntentWithCountryParam();
  
  console.log("\n=".repeat(60));
  console.log("ЗАВЕРШЕНО");
  console.log("=".repeat(60));
}

// Запуск тестов
runTests().catch(error => {
  console.error(`Критическая ошибка: ${error.message}`);
});