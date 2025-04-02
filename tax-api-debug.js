/**
 * Расширенный скрипт отладки API налогов с подробным выводом
 * 
 * Этот скрипт позволяет:
 * 1. Тестировать API расчета налогов напрямую
 * 2. Отображать полный ответ с детальной структурой данных
 * 3. Отслеживать HTTP-заголовки и коды ответов
 * 4. Поддерживать разные сценарии тестирования
 * 
 * Использование:
 * node tax-api-debug.js DE 1000 EUR
 * node tax-api-debug.js US 5000 USD
 * node tax-api-debug.js FR 2000 EUR
 */

import fetch from 'node-fetch';
import * as util from 'util';

// Конфигурация
const API_BASE_URL = 'http://localhost:5000';
const TAX_CALCULATE_ENDPOINT = '/api/tax-debug/calculate';
const PAYMENT_CREATE_ENDPOINT = '/api/create-payment-intent';

// Настройка вывода для объектов
const INSPECT_OPTIONS = {
  showHidden: false,
  depth: null,
  colors: true
};

// Глобальные переменные для хранения ответов
let taxCalculationResponse = null;
let paymentIntentResponse = null;

/**
 * Форматирование вывода валюты
 */
function formatCurrency(amount, currency = 'usd') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toLowerCase(),
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount / 100);
}

/**
 * Разделитель для красивого вывода в консоль
 */
function printDivider(title = '') {
  const divider = '='.repeat(80);
  if (title) {
    console.log('\n' + divider);
    console.log(`= ${title.toUpperCase()} ${'='.repeat(77 - title.length)}`);
    console.log(divider);
  } else {
    console.log('\n' + divider);
  }
}

/**
 * Выполнение запроса к API с детальным выводом
 */
async function makeApiRequest(endpoint, method = 'GET', data = null) {
  const url = API_BASE_URL + endpoint;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`🚀 Отправка ${method} запроса на: ${url}`);
  console.log('📊 Данные запроса:');
  console.log(util.inspect(data, INSPECT_OPTIONS));
  
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let responseData;
    
    console.log(`📡 Статус ответа: ${response.status} ${response.statusText}`);
    console.log('📋 Заголовки ответа:');
    response.headers.forEach((value, key) => {
      console.log(`  - ${key}: ${value}`);
    });
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log('📩 Тело ответа (JSON):');
      console.log(util.inspect(responseData, INSPECT_OPTIONS));
    } else {
      responseData = await response.text();
      console.log('📩 Тело ответа (текст):');
      console.log(responseData);
    }
    
    if (!response.ok) {
      console.error(`❌ Ошибка API: ${response.status} ${response.statusText}`);
      if (responseData) {
        console.error('Детали ошибки:', responseData);
      }
    }
    
    return { status: response.status, data: responseData, ok: response.ok };
  } catch (error) {
    console.error(`❌ Ошибка выполнения запроса: ${error.message}`);
    throw error;
  }
}

/**
 * Тестирование API расчета налогов
 */
async function testTaxCalculation(country, amount, currency) {
  printDivider('ТЕСТ РАСЧЕТА НАЛОГОВ');
  
  console.log(`🧪 Параметры тестирования:`);
  console.log(`  - Страна: ${country}`);
  console.log(`  - Сумма: ${formatCurrency(amount, currency)}`);
  console.log(`  - Валюта: ${currency.toUpperCase()}`);
  
  const data = {
    country,
    amount: parseInt(amount, 10),
    currency: currency.toLowerCase()
  };
  
  const response = await makeApiRequest(TAX_CALCULATE_ENDPOINT, 'POST', data);
  taxCalculationResponse = response;
  
  if (response.ok && response.data) {
    printDivider('РЕЗУЛЬТАТЫ РАСЧЕТА НАЛОГОВ');
    
    const { taxAmount, taxRate, taxInclusive, totalAmount } = response.data;
    
    console.log(`✅ Расчет налогов выполнен успешно:`);
    console.log(`  - Исходная сумма: ${formatCurrency(amount, currency)}`);
    console.log(`  - Ставка налога: ${taxRate ? (taxRate * 100).toFixed(2) + '%' : '0%'}`);
    console.log(`  - Сумма налога: ${formatCurrency(taxAmount || 0, currency)}`);
    console.log(`  - Итоговая сумма: ${formatCurrency(totalAmount, currency)}`);
    console.log(`  - Цены указаны с учетом налога: ${taxInclusive ? 'Да' : 'Нет'}`);
    
    return response.data;
  } else {
    console.error('❌ Не удалось получить расчет налогов');
    return null;
  }
}

/**
 * Тестирование создания платежного намерения с учетом налогов
 */
async function testPaymentIntentCreation(productId, country, currency) {
  printDivider('ТЕСТ СОЗДАНИЯ ПЛАТЕЖНОГО НАМЕРЕНИЯ');
  
  console.log(`🧪 Параметры тестирования:`);
  console.log(`  - ID продукта: ${productId}`);
  console.log(`  - Страна: ${country}`);
  console.log(`  - Валюта: ${currency.toUpperCase()}`);
  
  // Запрашиваем сначала детали продукта
  const productResponse = await makeApiRequest(`/api/products/${productId}`, 'GET');
  
  if (!productResponse.ok || !productResponse.data) {
    console.error('❌ Не удалось получить информацию о продукте');
    return null;
  }
  
  const product = productResponse.data;
  console.log(`📦 Информация о продукте:`);
  console.log(`  - Название: ${product.name}`);
  console.log(`  - Цена USD: ${formatCurrency(product.price, 'usd')}`);
  console.log(`  - Цена EUR: ${formatCurrency(product.priceEUR || product.price, 'eur')}`);
  
  // Определяем сумму в зависимости от валюты
  const amount = currency.toLowerCase() === 'eur' ? product.priceEUR : product.price;
  
  // Создаем запрос на основе параметров из routes.ts
  const data = {
    amount,
    userId: 1, // Используем тестового пользователя
    productId: parseInt(productId, 10),
    currency: currency.toLowerCase(),
    country
  };
  
  const response = await makeApiRequest(PAYMENT_CREATE_ENDPOINT, 'POST', data);
  paymentIntentResponse = response;
  
  if (response.ok && response.data) {
    printDivider('РЕЗУЛЬТАТЫ СОЗДАНИЯ ПЛАТЕЖНОГО НАМЕРЕНИЯ');
    
    // Извлекаем информацию из ответа
    const { clientSecret, amount: responseAmount, currency: responseCurrency } = response.data;
    const taxAmount = response.data.taxAmount || 
                      (response.data.metadata && response.data.metadata.tax_amount) || 0;
    const totalAmount = response.data.totalAmount || responseAmount;
    
    console.log(`✅ Платежное намерение создано успешно:`);
    console.log(`  - Client Secret: ${clientSecret ? clientSecret.substring(0, 16) + '...' : 'Отсутствует'}`);
    console.log(`  - Исходная сумма: ${formatCurrency(amount, responseCurrency)}`);
    console.log(`  - Сумма налога: ${formatCurrency(taxAmount, responseCurrency)}`);
    console.log(`  - Итоговая сумма: ${formatCurrency(totalAmount, responseCurrency)}`);
    
    // Проверяем наличие clientSecret
    if (clientSecret) {
      console.log(`\n✅ Теперь можно использовать clientSecret для отображения Stripe Elements`);
    } else {
      console.error(`❌ Client Secret отсутствует в ответе - проверьте интеграцию Stripe`);
    }
    
    // Проверяем метаданные, если они есть
    if (response.data.metadata) {
      console.log('\n📋 Дополнительные метаданные:');
      Object.entries(response.data.metadata).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }
    
    return response.data;
  } else {
    console.error('❌ Не удалось создать платежное намерение');
    return null;
  }
}

/**
 * Главная функция для выполнения всех тестов
 */
async function main() {
  try {
    // Получаем параметры командной строки
    const country = process.argv[2] || 'DE';
    const amount = process.argv[3] || '1000';
    const currency = process.argv[4] || (country === 'US' ? 'USD' : 'EUR');
    const productId = process.argv[5] || '1'; // По умолчанию первый продукт
    
    printDivider('НАЧАЛО ТЕСТИРОВАНИЯ');
    console.log(`🔍 Параметры запуска:`);
    console.log(`  - Страна: ${country}`);
    console.log(`  - Сумма: ${amount}`);
    console.log(`  - Валюта: ${currency}`);
    console.log(`  - ID продукта: ${productId}`);
    
    // Тестируем расчет налогов
    const taxResult = await testTaxCalculation(country, amount, currency);
    
    // Тестируем создание платежного намерения
    if (taxResult) {
      await testPaymentIntentCreation(productId, country, currency);
    }
    
    printDivider('ИТОГИ ТЕСТИРОВАНИЯ');
    
    if (taxCalculationResponse && taxCalculationResponse.ok) {
      console.log('✅ Расчет налогов: УСПЕШНО');
    } else {
      console.log('❌ Расчет налогов: ОШИБКА');
    }
    
    if (paymentIntentResponse && paymentIntentResponse.ok) {
      console.log('✅ Создание платежного намерения: УСПЕШНО');
    } else {
      console.log('❌ Создание платежного намерения: ОШИБКА или НЕ ВЫПОЛНЯЛОСЬ');
    }
    
    // Анализ возможных проблем
    printDivider('ДИАГНОСТИКА ПРОБЛЕМ');
    
    let problemsFound = false;
    
    // Проверяем структуру ответа API расчета налогов
    if (taxCalculationResponse && taxCalculationResponse.ok) {
      if (!taxCalculationResponse.data.hasOwnProperty('taxAmount')) {
        console.log('❌ Проблема: API расчета налогов не возвращает поле taxAmount');
        problemsFound = true;
      }
      
      if (!taxCalculationResponse.data.hasOwnProperty('totalAmount')) {
        console.log('❌ Проблема: API расчета налогов не возвращает поле totalAmount');
        problemsFound = true;
      }
    }
    
    // Проверяем структуру ответа API создания платежного намерения
    if (paymentIntentResponse && paymentIntentResponse.ok) {
      if (!paymentIntentResponse.data.hasOwnProperty('clientSecret')) {
        console.log('❌ Проблема: API создания платежного намерения не возвращает clientSecret');
        problemsFound = true;
      }
    }
    
    if (!problemsFound) {
      console.log('✅ Явных проблем в структуре API не обнаружено');
      console.log('💡 Если фронтенд не отображает данные, проверьте:');
      console.log('  - Правильно ли обрабатываются ответы API на стороне клиента');
      console.log('  - Есть ли ошибки в консоли браузера');
      console.log('  - Проходят ли запросы CORS-политику (проверьте заголовки ответов)');
    }
    
  } catch (error) {
    console.error('🔥 Критическая ошибка выполнения тестов:', error);
  }
}

// Запускаем тестирование
main().catch(console.error);