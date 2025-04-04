/**
 * Тестовый скрипт для проверки обновления количества в PaymentIntent
 * 
 * Этот скрипт выполняет:
 * 1. Вход в систему с тестовым пользователем
 * 2. Создание PaymentIntent для тестового продукта
 * 3. Обновление количества через API обновления PaymentIntent
 * 4. Проверку, что сумма и метаданные обновились правильно
 * 
 * Запуск:
 * node test-payment-update.js
 */

import fetch from 'node-fetch';

// Конфигурация
const API_URL = 'http://localhost:5000';
const TEST_USER = {
  username: 'testuser',
  password: 'Test123!'
};
const TEST_PRODUCT_ID = 1; // ID тестового продукта (AI-Driven Solutions)
const TEST_QUANTITY = 3; // Начальное количество для тестирования
const UPDATED_QUANTITY = 5; // Новое количество для обновления

// Глобальные переменные
let cookies = null;
let paymentIntentId = null;
let userId = null;

// Форматирование числа как валюты
function formatCurrency(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount / 100);
}

// Сохранение и загрузка cookies
function saveCookies(response) {
  const responseCookies = response.headers.get('set-cookie');
  if (responseCookies) {
    cookies = responseCookies;
  }
}

// Выполнение запросов с cookies
async function fetchWithCookies(url, options = {}) {
  const headers = options.headers || {};
  if (cookies) {
    headers.Cookie = cookies;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  saveCookies(response);
  return response;
}

// Вход в систему
async function login() {
  console.log(`Вход в систему с пользователем: ${TEST_USER.username}`);
  
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(TEST_USER)
  });
  
  saveCookies(response);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка входа: ${error}`);
  }
  
  const userData = await response.json();
  userId = userData.id;
  console.log(`Успешный вход, ID пользователя: ${userId}`);
  return userData;
}

// Получение текущего пользователя
async function getCurrentUser() {
  const response = await fetchWithCookies(`${API_URL}/api/users/me`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка получения данных пользователя: ${error}`);
  }
  
  return await response.json();
}

// Создание PaymentIntent
async function createPaymentIntent() {
  console.log(`Создание PaymentIntent для продукта ${TEST_PRODUCT_ID} с количеством ${TEST_QUANTITY}`);
  
  // Сначала получаем данные о продукте
  const productResponse = await fetchWithCookies(`${API_URL}/api/products/${TEST_PRODUCT_ID}`);
  if (!productResponse.ok) {
    const error = await productResponse.text();
    throw new Error(`Ошибка получения данных продукта: ${error}`);
  }
  
  const product = await productResponse.json();
  console.log(`Получены данные продукта: ${product.title}, цена EUR: ${product.priceEUR}`);
  
  // Создаем PaymentIntent с данными о продукте
  // Рассчитываем сумму в мельчайших единицах валюты (центах)
  const amount = product.priceEUR * TEST_QUANTITY;
  
  console.log(`Расчет суммы: ${product.priceEUR} (базовая цена) × ${TEST_QUANTITY} (количество) = ${amount} (общая сумма в центах)`);
  
  const response = await fetchWithCookies(`${API_URL}/api/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId: TEST_PRODUCT_ID,
      userId,
      country: 'DE', // Тестируем с Германией для проверки НДС
      quantity: TEST_QUANTITY,
      amount: amount, // Правильный параметр - общая сумма в центах
      currency: 'eur', // Добавляем валюту
      override_user_country: true,
      force_country: 'DE'
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка создания PaymentIntent: ${error}`);
  }
  
  const data = await response.json();
  paymentIntentId = data.id;
  
  // Извлекаем налоговую информацию из структурированного ответа
  const baseAmount = data.amount || product.priceEUR * TEST_QUANTITY;
  const taxAmount = data.taxAmount || (data.tax && data.tax.amount) || 0;
  const taxRate = data.taxRate || (data.tax && data.tax.rate) || 0;
  const totalAmount = data.totalWithTax || baseAmount + taxAmount;
  
  console.log(`
  - PaymentIntent ID: ${data.id}
  - Client Secret: ${data.clientSecret?.substring(0, 10)}...
  - Базовая сумма: ${formatCurrency(baseAmount, 'eur')}
  - Налог: ${formatCurrency(taxAmount, 'eur')}
  - Итого: ${formatCurrency(totalAmount, 'eur')}
  - Количество: ${data.quantity || TEST_QUANTITY}
  - Ставка налога: ${(taxRate * 100).toFixed(2)}%
  `);
  
  return data;
}

// Обновление количества в PaymentIntent
async function updatePaymentIntent() {
  console.log(`Обновление количества в PaymentIntent ${paymentIntentId} на ${UPDATED_QUANTITY}`);
  
  const response = await fetchWithCookies(`${API_URL}/api/update-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentIntentId,
      userId,
      quantity: UPDATED_QUANTITY,
      productId: TEST_PRODUCT_ID,
      newItems: [
        {
          product_id: TEST_PRODUCT_ID.toString(),
          quantity: UPDATED_QUANTITY
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка обновления PaymentIntent: ${error}`);
  }
  
  const data = await response.json();
  
  // Извлекаем налоговую информацию из структурированного ответа
  const taxAmount = data.taxAmount || 0;
  const totalAmount = data.totalAmount || data.amount + taxAmount;
  
  console.log(`
  - Обновленный PaymentIntent ID: ${data.id}
  - Client Secret: ${data.clientSecret?.substring(0, 10)}...
  - Базовая сумма: ${formatCurrency(data.amount, 'eur')}
  - Налог: ${formatCurrency(taxAmount, 'eur')}
  - Итого: ${formatCurrency(totalAmount, 'eur')}
  - Количество: ${data.quantity || 'не указано'}
  `);
  
  return data;
}

// Основная функция для выполнения тестов
async function main() {
  try {
    console.log('Начало теста обновления PaymentIntent...');
    
    // 1. Вход в систему
    await login();
    
    // 2. Проверка текущего пользователя
    const currentUser = await getCurrentUser();
    console.log(`Текущий пользователь: ${currentUser.username} (ID: ${currentUser.id})`);
    
    // 3. Создание PaymentIntent
    const paymentIntent = await createPaymentIntent();
    console.log(`Создан PaymentIntent с ID: ${paymentIntent.id}`);
    
    // 4. Обновление количества
    const updatedPaymentIntent = await updatePaymentIntent();
    console.log(`Обновлен PaymentIntent с ID: ${updatedPaymentIntent.id}`);
    
    // 5. Проверка корректности обновления
    const expectedBaseAmount = TEST_PRODUCT_ID === 1 ? 2760 : 8430; // Цена продукта
    const expectedNewBaseAmount = expectedBaseAmount * UPDATED_QUANTITY;
    const actualBaseAmount = updatedPaymentIntent.amount;
    
    console.log(`Ожидаемая базовая сумма: ${formatCurrency(expectedNewBaseAmount, 'eur')}`);
    console.log(`Фактическая базовая сумма: ${formatCurrency(actualBaseAmount, 'eur')}`);
    
    if (actualBaseAmount === expectedNewBaseAmount) {
      console.log('✅ Тест ПРОЙДЕН! Сумма обновлена корректно.');
    } else {
      console.log('❌ Тест НЕ ПРОЙДЕН! Сумма не соответствует ожидаемой.');
    }
    
    console.log('Тест завершен.');
  } catch (error) {
    console.error('Ошибка теста:', error.message);
  }
}

// Запуск тестов
main();