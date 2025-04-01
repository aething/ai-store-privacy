/**
 * Скрипт для тестирования определения валюты по стране
 * 
 * Использование:
 * node country-tester.mjs
 * 
 * Скрипт проверяет корректность работы логики определения валюты
 * для всех стран Европейского Союза и нескольких других стран
 */

// Функция определения, должна ли использоваться валюта EUR для страны
function shouldUseEUR(country) {
  // Список кодов стран Европейского Союза
  const euCountries = [
    // Используем двухбуквенные коды стран (ISO 3166-1 alpha-2)
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  // Соответствие полных названий стран их кодам
  const countryNameToCode = {
    'Austria': 'AT',
    'Belgium': 'BE',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Cyprus': 'CY',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Estonia': 'EE',
    'Finland': 'FI',
    'France': 'FR',
    'Germany': 'DE',
    'Greece': 'GR',
    'Hungary': 'HU',
    'Ireland': 'IE',
    'Italy': 'IT',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Malta': 'MT',
    'Netherlands': 'NL',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Romania': 'RO',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Spain': 'ES',
    'Sweden': 'SE'
  };
  
  // Если country - полное название страны, конвертируем его в код
  const countryCode = countryNameToCode[country] || country;
  
  // Проверяем, входит ли страна в список стран ЕС
  return euCountries.includes(countryCode.toUpperCase());
}

// Функция для получения валюты по стране
function getCurrencyForCountry(country) {
  return shouldUseEUR(country) ? "EUR" : "USD";
}

// Функция тестирования для списка стран
function testCurrency(countries) {
  const results = [];
  const errors = [];
  
  for (const [code, expectedCurrency] of Object.entries(countries)) {
    const actualCurrency = getCurrencyForCountry(code);
    const isCorrect = actualCurrency === expectedCurrency;
    
    results.push({
      code,
      expected: expectedCurrency,
      actual: actualCurrency,
      isCorrect
    });
    
    if (!isCorrect) {
      errors.push({ code, expected: expectedCurrency, actual: actualCurrency });
    }
  }
  
  return { results, errors };
}

// Проверка для конкретной страны
function checkCountry(country) {
  const currency = getCurrencyForCountry(country);
  return {
    country,
    currency,
    isEUR: currency === "EUR"
  };
}

// Основная функция тестирования
function runTests() {
  console.log("Проверяем валюту для 37 стран (27 EUR, 10 USD):\n");
  
  // Список европейских стран (должны использовать EUR)
  const euCountries = {
    'AT': 'EUR', // Австрия
    'BE': 'EUR', // Бельгия
    'BG': 'EUR', // Болгария
    'HR': 'EUR', // Хорватия
    'CY': 'EUR', // Кипр
    'CZ': 'EUR', // Чехия
    'DK': 'EUR', // Дания
    'EE': 'EUR', // Эстония
    'FI': 'EUR', // Финляндия
    'FR': 'EUR', // Франция
    'DE': 'EUR', // Германия
    'GR': 'EUR', // Греция
    'HU': 'EUR', // Венгрия
    'IE': 'EUR', // Ирландия
    'IT': 'EUR', // Италия
    'LV': 'EUR', // Латвия
    'LT': 'EUR', // Литва
    'LU': 'EUR', // Люксембург
    'MT': 'EUR', // Мальта
    'NL': 'EUR', // Нидерланды
    'PL': 'EUR', // Польша
    'PT': 'EUR', // Португалия
    'RO': 'EUR', // Румыния
    'SK': 'EUR', // Словакия
    'SI': 'EUR', // Словения
    'ES': 'EUR', // Испания
    'SE': 'EUR', // Швеция
  };
  
  // Список неевропейских стран (должны использовать USD)
  const nonEuCountries = {
    'US': 'USD', // США
    'CA': 'USD', // Канада
    'CN': 'USD', // Китай
    'JP': 'USD', // Япония
    'RU': 'USD', // Россия
    'UK': 'USD', // Великобритания
    'AU': 'USD', // Австралия
    'NZ': 'USD', // Новая Зеландия
    'BR': 'USD', // Бразилия
    'IN': 'USD', // Индия
  };
  
  // Тестируем европейские страны
  console.log("Европейские страны (EUR):");
  console.log("-------------------------");
  
  const euResults = testCurrency(euCountries);
  
  for (const result of euResults.results) {
    console.log(`${result.code}: ${result.actual} ${result.isCorrect ? '✓' : '✗'}`);
  }
  
  // Тестируем неевропейские страны
  console.log("\nНеевропейские страны (USD):");
  console.log("-------------------------");
  
  const nonEuResults = testCurrency(nonEuCountries);
  
  for (const result of nonEuResults.results) {
    console.log(`${result.code}: ${result.actual} ${result.isCorrect ? '✓' : '✗'}`);
  }
  
  // Выводим итоги
  const allErrors = [...euResults.errors, ...nonEuResults.errors];
  
  console.log("\nПроверка на несоответствия:");
  console.log("-------------------------");
  
  if (allErrors.length === 0) {
    console.log("✅ Все страны используют правильную валюту!");
  } else {
    console.log(`❌ Найдено ${allErrors.length} ошибок:`);
    for (const error of allErrors) {
      console.log(`  - ${error.code}: ожидалось ${error.expected}, получено ${error.actual}`);
    }
  }
}

// Запускаем тесты
runTests();