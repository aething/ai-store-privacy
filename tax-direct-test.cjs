/**
 * Прямое тестирование расчета налогов через API с авторизацией
 * 
 * Этот скрипт:
 * 1. Выполняет вход в систему как тестовый пользователь
 * 2. Проверяет налоговые ставки для разных стран через прямой API
 * 3. Проверяет создание платежного намерения с налогом
 * 
 * Использование:
 * node tax-direct-test.cjs [страна]
 */

const https = require('https');
const http = require('http');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Конфигурация
const BASE_URL = 'http://localhost:5000';
const TEST_USER = { username: 'testuser', password: 'Test123!' };
const TEST_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'GB', 'US'];
const TEST_AMOUNT = 10000; // 100.00 в центах

// Хранение cookie сессии
let sessionCookie = '';

/**
 * Вспомогательная функция для HTTP запросов с поддержкой cookie
 */
async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  // Добавляем cookie в заголовки, если есть
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (sessionCookie) {
    headers.Cookie = sessionCookie;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Сохраняем cookie сессии, если они есть
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      sessionCookie = cookies;
    }
    
    // Возвращаем JSON ответ
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({ message: 'Не удалось распарсить JSON' }))
    };
  } catch (error) {
    console.error(`Ошибка API запроса: ${error.message}`);
    return {
      ok: false,
      status: 0,
      data: { message: error.message }
    };
  }
}

/**
 * Авторизация
 */
async function login(username, password) {
  console.log(`Выполняем вход пользователя: ${username}`);
  
  const response = await apiRequest('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (response.ok) {
    console.log('✅ Успешная авторизация');
    return true;
  } else {
    console.error(`❌ Ошибка авторизации: ${response.data.message || 'Неизвестная ошибка'}`);
    return false;
  }
}

/**
 * Получение текущего пользователя
 */
async function getCurrentUser() {
  const response = await apiRequest('/api/users/me');
  
  if (response.ok) {
    console.log(`✅ Текущий пользователь: ${response.data.username}`);
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Страна: ${response.data.country || 'не указана'}`);
    return response.data;
  } else {
    console.error('❌ Не удалось получить данные пользователя');
    return null;
  }
}

/**
 * Изменение страны пользователя
 */
async function updateUserCountry(userId, country) {
  console.log(`Изменяем страну пользователя на: ${country}`);
  
  const response = await apiRequest(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ country })
  });
  
  if (response.ok) {
    console.log(`✅ Страна пользователя изменена на ${country}`);
    return true;
  } else {
    console.error(`❌ Ошибка изменения страны: ${response.data.message || 'Неизвестная ошибка'}`);
    return false;
  }
}

/**
 * Проверка расчета налогов через отладочное API
 */
async function checkTaxCalculation(country) {
  console.log(`\n== Проверка расчета налогов для ${country} ==`);
  
  const response = await apiRequest(`/api/tax-debug/${country}`);
  
  if (response.ok) {
    const { taxInfo } = response.data;
    console.log(`✅ Ставка налога: ${taxInfo.rate * 100}%`);
    console.log(`   Название: ${taxInfo.label}`);
    return taxInfo;
  } else {
    console.error('❌ Ошибка получения налоговой ставки');
    return null;
  }
}

/**
 * Создание платежного намерения с налогом
 */
async function createPaymentIntent(country, amount = TEST_AMOUNT) {
  console.log(`\n== Создание payment intent для ${country} ==`);
  const currency = country === 'US' ? 'usd' : 'eur';
  
  const payload = {
    amount,
    userId: 1,  // Используем ID тестового пользователя как число!
    productId: 1,  // Используем ID продукта как число!
    currency,
    country,
    force_country: true  // Явно указываем использовать переданную страну
  };
  
  console.log('Отправляемые данные:', payload);
  
  const response = await apiRequest('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    console.log('✅ Payment Intent создан успешно');
    console.log('   Client Secret:', response.data.clientSecret.substring(0, 20) + '...');
    return response.data;
  } else {
    console.error(`❌ Ошибка создания Payment Intent: ${response.data.message || 'Неизвестная ошибка'}`);
    return null;
  }
}

/**
 * Тестирование одной страны
 */
async function testCountry(country) {
  console.log(`\n===== ТЕСТИРОВАНИЕ СТРАНЫ: ${country} =====`);
  
  // Изменяем страну пользователя
  const currentUser = await getCurrentUser();
  if (currentUser) {
    await updateUserCountry(currentUser.id, country);
  }
  
  // Проверяем расчет налогов
  const taxInfo = await checkTaxCalculation(country);
  
  // Создаем платежное намерение
  if (taxInfo) {
    // Рассчитываем ожидаемую сумму с налогом
    const expectedTaxAmount = Math.round(TEST_AMOUNT * taxInfo.rate);
    const expectedTotal = TEST_AMOUNT + expectedTaxAmount;
    
    console.log(`Ожидаемая сумма налога: ${expectedTaxAmount}`);
    console.log(`Ожидаемая общая сумма: ${expectedTotal}`);
    
    // Создаем платежное намерение
    await createPaymentIntent(country);
  }
}

/**
 * Основная функция
 */
async function main() {
  // Получаем страну из аргументов командной строки (если указана)
  const country = process.argv[2];
  
  // Выполняем вход
  const isLoggedIn = await login(TEST_USER.username, TEST_USER.password);
  if (!isLoggedIn) {
    console.error('Тестирование прервано из-за ошибки авторизации');
    return;
  }
  
  // Проверяем текущего пользователя
  const user = await getCurrentUser();
  if (!user) {
    console.error('Тестирование прервано из-за ошибки получения данных пользователя');
    return;
  }
  
  // Если указана конкретная страна, тестируем только её
  if (country) {
    await testCountry(country);
  } else {
    // Иначе тестируем все страны из списка
    for (const testCountry of TEST_COUNTRIES) {
      await testCountry(testCountry);
    }
  }
}

// Запускаем скрипт
main().catch(error => {
  console.error('Непредвиденная ошибка:', error);
});