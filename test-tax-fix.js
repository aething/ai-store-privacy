/**
 * Скрипт для тестирования исправленного расчета налогов и создания PaymentIntent
 * 
 * Этот скрипт проверяет правильность расчета налогов для разных стран
 * и корректность формирования полной суммы (с налогом) для Stripe.
 * 
 * Использование:
 * node test-tax-fix.js [country]
 * 
 * Примеры:
 * node test-tax-fix.js DE - для тестирования Германии
 * node test-tax-fix.js FR - для тестирования Франции
 * node test-tax-fix.js US - для тестирования США
 */

import fetch from 'node-fetch';

// Логирование с различным цветом для лучшей читаемости
const log = {
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`), // Голубой
  success: (msg) => console.log(`\x1b[32m${msg}\x1b[0m`), // Зеленый
  error: (msg) => console.log(`\x1b[31m${msg}\x1b[0m`), // Красный
  warn: (msg) => console.log(`\x1b[33m${msg}\x1b[0m`), // Желтый
  title: (msg) => console.log(`\x1b[35m${msg}\x1b[0m`), // Пурпурный
  divider: () => console.log('-'.repeat(80))
};

// Тестовые данные для налогов разных стран
const TAX_DATA = {
  'DE': { rate: 0.19, label: 'MwSt. 19%', currency: 'eur' },
  'FR': { rate: 0.20, label: 'TVA 20%', currency: 'eur' },
  'IT': { rate: 0.22, label: 'IVA 22%', currency: 'eur' },
  'ES': { rate: 0.21, label: 'IVA 21%', currency: 'eur' },
  'NL': { rate: 0.21, label: 'BTW 21%', currency: 'eur' },
  'GB': { rate: 0.20, label: 'VAT 20%', currency: 'usd' },
  'US': { rate: 0.00, label: 'No Sales Tax', currency: 'usd' }
};

/**
 * Проверка расчета налогов и создания платежного намерения
 */
async function testTaxCalculation(country) {
  const countryInfo = TAX_DATA[country] || TAX_DATA['DE'];
  const basePrice = 2500; // Базовая цена в центах/копейках
  const taxRate = countryInfo.rate;
  const taxAmount = Math.round(basePrice * taxRate);
  const totalAmount = basePrice + taxAmount;
  const currency = countryInfo.currency;
  
  log.title(`\n=== ТЕСТИРОВАНИЕ РАСЧЕТА НАЛОГОВ ДЛЯ ${country} ===`);
  log.info(`Базовая цена: ${basePrice} ${currency}`);
  log.info(`Ставка налога: ${(taxRate * 100).toFixed(2)}% (${countryInfo.label})`);
  log.info(`Сумма налога: ${taxAmount} ${currency}`);
  log.info(`Итоговая сумма: ${totalAmount} ${currency}`);
  log.divider();
  
  // Формируем тестовый запрос с правильными данными о налогах
  try {
    log.warn('Отправляем запрос на создание PaymentIntent с полными данными...');
    
    const response = await fetch('http://localhost:5000/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 1,
        userId: 1,
        amount: totalAmount,
        baseAmount: basePrice,
        taxAmount,
        taxRate,
        taxLabel: countryInfo.label,
        currency,
        country,
        test_mode: true,
        override_user_country: true,
        use_provided_country: true,
        force_country: country,
        metadata: {
          country,
          force_country: country,
          taxRate: taxRate.toString(),
          taxLabel: countryInfo.label,
          baseAmount: basePrice.toString(),
          taxAmount: taxAmount.toString(),
          totalAmount: totalAmount.toString()
        }
      })
    });
    
    if (!response.ok) {
      log.error(`Ошибка API: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      log.error(`Детали ошибки: ${errorText}`);
      return false;
    }
    
    const result = await response.json();
    log.divider();
    log.title('РЕЗУЛЬТАТ ЗАПРОСА:');
    console.log(JSON.stringify(result, null, 2));
    log.divider();
    
    // Проверяем соответствие результатов ожиданиям
    log.title('ПРОВЕРКА РЕЗУЛЬТАТОВ:');
    
    const checks = [
      { 
        name: 'Итоговая сумма', 
        expected: totalAmount, 
        actual: result.amount,
        success: result.amount === totalAmount
      },
      { 
        name: 'Базовая сумма', 
        expected: basePrice, 
        actual: result.baseAmount,
        success: result.baseAmount === basePrice
      },
      { 
        name: 'Сумма налога', 
        expected: taxAmount, 
        actual: result.tax?.amount,
        success: result.tax?.amount === taxAmount
      },
      { 
        name: 'Ставка налога', 
        expected: taxRate, 
        actual: result.tax?.rate,
        success: result.tax?.rate === taxRate
      },
      { 
        name: 'Метка налога', 
        expected: countryInfo.label, 
        actual: result.tax?.label,
        success: result.tax?.label === countryInfo.label
      }
    ];
    
    let allSuccess = true;
    checks.forEach(check => {
      if (check.success) {
        log.success(`✓ ${check.name}: ${check.expected} (OK)`);
      } else {
        log.error(`✗ ${check.name}: ожидалось ${check.expected}, получено ${check.actual}`);
        allSuccess = false;
      }
    });
    
    log.divider();
    if (allSuccess) {
      log.success('✓ ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ!');
    } else {
      log.error('✗ ТЕСТЫ ЗАВЕРШЕНЫ С ОШИБКАМИ!');
    }
    
    return allSuccess;
  } catch (error) {
    log.error(`Ошибка при выполнении теста: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function main() {
  // Определяем страну из аргументов командной строки
  const country = process.argv[2]?.toUpperCase() || 'DE';
  
  if (!TAX_DATA[country]) {
    log.error(`Неизвестная страна: ${country}`);
    log.info(`Доступные страны: ${Object.keys(TAX_DATA).join(', ')}`);
    process.exit(1);
  }
  
  const success = await testTaxCalculation(country);
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Необработанная ошибка:', err);
  process.exit(1);
});