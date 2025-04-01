/**
 * Инструмент для проверки логики определения валюты по коду страны
 * 
 * Использование:
 * node country-tester.mjs  - проверяет все страны из списка
 * node country-tester.mjs FR - проверяет только указанную страну
 */

// Список стран для проверки
const countriesToTest = [
  // Европейские страны (EUR)
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // Неевропейские страны (USD)
  'US', 'CA', 'CN', 'JP', 'RU', 'UK', 'AU', 'NZ', 'BR', 'IN'
];

// Функция для определения, должна ли страна использовать EUR
function shouldUseEUR(country) {
  if (!country) return false;
  
  // Европейские страны, использующие EUR
  const euroCountries = [
    // Коды стран
    'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
    'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'BG',
    'HR', 'CZ', 'DK', 'HU', 'PL', 'RO', 'SE',
    // Полные названия стран
    'Austria', 'Belgium', 'Cyprus', 'Estonia', 'Finland', 'France',
    'Germany', 'Greece', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
    'Luxembourg', 'Malta', 'Netherlands', 'Portugal', 'Slovakia',
    'Slovenia', 'Spain', 'Bulgaria', 'Croatia', 'Czech Republic',
    'Denmark', 'Hungary', 'Poland', 'Romania', 'Sweden'
  ];
  
  // Проверяем, входит ли страна в список европейских стран (регистр не имеет значения)
  return euroCountries.some(euroCountry => 
    euroCountry.toLowerCase() === country.toLowerCase()
  );
}

// Функция для получения строкового представления валюты страны
function getCurrencyForCountry(country) {
  return shouldUseEUR(country) ? "EUR" : "USD";
}

// Функция для проверки и вывода валюты для списка стран
function testCurrency(countries) {
  const eurCount = countries.filter(country => shouldUseEUR(country)).length;
  const usdCount = countries.length - eurCount;
  
  console.log(`Проверяем валюту для ${countries.length} стран (${eurCount} EUR, ${usdCount} USD):\n`);
  
  console.log("Европейские страны (EUR):");
  console.log("-------------------------");
  countries.forEach(country => {
    const currency = getCurrencyForCountry(country);
    if (currency === "EUR") {
      console.log(`${country}: ${currency} ✓`);
    }
  });
  
  console.log("\nНеевропейские страны (USD):");
  console.log("-------------------------");
  countries.forEach(country => {
    const currency = getCurrencyForCountry(country);
    if (currency === "USD") {
      console.log(`${country}: ${currency} ✓`);
    }
  });
  
  // Проверка на несоответствия
  const expectedEURCountries = [
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
    'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
    'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
  ];
  
  console.log("\nПроверка на несоответствия:");
  console.log("-------------------------");
  
  // Страны, которые должны быть в EUR, но вернули USD
  const shouldBeEUR = countries.filter(
    country => expectedEURCountries.includes(country) && getCurrencyForCountry(country) !== "EUR"
  );
  
  // Страны, которые должны быть в USD, но вернули EUR
  const shouldBeUSD = countries.filter(
    country => !expectedEURCountries.includes(country) && getCurrencyForCountry(country) === "EUR"
  );
  
  if (shouldBeEUR.length > 0) {
    console.log("❌ Следующие страны должны использовать EUR, но используют USD:");
    shouldBeEUR.forEach(country => console.log(`   - ${country}`));
  }
  
  if (shouldBeUSD.length > 0) {
    console.log("❌ Следующие страны должны использовать USD, но используют EUR:");
    shouldBeUSD.forEach(country => console.log(`   - ${country}`));
  }
  
  if (shouldBeEUR.length === 0 && shouldBeUSD.length === 0) {
    console.log("✅ Все страны используют правильную валюту!");
  }
}

// Функция для проверки конкретной страны
function checkCountry(country) {
  console.log(`Детальная проверка страны: ${country}`);
  console.log(`Должна ли использовать EUR: ${shouldUseEUR(country) ? "Да" : "Нет"}`);
  console.log(`Валюта: ${getCurrencyForCountry(country)}`);
  
  // Проверка на разные регистры
  const variations = [
    country.toLowerCase(),
    country.toUpperCase(),
    country.charAt(0).toUpperCase() + country.slice(1).toLowerCase()
  ];
  
  console.log("\nПроверка устойчивости к разным регистрам:");
  variations.forEach(variant => {
    console.log(`${variant}: ${getCurrencyForCountry(variant)}`);
  });
}

// Получаем аргумент командной строки, если он есть
const countryToCheck = process.argv[2];

if (countryToCheck) {
  // Если указана конкретная страна, проверяем только её
  checkCountry(countryToCheck);
} else {
  // Иначе проверяем все страны из списка
  testCurrency(countriesToTest);
}