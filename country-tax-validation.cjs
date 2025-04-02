/**
 * Скрипт для проверки правильности расчета налогов для разных стран
 * 
 * Этот скрипт отправляет запросы к API создания платежного намерения
 * с разными кодами стран и проверяет, что налоговые ставки соответствуют ожидаемым.
 */

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

// Ожидаемые ставки налогов по странам
const EXPECTED_TAX_RATES = {
  'DE': 0.19, // Германия - 19% MwSt
  'FR': 0.20, // Франция - 20% TVA
  'IT': 0.22, // Италия - 22% IVA
  'ES': 0.21, // Испания - 21% IVA
  'AT': 0.20, // Австрия - 20% MwSt
  'BE': 0.21, // Бельгия - 21% BTW
  'GB': 0.20, // Великобритания - 20% VAT
  'US': 0.00, // США - 0% (нет федерального налога с продаж)
  'unknown': 0.00 // Неизвестная страна - 0%
};

// Тестовые данные
const BASE_TEST_DATA = {
  amount: 10000,
  userId: 1,
  productId: 1,
  currency: 'eur',
  force_country: true
};

// Форматирование числа как валюты
function formatCurrency(amount, currency = 'eur') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount / 100);
}

// Функция для тестирования расчета налогов для указанной страны
async function testCountryTaxRate(country) {
  console.log(`\n=== ТЕСТИРОВАНИЕ НАЛОГОВОЙ СТАВКИ ДЛЯ: ${country} ===`);
  
  // Создаем тестовые данные для этой страны
  const testData = {
    ...BASE_TEST_DATA,
    country
  };
  
  console.log(`Отправляемые данные: ${JSON.stringify(testData, null, 2)}`);
  
  try {
    // Отправляем запрос
    const response = await fetchWithCurl(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = response.data;
    
    console.log(`\nОтвет API: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ Ошибка: ${data.message || JSON.stringify(data)}`);
      return false;
    }
    
    console.log(`✅ Успешно создан PaymentIntent`);
    console.log(`✅ Client Secret: ${data.clientSecret.substring(0, 20)}...`);
    
    // Проверяем налоговую информацию
    if (!data.tax) {
      console.log(`❌ Информация о налоге отсутствует в ответе`);
      return false;
    }
    
    // Получаем ожидаемую ставку для этой страны
    const expectedRate = EXPECTED_TAX_RATES[country] || 0;
    
    // Расчет ожидаемой суммы налога
    const expectedTaxAmount = Math.round(BASE_TEST_DATA.amount * expectedRate);
    
    // Проверка налоговой ставки
    const actualRate = data.tax.rate;
    const actualTaxAmount = data.tax.amount;
    
    console.log(`\n📊 Информация о налоге:`);
    console.log(`   Ставка: ${actualRate * 100}% (ожидалось: ${expectedRate * 100}%)`);
    console.log(`   Метка: ${data.tax.label}`);
    console.log(`   Сумма: ${formatCurrency(actualTaxAmount)} (ожидалось: ${formatCurrency(expectedTaxAmount)})`);
    
    // Проверка соответствия ожидаемым значениям
    const isRateCorrect = Math.abs(actualRate - expectedRate) < 0.001; // Допускаем небольшую погрешность
    const isTaxAmountCorrect = Math.abs(actualTaxAmount - expectedTaxAmount) <= 1; // Допускаем погрешность округления
    
    if (!isRateCorrect) {
      console.log(`❌ ОШИБКА: Неверная налоговая ставка для ${country}`);
      console.log(`   Ожидалось: ${expectedRate * 100}%`);
      console.log(`   Получено: ${actualRate * 100}%`);
    }
    
    if (!isTaxAmountCorrect) {
      console.log(`❌ ОШИБКА: Неверная сумма налога для ${country}`);
      console.log(`   Ожидалось: ${formatCurrency(expectedTaxAmount)}`);
      console.log(`   Получено: ${formatCurrency(actualTaxAmount)}`);
    }
    
    if (isRateCorrect && isTaxAmountCorrect) {
      console.log(`\n✅ ПРОВЕРКА ПРОЙДЕНА: Налоговая ставка и сумма для ${country} соответствуют ожидаемым`);
      return true;
    } else {
      console.log(`\n❌ ПРОВЕРКА НЕ ПРОЙДЕНА: Налоговая ставка или сумма для ${country} не соответствуют ожидаемым`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Ошибка запроса: ${error.message}`);
    return false;
  }
}

// Функция для тестирования всех стран
async function testAllCountries() {
  console.log("=".repeat(80));
  console.log("ПРОВЕРКА НАЛОГОВЫХ СТАВОК ДЛЯ РАЗНЫХ СТРАН");
  console.log("=".repeat(80));
  
  const countries = Object.keys(EXPECTED_TAX_RATES);
  let passed = 0;
  let failed = 0;
  
  for (const country of countries) {
    const result = await testCountryTaxRate(country);
    if (result) passed++;
    else failed++;
  }
  
  console.log("\n=".repeat(80));
  console.log(`РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:`);
  console.log(`✅ Успешно: ${passed}`);
  console.log(`❌ Ошибки: ${failed}`);
  console.log(`🔄 Всего стран: ${countries.length}`);
  console.log("=".repeat(80));
}

// Запускаем тесты
testAllCountries().catch(error => {
  console.error(`Критическая ошибка: ${error.message}`);
});