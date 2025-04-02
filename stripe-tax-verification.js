/**
 * Скрипт для проверки корректности передачи суммы с налогом в Stripe
 * и получения той же суммы в ответе от Stripe
 * 
 * Этот скрипт проверяет:
 * 1. Корректное создание PaymentIntent с налогом
 * 2. Правильную передачу суммы с уже включенным налогом в Stripe
 * 3. Соответствие суммы в ответе от Stripe с нашим расчетом
 * 
 * Использование:
 * node stripe-tax-verification.js
 */

import 'dotenv/config';
import Stripe from 'stripe';
import fetch from 'node-fetch';

// Инициализация Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Цвета для вывода
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function logSection(title) {
  console.log('\n' + colors.blue + '=== ' + title + ' ===' + colors.reset);
}

async function makeLocalApiRequest(data) {
  logSection('Запрос к локальному API');
  log('Отправляем запрос с данными:');
  console.log(data);
  
  try {
    const response = await fetch('http://localhost:5000/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    log('Получен ответ от API:', colors.green);
    console.log(result);
    
    return result;
  } catch (error) {
    log('Ошибка при обращении к API: ' + error.message, colors.red);
    return null;
  }
}

async function getPaymentIntentDetails(paymentIntentId) {
  try {
    logSection('Получение деталей PaymentIntent из Stripe');
    log(`Запрос деталей для PaymentIntent: ${paymentIntentId}`);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    log('Получены детали от Stripe:', colors.green);
    console.log({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      description: paymentIntent.description,
      metadata: paymentIntent.metadata
    });
    
    return paymentIntent;
  } catch (error) {
    log(`Ошибка при получении данных из Stripe: ${error.message}`, colors.red);
    return null;
  }
}

async function verifyTaxAmount(country, amount, currency) {
  logSection('Проверка суммы с налогом');
  log(`Страна: ${country}, Сумма: ${amount}, Валюта: ${currency}`);
  
  // Ожидаемые налоговые ставки для разных стран
  const taxRates = {
    'DE': 0.19,  // Германия - 19%
    'FR': 0.20,  // Франция - 20%
    'IT': 0.22,  // Италия - 22%
    'ES': 0.21,  // Испания - 21%
    'US': 0      // США - без налога
  };
  
  // Получение актуальной ставки налога для страны
  const taxRate = taxRates[country] || 0;
  log(`Ставка налога для ${country}: ${taxRate * 100}%`);
  
  // Расчет ожидаемой суммы налога и итоговой суммы
  const taxAmount = Math.round(amount * taxRate);
  const totalAmount = amount + taxAmount;
  
  log(`Базовая сумма: ${amount} ${currency}`);
  log(`Сумма налога: ${taxAmount} ${currency}`);
  log(`Ожидаемая итоговая сумма: ${totalAmount} ${currency}`);
  
  // Запрос к нашему API
  const apiResponse = await makeLocalApiRequest({
    amount: amount,
    userId: 1,
    productId: 1,
    country: country,
    currency: currency,
    force_country: true
  });
  
  if (!apiResponse || !apiResponse.clientSecret) {
    log('Не удалось получить корректный ответ от API', colors.red);
    return false;
  }
  
  // Извлекаем ID платежного намерения из client_secret
  const paymentIntentId = apiResponse.clientSecret.split('_secret_')[0];
  log(`ID платежного намерения: ${paymentIntentId}`);
  
  // Получаем детали платежного намерения напрямую из Stripe
  const paymentIntent = await getPaymentIntentDetails(paymentIntentId);
  
  if (!paymentIntent) {
    log('Не удалось получить данные из Stripe', colors.red);
    return false;
  }
  
  // Проверяем соответствие сумм
  logSection('Проверка результатов');
  
  log(`Сумма в PaymentIntent из Stripe: ${paymentIntent.amount} ${paymentIntent.currency}`);
  log(`Ожидаемая сумма с налогом: ${totalAmount} ${currency}`);
  
  if (paymentIntent.amount === totalAmount) {
    log(`✓ Сумма в Stripe соответствует ожидаемой сумме с налогом`, colors.green);
    return true;
  } else {
    log(`✗ Сумма в Stripe (${paymentIntent.amount}) не соответствует ожидаемой сумме с налогом (${totalAmount})`, colors.red);
    return false;
  }
}

async function main() {
  const tests = [
    { country: 'DE', amount: 10000, currency: 'eur' },
    { country: 'FR', amount: 10000, currency: 'eur' },
    { country: 'IT', amount: 10000, currency: 'eur' },
    { country: 'US', amount: 10000, currency: 'usd' }
  ];
  
  logSection('ТЕСТИРОВАНИЕ ПЕРЕДАЧИ СУММЫ С НАЛОГОМ В STRIPE');
  
  let passedTests = 0;
  
  for (const test of tests) {
    log(`\n${colors.yellow}▶ Тестирование для страны ${test.country}${colors.reset}`);
    const result = await verifyTaxAmount(test.country, test.amount, test.currency);
    
    if (result) {
      passedTests++;
    }
    
    log('---------------------------------------', colors.blue);
  }
  
  logSection('ИТОГИ ТЕСТИРОВАНИЯ');
  log(`Всего тестов: ${tests.length}`);
  log(`Успешно пройдено: ${passedTests}`, passedTests === tests.length ? colors.green : colors.yellow);
  
  if (passedTests === tests.length) {
    log(`✓ Все тесты успешно пройдены! Суммы с налогом корректно передаются в Stripe`, colors.green);
  } else {
    log(`✗ Некоторые тесты не пройдены. Требуется исправление`, colors.red);
  }
}

main().catch(error => {
  log(`ОШИБКА: ${error.message}`, colors.red);
});