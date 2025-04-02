/**
 * Отладочный скрипт для проверки логики выбора страны на сервере
 * 
 * Скрипт отправляет запрос с явным указанием страны и флагами,
 * чтобы проверить логику обработки этих параметров на сервере.
 */

import fetch from 'node-fetch';

async function testCountryHandling() {
  console.log('='.repeat(80));
  console.log('ТЕСТ ЛОГИКИ ВЫБОРА СТРАНЫ НА СЕРВЕРЕ');
  console.log('='.repeat(80));
  
  // Создаем тестовые запросы с разными комбинациями параметров
  const testCases = [
    {
      name: 'ТЕСТ 1: Простая передача страны без флагов',
      data: {
        productId: 1,
        userId: 1,
        amount: 1000,
        baseAmount: 800,
        currency: 'eur',
        country: 'DE',
        debug: true
      }
    },
    {
      name: 'ТЕСТ 2: Передача страны с use_provided_country=true',
      data: {
        productId: 1,
        userId: 1,
        amount: 1000,
        baseAmount: 800,
        currency: 'eur',
        country: 'DE',
        use_provided_country: true,
        debug: true
      }
    },
    {
      name: 'ТЕСТ 3: Передача страны с force_country',
      data: {
        productId: 1,
        userId: 1,
        amount: 1000,
        baseAmount: 800,
        currency: 'eur',
        country: 'FR',
        force_country: 'DE',
        debug: true
      }
    },
    {
      name: 'ТЕСТ 4: Передача страны с use_provided_country=true и force_country',
      data: {
        productId: 1,
        userId: 1,
        amount: 1000,
        baseAmount: 800,
        currency: 'eur',
        country: 'FR',
        use_provided_country: true,
        force_country: 'DE',
        debug: true
      }
    },
    {
      name: 'ТЕСТ 5: Передача страны и метаданных с force_country',
      data: {
        productId: 1,
        userId: 1,
        amount: 1000,
        baseAmount: 800,
        currency: 'eur',
        country: 'FR',
        metadata: {
          force_country: 'DE'
        },
        debug: true
      }
    },
    {
      name: 'ТЕСТ 6: Полная комбинация - все флаги и метаданные',
      data: {
        productId: 1,
        userId: 1,
        amount: 1000,
        baseAmount: 800,
        currency: 'eur',
        country: 'FR',
        use_provided_country: true,
        force_country: 'DE',
        metadata: {
          force_country: 'DE',
          debug: true,
          country: 'DE'
        },
        debug: true
      }
    }
  ];
  
  // Запускаем каждый тестовый случай
  for (const test of testCases) {
    console.log('\n' + '-'.repeat(80));
    console.log(test.name);
    console.log('-'.repeat(80));
    console.log('Отправляем данные:', JSON.stringify(test.data, null, 2));
    
    try {
      const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data)
      });
      
      if (!response.ok) {
        console.log(`ОШИБКА API: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log('Детали ошибки:', errorText);
        continue;
      }
      
      const result = await response.json();
      console.log('Ответ API:');
      console.log(JSON.stringify(result, null, 2));
      
      // Проверяем метку налога, чтобы определить какая страна была использована
      const taxLabel = result.tax?.label;
      let detectedCountry = 'Неизвестная';
      
      if (taxLabel) {
        if (taxLabel.includes('MwSt')) {
          detectedCountry = 'DE (Германия)';
        } else if (taxLabel.includes('TVA')) {
          detectedCountry = 'FR (Франция)';
        }
      }
      
      console.log(`\nИспользованная страна на сервере: ${detectedCountry}`);
      console.log(`Налоговая метка: ${taxLabel || 'Нет'}`);
      console.log(`Ставка налога: ${result.tax?.rate || 'Нет'}`);
      console.log(`Сумма налога: ${result.tax?.amount || 'Нет'}`);
      
    } catch (error) {
      console.log('ОШИБКА при выполнении запроса:', error.message);
    }
  }
}

// Запускаем тест
testCountryHandling().catch(err => {
  console.error('Необработанная ошибка:', err);
  process.exit(1);
});