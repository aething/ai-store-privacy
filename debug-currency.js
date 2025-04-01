/**
 * Скрипт для отладки определения валюты
 * 
 * Используется для проверки работы функций определения валюты как на сервере,
 * так и в клиентской части
 */

// Функция определения, должна ли использоваться валюта EUR для страны
function shouldUseEUR(country) {
  if (!country) return false;
  
  // Коды стран Европейского Союза
  const eurCountryCodes = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  // Проверка на код страны (если длина 2 символа)
  if (country.length === 2) {
    const result = eurCountryCodes.includes(country.toUpperCase());
    console.log(`Country code ${country} is European? ${result}`);
    return result;
  }
  
  // Полные названия стран Европейского Союза
  const eurCountries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
  ];
  
  // Проверка на полное название страны
  const result = eurCountries.includes(country);
  console.log(`Country ${country} is European? ${result}`);
  return result;
}

// Получение валюты для страны
function getCurrencyForCountry(country) {
  return shouldUseEUR(country) ? 'EUR' : 'USD';
}

// Тестируем различные коды стран
function testCountries() {
  console.log('\n=== ТЕСТИРОВАНИЕ ОПРЕДЕЛЕНИЯ ВАЛЮТЫ ПО СТРАНЕ ===\n');
  
  // Тестовые данные для проверки
  const testCases = [
    { country: 'US', expected: 'USD' },
    { country: 'DE', expected: 'EUR' },
    { country: 'FR', expected: 'EUR' },
    { country: 'GB', expected: 'USD' },
    { country: 'Germany', expected: 'EUR' },
    { country: 'france', expected: 'USD' }, // регистр имеет значение
    { country: null, expected: 'USD' },
    { country: undefined, expected: 'USD' },
    { country: '', expected: 'USD' }
  ];
  
  // Проверяем каждый случай
  for (const testCase of testCases) {
    const currency = getCurrencyForCountry(testCase.country);
    const result = currency === testCase.expected ? 'Успех ✓' : `Ошибка ✗ (ожидалось ${testCase.expected})`;
    console.log(`Страна: ${testCase.country || 'пусто'}, Валюта: ${currency}, Результат: ${result}`);
  }
}

// Проверка сохранения и чтения из localStorage
function checkLocalStorage() {
  console.log('\n=== ПРОВЕРКА СОХРАНЕНИЯ ДАННЫХ В LOCALSTORAGE ===\n');
  
  // Это работает только в браузере, для Node.js просто выводим сообщение
  console.log('⚠️ Внимание: Этот тест для localStorage должен выполняться в браузере.');
  console.log('В Node.js можно только имитировать работу localStorage.');
  
  // Имитация localStorage для Node.js
  const mockStorage = {};
  
  const localStorage = {
    setItem: (key, value) => {
      mockStorage[key] = value;
      console.log(`🔵 Сохранено в localStorage: ${key} = ${value}`);
    },
    getItem: (key) => {
      console.log(`🔍 Чтение из localStorage: ${key} = ${mockStorage[key] || 'не найдено'}`);
      return mockStorage[key];
    }
  };
  
  // Тестовые данные пользователя
  const testUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    country: 'DE'
  };
  
  // Сохраняем данные пользователя
  localStorage.setItem('user', JSON.stringify(testUser));
  
  // Читаем данные пользователя
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    console.log(`📋 Данные пользователя: id=${user.id}, username=${user.username}, country=${user.country}`);
    
    // Определяем валюту для сохраненной страны
    const currency = getCurrencyForCountry(user.country);
    console.log(`💰 Валюта для страны ${user.country}: ${currency}`);
  }
}

// Тестируем API сервера (это требует запущенного сервера)
async function testApi() {
  console.log('\n=== ТЕСТИРОВАНИЕ API СЕРВЕРА ===\n');
  
  console.log('⚠️ Внимание: Этот тест требует запущенного сервера.');
  console.log('Для полного тестирования запустите сервер и выполните эти запросы в браузере.');
  
  console.log(`
📌 Для тестирования API выполните следующие команды:

1. Получение текущего пользователя:
   curl -v -b cookie.txt http://localhost:5000/api/users/me
   
2. Получение продуктов с учетом страны:
   curl -v http://localhost:5000/api/products?country=DE
   
3. Авторизация и смена страны:
   node test-country-change.js DE
  `);
}

// Запускаем все тесты
testCountries();
checkLocalStorage();
testApi();