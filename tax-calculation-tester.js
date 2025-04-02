/**
 * Тестирование расчета налогов для разных стран и сумм
 * 
 * Этот скрипт помогает проверить логику расчета налогов для разных стран
 * и формирования PaymentIntent в Stripe с учетом налогов.
 * 
 * Использование:
 * node tax-calculation-tester.js [country] [amount] [currency]
 * 
 * Примеры:
 * node tax-calculation-tester.js DE 1000 eur  - тест для Германии (ставка 19%)
 * node tax-calculation-tester.js US 1000 usd  - тест для США (без налога)
 * node tax-calculation-tester.js FR 1000 eur  - тест для Франции (ставка 20%)
 */

import fetch from 'node-fetch';

// Получаем аргументы командной строки
const country = process.argv[2] || 'DE';
const amount = parseInt(process.argv[3]) || 1000;
const currency = process.argv[4] || 'eur';

// Форматирование валюты
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

// Ожидаемые налоговые ставки для проверки
const expectedTaxRates = {
  DE: 0.19,  // 19% VAT in Germany
  FR: 0.20,  // 20% VAT in France
  IT: 0.22,  // 22% VAT in Italy
  ES: 0.21,  // 21% VAT in Spain
  GB: 0.20,  // 20% VAT in UK
  US: 0.00,  // No VAT in US
  CA: 0.05,  // 5% GST in Canada (simplified)
  AU: 0.10,  // 10% GST in Australia
};

async function testTaxCalculation() {
  console.log('\n===== Tax Calculation Test =====');
  console.log(`Country: ${country}`);
  console.log(`Amount: ${formatCurrency(amount, currency)}`);
  console.log(`Currency: ${currency.toUpperCase()}`);
  console.log('==============================\n');
  
  try {
    console.log('Creating payment intent with tax calculation...');
    const response = await fetch('http://localhost:5000/api/tax-debug/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: 1,
        userId: 1,
        amount,
        currency,
        country
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('\n✅ Payment Intent created successfully!');
    console.log(`Client Secret: ${result.clientSecret}`);
    console.log(`Order ID: ${result.orderId}`);
    
    // Проверка налогов
    if (result.tax) {
      const { amount: taxAmount, rate: taxRate, label: taxLabel } = result.tax;
      const expectedRate = expectedTaxRates[country] || 0;
      const expectedTaxAmount = Math.round(amount * expectedRate);
      
      console.log('\n📊 Tax Information:');
      console.log(`- Tax Rate: ${(taxRate * 100).toFixed(2)}%`);
      console.log(`- Tax Amount: ${formatCurrency(taxAmount, currency)}`);
      console.log(`- Tax Description: ${taxLabel}`);
      
      // Проверка правильности расчета
      console.log('\n🔍 Validation:');
      if (Math.abs(taxRate - expectedRate) < 0.0001) {
        console.log(`✅ Tax rate is correct: ${(taxRate * 100).toFixed(2)}% (expected ${(expectedRate * 100).toFixed(2)}%)`);
      } else {
        console.log(`❌ Tax rate is incorrect: ${(taxRate * 100).toFixed(2)}% (expected ${(expectedRate * 100).toFixed(2)}%)`);
      }
      
      if (taxAmount === expectedTaxAmount) {
        console.log(`✅ Tax amount is correct: ${formatCurrency(taxAmount, currency)}`);
      } else {
        console.log(`❌ Tax amount is incorrect: ${formatCurrency(taxAmount, currency)} (expected ${formatCurrency(expectedTaxAmount, currency)})`);
      }
      
      // Итоговая сумма
      const totalAmount = amount + taxAmount;
      console.log(`\n💰 Total amount: ${formatCurrency(totalAmount, currency)}`);
    } else {
      console.log('\n❌ No tax information returned from the server!');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Запуск теста
testTaxCalculation();