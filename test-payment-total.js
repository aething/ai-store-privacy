/**
 * Тестовый скрипт для проверки корректности формирования полной суммы с налогом в PaymentIntent
 * 
 * Этот скрипт делает следующее:
 * 1. Создает PaymentIntent для выбранного продукта и страны
 * 2. Проверяет, что итоговая сумма в PaymentIntent включает налог
 * 3. Логирует подробную информацию для анализа
 * 
 * Использование:
 * node test-payment-total.js [productId] [country] [currency]
 * 
 * Примеры:
 * node test-payment-total.js 1 DE eur  - для продукта 1, Германия, евро
 * node test-payment-total.js 2 FR eur  - для продукта 2, Франция, евро
 * node test-payment-total.js 1 US usd  - для продукта 1, США, доллары
 */

import fetch from 'node-fetch';

// Форматирование валюты для вывода
function formatCurrency(amount, currency = 'usd') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount / 100);
}

// Функция для разделителя в консоли
function printDivider(title = '') {
  const divider = '-'.repeat(80);
  if (title) {
    const paddedTitle = ` ${title} `;
    const sideLength = Math.floor((80 - paddedTitle.length) / 2);
    console.log('\n' + '-'.repeat(sideLength) + paddedTitle + '-'.repeat(sideLength) + '\n');
  } else {
    console.log('\n' + divider + '\n');
  }
}

// Функция для проверки создания PaymentIntent с налогом
async function testPaymentIntent(productId = 1, country = 'DE', currency = 'eur') {
  try {
    // 1. Получаем информацию о продукте
    console.log(`Получение информации о продукте с ID ${productId}...`);
    const productResponse = await fetch(`http://localhost:5000/api/products/${productId}`);
    
    if (!productResponse.ok) {
      throw new Error(`Ошибка при получении продукта: ${productResponse.status} ${productResponse.statusText}`);
    }
    
    const product = await productResponse.json();
    console.log(`Продукт получен: ${product.title}`);
    
    // Определяем базовую цену в зависимости от валюты
    let price = currency === 'eur' ? product.priceEUR : product.priceUSD;
    
    // 2. Создаем PaymentIntent
    console.log(`Создание PaymentIntent для страны ${country} и валюты ${currency.toUpperCase()}...`);
    
    // Добавляем логи для отслеживания суммы
    console.log(`Базовая сумма без налога: ${formatCurrency(price, currency)}`);
    
    // Получаем cookie из файла для аутентифицированного запроса
    const fs = await import('fs');
    let cookieContent = '';
    try {
      cookieContent = fs.readFileSync('cookie.txt', 'utf8');
      console.log('Cookie файл загружен успешно');
    } catch (err) {
      console.log('Ошибка при чтении cookie файла:', err);
    }
    
    // Парсим cookie для извлечения connect.sid
    let cookieHeader = '';
    const connectSidMatch = cookieContent.match(/connect\.sid\s+([^\s]+)/);
    if (connectSidMatch && connectSidMatch[1]) {
      cookieHeader = `connect.sid=${connectSidMatch[1]}`;
      console.log('Cookie header extracted:', cookieHeader);
    } else {
      console.log('Cookie connect.sid не найден в файле cookie.txt');
    }
    
    const paymentResponse = await fetch('http://localhost:5000/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({
        productId,
        amount: price,  // Базовая сумма без налога
        currency,
        userId: "1",    // Используем существующего пользователя ID=1 (testuser)
        metadata: {
          country: country
        }
      })
    });
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      throw new Error(`Ошибка при создании PaymentIntent: ${paymentResponse.status} ${paymentResponse.statusText} - ${errorText}`);
    }
    
    const paymentData = await paymentResponse.json();
    
    // 3. Получаем детали созданного PaymentIntent для проверки
    // Извлекаем ID PaymentIntent из client_secret
    const piId = paymentData.clientSecret.split('_secret_')[0];
    
    // Логи результатов
    printDivider('РЕЗУЛЬТАТЫ ТЕСТА');
    console.log('Client Secret:', paymentData.clientSecret);
    console.log('Order ID:', paymentData.orderId);
    
    // Информация о налоге
    const taxInfo = paymentData.tax;
    console.log('\nНалоговая информация:');
    console.log('- Название налога:', taxInfo.label);
    console.log('- Ставка налога:', (taxInfo.rate * 100).toFixed(2) + '%');
    console.log('- Сумма налога:', formatCurrency(taxInfo.amount, currency));
    
    // Общая информация для отладки
    console.log('\nОбщая информация:');
    console.log('- Базовая сумма (без налога):', formatCurrency(price, currency));
    console.log('- Сумма налога:', formatCurrency(taxInfo.amount, currency));
    console.log('- Полная сумма (с налогом):', formatCurrency(price + taxInfo.amount, currency));
    
    // Проверка правильности расчета налога
    const expectedTaxAmount = Math.round(price * taxInfo.rate);
    const isCorrectTax = expectedTaxAmount === taxInfo.amount;
    
    console.log('\nПроверка расчета:');
    console.log('- Ожидаемая сумма налога:', formatCurrency(expectedTaxAmount, currency));
    console.log('- Фактическая сумма налога:', formatCurrency(taxInfo.amount, currency));
    console.log('- Расчет правильный?', isCorrectTax ? 'ДА ✓' : 'НЕТ ✗');
    
    // Итоговое заключение
    printDivider('ИТОГ');
    if (isCorrectTax) {
      console.log('✅ Тест УСПЕШЕН: Налог рассчитан правильно.');
      console.log(`✅ Для страны ${country} c продуктом ${productId} и валютой ${currency.toUpperCase()}:`);
      console.log(`✅ Налоговая ставка: ${(taxInfo.rate * 100).toFixed(2)}% (${taxInfo.label})`);
      console.log(`✅ Базовая сумма: ${formatCurrency(price, currency)}`);
      console.log(`✅ Сумма налога: ${formatCurrency(taxInfo.amount, currency)}`);
      console.log(`✅ Итоговая сумма: ${formatCurrency(price + taxInfo.amount, currency)}`);
    } else {
      console.log('❌ Тест ПРОВАЛЕН: Налог рассчитан некорректно.');
      console.log(`Ожидаемая сумма налога: ${formatCurrency(expectedTaxAmount, currency)}`);
      console.log(`Фактическая сумма налога: ${formatCurrency(taxInfo.amount, currency)}`);
    }
    
    return { success: true, data: paymentData };
  } catch (error) {
    console.error('Ошибка при тестировании создания PaymentIntent:', error);
    return { success: false, error: error.message };
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  const productId = args[0] ? parseInt(args[0]) : 1;
  const country = args[1] || 'DE';
  const currency = (args[2] || 'eur').toLowerCase();
  
  printDivider('НАЧАЛО ТЕСТА');
  console.log(`Тестирование для продукта ID ${productId}, страны ${country}, валюты ${currency.toUpperCase()}`);
  
  await testPaymentIntent(productId, country, currency);
}

// Запуск скрипта
main().catch(console.error);