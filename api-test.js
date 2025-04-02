/**
 * Скрипт для тестирования API расчета налогов
 * 
 * Использование:
 * node api-test.js [country]
 * 
 * Примеры: 
 * node api-test.js DE  - тест для Германии
 * node api-test.js FR  - тест для Франции
 * node api-test.js US  - тест для США
 */

import fetch from 'node-fetch';

async function testTaxCalculation(country = 'DE', amount = 1000) {
  try {
    console.log(`Testing tax calculation for country: ${country}, amount: ${amount}`);

    const response = await fetch(`http://localhost:5000/api/tax-debug/calculate?amount=${amount}&country=${country}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Tax Calculation Result:');
    console.log('======================');
    console.log(`Amount: ${data.amount} ${data.currency.toUpperCase()}`);
    console.log(`Country: ${country}`);
    console.log(`Tax Rate: ${(data.taxRate * 100).toFixed(2)}%`);
    console.log(`Tax Amount: ${data.taxAmount} ${data.currency.toUpperCase()}`);
    console.log(`Tax Label: ${data.taxLabel}`);
    console.log(`Total: ${data.total} ${data.currency.toUpperCase()}`);
    console.log(`EU Country: ${data.isEU ? 'Yes' : 'No'}`);
    console.log('======================');
    
    return data;
  } catch (error) {
    console.error('Error testing tax calculation:', error.message);
    console.error('Full error:', error);
  }
}

async function main() {
  const country = process.argv[2] || 'DE';
  const data = await testTaxCalculation(country);
  
  // Теперь проверим результаты расчетов
  if (data) {
    if (country === 'DE' && data.taxRate === 0.19) {
      console.log('✅ German VAT rate correctly set to 19%');
    } else if (country === 'FR' && data.taxRate === 0.20) {
      console.log('✅ French VAT rate correctly set to 20%');
    } else if (country === 'US' && data.taxRate === 0) {
      console.log('✅ US tax rate correctly set to 0%');
    }
    
    if (country === 'DE' || country === 'FR') {
      if (data.currency === 'eur') {
        console.log('✅ EU country correctly using EUR currency');
      } else {
        console.log('❌ EU country should use EUR currency!');
      }
    } else if (country === 'US') {
      if (data.currency === 'usd') {
        console.log('✅ US correctly using USD currency');
      } else {
        console.log('❌ US should use USD currency!');
      }
    }
  }
}

main();