/**
 * Скрипт для тестирования итогового решения по расчету налогов
 * без модификаций и принудительной подмены значений
 * 
 * Использование:
 * node tax-live-test.js [country]
 * 
 * Примеры:
 * node tax-live-test.js DE
 * node tax-live-test.js FR
 * node tax-live-test.js US
 */

import fetch from 'node-fetch';

const countries = {
  'DE': { rate: 0.19, label: 'MwSt. 19%', currency: 'eur' },
  'FR': { rate: 0.20, label: 'TVA 20%', currency: 'eur' },
  'GB': { rate: 0.20, label: 'VAT 20%', currency: 'usd' },
  'US': { rate: 0.00, label: 'No Sales Tax', currency: 'usd' },
  'FI': { rate: 0.255, label: 'ALV 25.5%', currency: 'eur' },
  'IT': { rate: 0.22, label: 'IVA 22%', currency: 'eur' },
};

async function testTaxCalculation(country) {
  const countryInfo = countries[country] || countries['DE'];
  const basePrice = 2500; // Базовая цена в центах/копейках
  const taxRate = countryInfo.rate;
  const taxAmount = Math.round(basePrice * taxRate);
  const totalAmount = basePrice + taxAmount;
  const currency = countryInfo.currency;

  console.log('='.repeat(80));
  console.log(`ТЕСТ РАСЧЕТА НАЛОГОВ ДЛЯ ${country} (${countryInfo.label})`);
  console.log('='.repeat(80));
  console.log(`Базовая цена: ${basePrice} ${currency}`);
  console.log(`Ставка налога: ${(taxRate * 100).toFixed(1)}%`);
  console.log(`Сумма налога: ${taxAmount} ${currency}`);
  console.log(`ИТОГО с налогом: ${totalAmount} ${currency}`);
  console.log('-'.repeat(80));

  try {
    // Создаем платежное намерение с полной передачей данных как в клиентском коде
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 1,
        amount: totalAmount,
        baseAmount: basePrice,
        taxAmount,
        taxRate,
        taxLabel: countryInfo.label,
        currency,
        userId: 1,
        country,
        override_user_country: true,
        use_provided_country: true,
        force_country: country,
        metadata: {
          country,
          force_country: country,
          taxRate: taxRate.toString(),
          taxLabel: countryInfo.label,
          basePrice: basePrice.toString(),
          taxAmount: taxAmount.toString(),
          totalWithTax: totalAmount.toString()
        }
      })
    };

    console.log('Выполняем запрос с полными данными о налогах...');
    const response = await fetch('http://localhost:5000/api/create-payment-intent', request);
    const data = await response.json();
    
    console.log('Ответ API:', JSON.stringify(data, null, 2));
    console.log('-'.repeat(80));
    
    // Проверяем, что все значения корректны
    console.log('РЕЗУЛЬТАТЫ ПРОВЕРКИ:');
    console.log(`Ожидаемая полная сумма: ${totalAmount}, Получена: ${data.amount || 'не указана'}`);
    console.log(`Ожидаемая базовая сумма: ${basePrice}, Получена: ${data.baseAmount || 'не указана'}`);
    console.log(`Ожидаемая сумма налога: ${taxAmount}, Получена: ${data.tax?.amount || 'не указана'}`);
    console.log(`Ожидаемая ставка налога: ${taxRate}, Получена: ${data.tax?.rate || 'не указана'}`);
    console.log(`Ожидаемая метка налога: ${countryInfo.label}, Получена: ${data.tax?.label || 'не указана'}`);
    
    const success = 
      data.amount === totalAmount && 
      data.baseAmount === basePrice &&
      data.tax?.amount === taxAmount &&
      data.tax?.rate === taxRate &&
      data.tax?.label === countryInfo.label;
    
    console.log('-'.repeat(80));
    console.log(`ИТОГОВЫЙ РЕЗУЛЬТАТ: ${success ? 'УСПЕХ ✓' : 'ОШИБКА ✗'}`);
    
    return { success, data };
  } catch (error) {
    console.error('Ошибка при выполнении теста:', error);
    return { success: false, error };
  }
}

async function main() {
  // Определяем страну из аргументов командной строки или используем Германию по умолчанию
  const country = process.argv[2] || 'DE';
  
  if (!countries[country]) {
    console.log(`Неизвестная страна: ${country}`);
    console.log(`Доступные страны: ${Object.keys(countries).join(', ')}`);
    process.exit(1);
  }
  
  await testTaxCalculation(country);
}

main().catch(console.error);