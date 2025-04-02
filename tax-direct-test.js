/**
 * Скрипт для прямого тестирования расчета налога
 * 
 * Этот скрипт не импортирует существующие модули, а содержит копию кода
 * для расчета налогов из shared/tax.ts для проверки корректной работы логики
 */

// Копия EU_COUNTRIES из shared/tax.ts
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE'
];

// Копия isEUCountry из shared/tax.ts
function isEUCountry(country) {
  if (!country) return false;
  return EU_COUNTRIES.includes(country.toUpperCase());
}

// Копия shouldUseEUR из shared/tax.ts
function shouldUseEUR(country) {
  if (!country) return false;
  return isEUCountry(country);
}

// Копия EU_VAT_RATES из shared/tax.ts
const EU_VAT_RATES = {
  'AT': 0.20, // Austria
  'BE': 0.21, // Belgium
  'BG': 0.20, // Bulgaria
  'HR': 0.25, // Croatia
  'CY': 0.19, // Cyprus
  'CZ': 0.21, // Czech Republic
  'DK': 0.25, // Denmark
  'EE': 0.22, // Estonia
  'FI': 0.24, // Finland
  'FR': 0.20, // France
  'DE': 0.19, // Germany
  'GR': 0.24, // Greece
  'HU': 0.27, // Hungary
  'IE': 0.23, // Ireland
  'IT': 0.22, // Italy
  'LV': 0.21, // Latvia
  'LT': 0.21, // Lithuania
  'LU': 0.17, // Luxembourg
  'MT': 0.18, // Malta
  'NL': 0.21, // Netherlands
  'PL': 0.23, // Poland
  'PT': 0.23, // Portugal
  'RO': 0.19, // Romania
  'SK': 0.20, // Slovakia
  'SI': 0.22, // Slovenia
  'ES': 0.21, // Spain
  'SE': 0.25  // Sweden
};

// Копия US_TAX_RATE из shared/tax.ts
const US_TAX_RATE = 0;

// Копия getTaxRateForCountry из shared/tax.ts
function getTaxRateForCountry(country) {
  if (!country) return 0;
  
  country = country.toUpperCase();
  
  if (isEUCountry(country)) {
    return EU_VAT_RATES[country] || 0;
  } else if (country === 'US') {
    return US_TAX_RATE;
  }
  
  // Другие страны не облагаются налогом
  return 0;
}

// Копия getTaxLabel из shared/tax.ts
function getTaxLabel(country, taxRate) {
  if (!country) return 'Tax';
  
  country = country.toUpperCase();
  
  if (country === 'DE') {
    return `MwSt. (${Math.round(taxRate * 100)}%)`;
  } else if (country === 'FR') {
    return `TVA (${Math.round(taxRate * 100)}%)`;
  } else if (country === 'IT') {
    return `IVA (${Math.round(taxRate * 100)}%)`;
  } else if (country === 'ES') {
    return `IVA (${Math.round(taxRate * 100)}%)`;
  } else if (isEUCountry(country)) {
    return `VAT (${Math.round(taxRate * 100)}%)`;
  } else if (country === 'US') {
    return 'Sales Tax';
  }
  
  return 'Tax';
}

// Копия calculateTaxRate из shared/tax.ts
function calculateTaxRate(country) {
  // Получаем двухбуквенный код страны и преобразуем в верхний регистр
  const countryCode = country ? country.substring(0, 2).toUpperCase() : null;
  
  // Получаем налоговую ставку для страны
  const rate = getTaxRateForCountry(countryCode);
  
  // Формируем метку налога
  const label = getTaxLabel(countryCode, rate);
  
  return { rate, label };
}

// Тестовая функция
function testCountry(country) {
  console.log(`--- Testing tax calculation for ${country} ---`);
  const result = calculateTaxRate(country);
  console.log(`Rate: ${result.rate * 100}%`);
  console.log(`Label: ${result.label}`);
  return result;
}

// Запуск тестов для всех важных стран
function runTests() {
  const testCountries = ['DE', 'FR', 'IT', 'ES', 'AT', 'BE', 'NL', 'FI', 'GB', 'US'];
  
  console.log('TESTING TAX CALCULATION FOR ALL COUNTRIES\n');
  
  const results = {};
  for (const country of testCountries) {
    console.log(`\n=== ${country} ===`);
    results[country] = testCountry(country);
  }
  
  console.log('\n=== SUMMARY ===');
  for (const [country, result] of Object.entries(results)) {
    console.log(`${country}: ${result.rate * 100}% (${result.label})`);
  }
}

// Запустить все тесты
runTests();

// Если указана конкретная страна, протестировать только её
const specificCountry = process.argv[2];
if (specificCountry) {
  console.log(`\n=== TESTING SPECIFIC COUNTRY: ${specificCountry} ===`);
  testCountry(specificCountry);
}