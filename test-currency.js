/**
 * Тестовый скрипт для проверки логики определения валюты
 * 
 * Используйте этот скрипт в консоли браузера для проверки, как система
 * определяет валюту для различных стран
 */

// Список европейских стран для валюты EUR
const europeanCountries = [
  'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic',
  'denmark', 'estonia', 'finland', 'france', 'germany', 'greece',
  'hungary', 'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg',
  'malta', 'netherlands', 'poland', 'portugal', 'romania', 'slovakia',
  'slovenia', 'spain', 'sweden'
];

// Коды стран Европейского Союза
const europeanCountryCodes = [
  'at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr',
  'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk',
  'si', 'es', 'se'
];

// Функция для определения, нужно ли использовать EUR
function shouldUseEUR(country) {
  if (!country) return false;
  
  const normalizedCountry = country.trim().toLowerCase();
  
  // Проверяем, является ли это кодом страны (например, 'DE')
  if (normalizedCountry.length === 2) {
    console.log(`Проверяем, является ли код страны ${normalizedCountry} европейским кодом`);
    return europeanCountryCodes.includes(normalizedCountry);
  }
  
  // Проверяем полное название страны
  console.log(`Проверяем, является ли страна ${normalizedCountry} европейской страной`);
  return europeanCountries.includes(normalizedCountry);
}

// Функция для получения валюты по стране
function getCurrencyForCountry(country) {
  return shouldUseEUR(country) ? 'EUR' : 'USD';
}

// Функция для тестирования различных стран
function testCurrency(countries) {
  console.log("=== ТЕСТ ОПРЕДЕЛЕНИЯ ВАЛЮТЫ ПО СТРАНАМ ===");
  console.log("Тестируем логику определения валюты для разных стран:\n");
  
  for (const country of countries) {
    const currency = getCurrencyForCountry(country);
    const result = currency === 'EUR' ? '✅ EUR (€)' : '💵 USD ($)';
    console.log(`${country}: ${result}`);
  }
}

// Список стран для теста
const testCountries = [
  'US',         // США - должен быть USD
  'DE',         // Германия - должен быть EUR
  'FR',         // Франция - должен быть EUR
  'UK',         // Великобритания - должен быть USD
  'RU',         // Россия - должен быть USD
  'Germany',    // Германия полное название - должен быть EUR
  'United States', // США полное название - должен быть USD
  'Italy',      // Италия - должен быть EUR
  'Japan',      // Япония - должен быть USD
  'China',      // Китай - должен быть USD
  'es',         // Испания (код) - должен быть EUR
  'ca',         // Канада (код) - должен быть USD
  ''            // Пустая строка - должен быть USD по умолчанию
];

// Запускаем тест
testCurrency(testCountries);

// Функция для проверки конкретной страны
function checkCountry(country) {
  const currency = getCurrencyForCountry(country);
  console.log(`\nСтрана: ${country || 'не указана'}`);
  console.log(`Валюта: ${currency === 'EUR' ? '€ (EUR)' : '$ (USD)'}`);
  return currency;
}

console.log("\nДля проверки конкретной страны используйте функцию checkCountry()");
console.log("Примеры: checkCountry('US'), checkCountry('DE'), checkCountry('France')");