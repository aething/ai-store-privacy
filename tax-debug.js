/**
 * Скрипт для отладки расчета и отображения налогов в системе
 * 
 * Этот скрипт поможет понять:
 * 1. Какие данные о налогах мы отправляем в Stripe
 * 2. Какие данные возвращает Stripe
 * 3. Как отображаются налоги на странице оформления заказа
 * 
 * Использование:
 * node tax-debug.js login username password
 * node tax-debug.js change-country DE
 * node tax-debug.js test-payment 1
 */

const fetch = require('node-fetch');
const fs = require('fs');

// Хранение и управление cookie
const COOKIE_FILE = 'tax-debug-cookie.txt';

function saveCookie(cookie) {
  fs.writeFileSync(COOKIE_FILE, cookie);
  console.log(`✅ Cookie сохранены в ${COOKIE_FILE}`);
}

function loadCookie() {
  try {
    return fs.readFileSync(COOKIE_FILE, 'utf8');
  } catch (e) {
    console.log(`⚠️ Невозможно загрузить cookie из ${COOKIE_FILE}. Сначала используйте команду login.`);
    process.exit(1);
  }
}

async function fetchWithCookie(url, options = {}) {
  const cookie = loadCookie();
  
  const defaultOptions = {
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json'
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  const response = await fetch(url, mergedOptions);
  
  // Сохраняем обновленные куки, если они есть
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    saveCookie(setCookie);
  }
  
  return response;
}

// Вход в систему
async function login(username, password) {
  console.log(`🔒 Вход в систему с логином: ${username}`);
  
  const response = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    saveCookie(setCookie);
  }
  
  const result = await response.json();
  console.log('Результат входа:', result);
  
  // Получаем данные текущего пользователя
  await getCurrentUser();
}

// Получение данных текущего пользователя
async function getCurrentUser() {
  console.log('🧑 Получение данных текущего пользователя...');
  
  const response = await fetchWithCookie('http://localhost:5000/api/users/me');
  const user = await response.json();
  
  if (user.error) {
    console.log('❌ Ошибка получения пользователя:', user.error);
    return null;
  }
  
  console.log('✅ Текущий пользователь:', {
    id: user.id,
    username: user.username,
    country: user.country || 'Не указана',
    currency: shouldUseEUR(user.country) ? 'EUR' : 'USD',
    email: user.email
  });
  
  return user;
}

// Изменение страны пользователя
async function changeCountry(userId, country) {
  console.log(`🌍 Изменение страны пользователя на: ${country}`);
  
  // Сначала получаем текущие данные пользователя
  const user = await getCurrentUser();
  if (!user) {
    console.log('❌ Невозможно изменить страну - пользователь не найден');
    return;
  }
  
  const response = await fetchWithCookie(`http://localhost:5000/api/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify({ country })
  });
  
  const result = await response.json();
  console.log('Результат изменения страны:', result);
  
  // Проверяем изменения
  await getCurrentUser();
  
  // Выводим ожидаемые налоговые расчеты для этой страны
  printTaxForCountry(country);
}

// Проверка ожидаемых налоговых расчетов для страны
function printTaxForCountry(country) {
  const currency = shouldUseEUR(country) ? 'EUR' : 'USD';
  let taxInfo = '0%';
  let taxDescription = 'Без налога';
  
  if (isEUCountry(country)) {
    taxInfo = '19%';
    taxDescription = 'НДС (VAT)';
    if (country === 'FR') taxInfo = '20%';
    else if (country === 'IE') taxInfo = '23%';
    // и т.д. для других стран ЕС
  } else if (country === 'US') {
    taxInfo = '0%';
    taxDescription = 'No Sales Tax (до достижения порога)';
  }
  
  console.log('\n📊 Ожидаемый налоговый расчет:');
  console.log(`Страна: ${country}`);
  console.log(`Валюта: ${currency}`);
  console.log(`Налог: ${taxInfo} (${taxDescription})`);
}

// Тестовый платеж
async function testPayment(productId) {
  console.log(`💳 Тестирование платежа для продукта ID: ${productId}`);
  
  // Получаем текущего пользователя
  const user = await getCurrentUser();
  if (!user) {
    console.log('❌ Невозможно создать платеж - пользователь не найден');
    return;
  }
  
  // Получаем данные продукта
  const productResponse = await fetchWithCookie(`http://localhost:5000/api/products/${productId}`);
  const product = await productResponse.json();
  
  if (product.error) {
    console.log(`❌ Ошибка получения продукта с ID ${productId}:`, product.error);
    return;
  }
  
  console.log('📦 Информация о продукте:', {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    stripeId: product.stripeId || 'Нет'
  });
  
  // Определяем валюту в зависимости от страны
  const currency = shouldUseEUR(user.country) ? 'eur' : 'usd';
  let price = product.price;
  
  // Если нужна цена в EUR и у продукта есть euroPrice
  if (currency === 'eur' && product.euroPrice) {
    price = product.euroPrice;
    console.log(`ℹ️ Используем EUR цену: ${price}`);
  }
  
  // Создаем платежное намерение
  console.log(`🔄 Создаем платежное намерение (PaymentIntent) для ${price} ${currency}...`);
  
  const paymentResponse = await fetchWithCookie('http://localhost:5000/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      currency
    })
  });
  
  const paymentData = await paymentResponse.json();
  
  if (paymentData.error) {
    console.log('❌ Ошибка создания платежа:', paymentData.error);
    return;
  }
  
  console.log('✅ Платежное намерение создано:', {
    clientSecret: paymentData.clientSecret ? paymentData.clientSecret.substring(0, 15) + '...' : 'Отсутствует',
    orderId: paymentData.orderId
  });
  
  // Проверяем созданный заказ
  if (paymentData.orderId) {
    const orderResponse = await fetchWithCookie(`http://localhost:5000/api/users/${user.id}/orders`);
    const orders = await orderResponse.json();
    
    const order = orders.find(o => o.id === paymentData.orderId);
    if (order) {
      console.log('📋 Информация о заказе:', {
        id: order.id,
        productId: order.productId,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        stripePaymentId: order.stripePaymentId ? order.stripePaymentId.substring(0, 15) + '...' : 'Отсутствует'
      });
    }
  }
  
  console.log('\n📝 Инструкции для проверки в браузере:');
  console.log('1. Перейдите на страницу оформления заказа (http://localhost:5000/checkout)');
  console.log('2. Проверьте отображение налоговой информации в нижней части страницы');
  console.log('3. Для просмотра деталей налогового расчета, откройте консоль разработчика (F12)');
  console.log('4. Проверьте сетевые запросы в разделе Network, найдите запрос к /api/create-payment-intent');
}

// Вспомогательные функции
function shouldUseEUR(country) {
  if (!country) return false;
  return isEUCountry(country);
}

function isEUCountry(country) {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  return euCountries.includes(country);
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('❌ Не указана команда. Доступные команды:');
    console.log('login <username> <password> - войти в систему');
    console.log('change-country <country> - изменить страну пользователя');
    console.log('test-payment <productId> - тестировать оплату');
    return;
  }
  
  try {
    switch (command) {
      case 'login':
        if (args.length < 3) {
          console.log('❌ Требуются имя пользователя и пароль');
          return;
        }
        await login(args[1], args[2]);
        break;
        
      case 'change-country':
        if (args.length < 2) {
          console.log('❌ Требуется указать код страны');
          return;
        }
        await changeCountry(null, args[1]);
        break;
        
      case 'test-payment':
        if (args.length < 2) {
          console.log('❌ Требуется указать ID продукта');
          return;
        }
        await testPayment(parseInt(args[1]));
        break;
        
      default:
        console.log(`❌ Неизвестная команда: ${command}`);
    }
  } catch (error) {
    console.error('❌ Ошибка выполнения:', error);
  }
}

main().then(() => console.log('✅ Скрипт завершен'));