/**
 * Скрипт для тестирования расчета налогов для разных стран
 * с использованием нового отладочного API
 * 
 * Использование:
 * node country-tax-test.js
 * node country-tax-test.js DE
 * node country-tax-test.js FR
 */

const fetch = require('node-fetch');

// Основной домен приложения
const BASE_URL = 'http://localhost:5000';

// Список стран для тестирования
const TEST_COUNTRIES = [
  'DE', // Germany - 19% MwSt
  'FR', // France - 20% TVA
  'IT', // Italy - 22% IVA
  'ES', // Spain - 21% IVA
  'AT', // Austria - 20% MwSt
  'NL', // Netherlands - 21% BTW
  'BE', // Belgium - 21% BTW
  'FI', // Finland - 24% VAT
  'GB', // United Kingdom - 0%
  'US'  // United States - 0% (no federal sales tax)
];

// Вспомогательная функция для вызова API
async function callTaxAPI(country) {
  const url = `${BASE_URL}/api/tax-debug/${country}`;
  console.log(`Calling API: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error calling API for ${country}:`, error.message);
    return { error: error.message };
  }
}

// Функция для отображения результата
function printResult(result) {
  if (result.error) {
    console.log(`❌ Error: ${result.error}`);
    return;
  }
  
  if (!result.success) {
    console.log('❌ API call was not successful');
    return;
  }
  
  const { country, taxInfo } = result;
  console.log(`
Country: ${country}
Tax Rate: ${taxInfo.rate * 100}%
Tax Label: ${taxInfo.label}
`);
}

// Функция для тестирования всех стран
async function testAllCountries() {
  console.log('Testing tax calculation for all countries...\n');
  
  for (const country of TEST_COUNTRIES) {
    console.log(`\n=== ${country} ===`);
    const result = await callTaxAPI(country);
    printResult(result);
  }
}

// Функция для тестирования одной страны
async function testOneCountry(country) {
  console.log(`\n=== Testing tax rate for ${country} ===`);
  const result = await callTaxAPI(country);
  printResult(result);
}

// Основная функция
async function main() {
  // Получаем страну из аргументов командной строки (если указана)
  const country = process.argv[2];
  
  if (country) {
    await testOneCountry(country);
  } else {
    await testAllCountries();
  }
}

// Запускаем скрипт
main().catch(error => {
  console.error('Unexpected error:', error);
});