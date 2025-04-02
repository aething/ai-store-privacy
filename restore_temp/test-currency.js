/**
 * Утилита для проверки логики определения валюты по стране
 */

// Функция определения, должна ли использоваться валюта EUR для страны
function shouldUseEUR(country) {
  if (!country) return false;
  
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

// Функция тестирования для набора стран
function testCurrency(countries) {
  console.log("\nТестирование определения валюты:\n");
  
  for (const country of countries) {
    const currency = getCurrencyForCountry(country);
    const isEur = shouldUseEUR(country);
    console.log(`${country}: ${currency} (${isEur ? 'Европа' : 'Не Европа'})`);
  }
}

// Проверка для конкретной страны
function checkCountry(country) {
  const currency = getCurrencyForCountry(country);
  const isEur = shouldUseEUR(country);
  
  console.log(`\nСтрана: ${country}`);
  console.log(`Валюта: ${currency}`);
  console.log(`Европейская страна: ${isEur ? 'Да' : 'Нет'}`);
}

// Получаем список стран для проверки из аргументов командной строки
const args = process.argv.slice(2);

if (args.length === 0) {
  // Если страны не указаны, проверяем несколько примеров
  testCurrency(['US', 'DE', 'FR', 'GB', 'JP', 'CA', 'AU', 'IT', 'ES', 'PL']);
} else if (args.length === 1 && args[0] === 'all') {
  // Проверяем все страны ЕС и несколько других стран
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  const otherCountries = ['US', 'GB', 'CA', 'AU', 'CN', 'JP', 'RU', 'BR', 'IN', 'ZA'];
  
  testCurrency([...euCountries, ...otherCountries]);
} else {
  // Проверяем указанные страны
  for (const country of args) {
    checkCountry(country);
  }
}