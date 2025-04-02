/**
 * Скрипт для прямого тестирования функции calculateTaxRate из shared/tax.ts
 * 
 * Использование:
 * node test-tax-calculation.js [country]
 * 
 * Примеры:
 * node test-tax-calculation.js DE
 * node test-tax-calculation.js FR
 * node test-tax-calculation.js US
 */

// Для CommonJS используем require
const taxUtils = require('./shared/tax');

// Список стран для тестирования, если не указана конкретная
const TEST_COUNTRIES = [
  'DE', 'FR', 'IT', 'ES', 'AT', 'BE', 'NL', 'FI', 'GB', 'US'
];

function testCountry(country) {
  console.log(`\n--- Testing tax calculation for ${country} ---`);
  try {
    const result = taxUtils.calculateTaxRate(country);
    console.log(`Rate: ${result.rate * 100}%`);
    console.log(`Label: ${result.label}`);
    return result;
  } catch (error) {
    console.error(`Error calculating tax for ${country}:`, error);
    return null;
  }
}

function main() {
  const country = process.argv[2];
  
  if (country) {
    // Тестируем одну страну
    testCountry(country);
  } else {
    // Тестируем все страны из списка
    console.log('Testing all countries:');
    const results = {};
    
    for (const countryCode of TEST_COUNTRIES) {
      const result = testCountry(countryCode);
      if (result) {
        results[countryCode] = result;
      }
    }
    
    console.log('\n--- Summary ---');
    for (const [country, result] of Object.entries(results)) {
      console.log(`${country}: ${result.rate * 100}% (${result.label})`);
    }
  }
}

main();