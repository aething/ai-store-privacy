/**
 * Скрипт для тестирования расчета и добавления налогов
 * в PaymentIntent через Stripe API
 * 
 * Запуск:
 * node test-tax-calculation.js
 */

// Импортируем необходимые модули
import 'dotenv/config';
import Stripe from 'stripe';

// Проверяем наличие Stripe API Key
const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_API_KEY) {
  console.error('❌ Отсутствует STRIPE_SECRET_KEY в переменных окружения');
  process.exit(1);
}

// Инициализируем Stripe
const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2025-02-24.acacia',
  telemetry: false
});

// Функция для расчета налоговой ставки по стране
function getTaxRate(country) {
  // Для стран ЕС
  const euRates = {
    'DE': 0.19, // Германия
    'FR': 0.20, // Франция
    'IT': 0.22, // Италия
    'ES': 0.21, // Испания
  };
  
  return euRates[country] || 0;
}

// Функция для создания PaymentIntent с налогом
async function createPaymentIntentWithTax(amount, currency, country) {
  console.log(`\n🔄 Создание PaymentIntent с налогом:`);
  console.log(`Базовая сумма: ${amount / 100} ${currency.toUpperCase()} (${amount} центов)`);
  console.log(`Страна: ${country}`);

  try {
    // Рассчитываем налог
    const taxRate = getTaxRate(country);
    const taxAmount = Math.round(amount * taxRate);
    const totalAmount = amount + taxAmount;
    
    console.log(`\nРасчет налога:`);
    console.log(`- Ставка НДС: ${taxRate * 100}%`);
    console.log(`- Сумма НДС: ${taxAmount / 100} ${currency.toUpperCase()} (${taxAmount} центов)`);
    console.log(`- Итоговая сумма: ${totalAmount / 100} ${currency.toUpperCase()} (${totalAmount} центов)`);
    
    // Создаем PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency,
      payment_method_types: ['card'], // Добавляем поддерживаемый способ оплаты
      metadata: {
        base_amount: amount.toString(),
        tax_amount: taxAmount.toString(),
        tax_rate: (taxRate * 100).toString() + '%',
        country: country,
      },
      description: `Тестовый платеж с НДС ${taxRate * 100}% (${taxAmount / 100} ${currency.toUpperCase()})`,
    });
    
    console.log(`\n✅ PaymentIntent создан: ${paymentIntent.id}`);
    console.log(`✅ Общая сумма: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()} (${paymentIntent.amount} центов)`);
    console.log(`✅ Client Secret: ${paymentIntent.client_secret}`);
    
    return paymentIntent;
  } catch (error) {
    console.error('\n❌ Ошибка создания PaymentIntent:', error.message);
    if (error.type) {
      console.error(`Тип ошибки: ${error.type}`);
    }
    return null;
  }
}

// Функция для получения и проверки PaymentIntent
async function getPaymentIntent(paymentIntentId) {
  console.log(`\n🔄 Получение деталей PaymentIntent ${paymentIntentId}`);
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log(`\n✅ PaymentIntent получен:`);
    console.log(`- ID: ${paymentIntent.id}`);
    console.log(`- Сумма: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()} (${paymentIntent.amount} центов)`);
    console.log(`- Статус: ${paymentIntent.status}`);
    console.log(`- Описание: ${paymentIntent.description}`);
    
    // Проверяем метаданные
    if (paymentIntent.metadata) {
      console.log('\nМетаданные:');
      for (const [key, value] of Object.entries(paymentIntent.metadata)) {
        console.log(`- ${key}: ${value}`);
      }
      
      // Проверяем сумму налога
      if (paymentIntent.metadata.base_amount && paymentIntent.metadata.tax_amount) {
        const baseAmount = parseInt(paymentIntent.metadata.base_amount);
        const taxAmount = parseInt(paymentIntent.metadata.tax_amount);
        const calculatedTotal = baseAmount + taxAmount;
        
        console.log('\nПроверка сумм:');
        console.log(`- Базовая сумма: ${baseAmount / 100} ${paymentIntent.currency.toUpperCase()} (${baseAmount} центов)`);
        console.log(`- Сумма налога: ${taxAmount / 100} ${paymentIntent.currency.toUpperCase()} (${taxAmount} центов)`);
        console.log(`- Рассчитанный итог: ${calculatedTotal / 100} ${paymentIntent.currency.toUpperCase()} (${calculatedTotal} центов)`);
        console.log(`- Фактическая сумма в Stripe: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()} (${paymentIntent.amount} центов)`);
        
        if (calculatedTotal === paymentIntent.amount) {
          console.log('\n✅ Проверка пройдена: суммы совпадают');
        } else {
          console.log('\n❌ Ошибка: суммы не совпадают');
        }
      }
    }
    
    return paymentIntent;
  } catch (error) {
    console.error('\n❌ Ошибка получения PaymentIntent:', error.message);
    return null;
  }
}

// Главная функция
async function main() {
  console.log('🧪 Запуск теста расчета налогов через Stripe API\n');
  
  // Тест 1: Создание PaymentIntent для Германии (с НДС 19%)
  console.log('\n🧪 Тест 1: Создание PaymentIntent для Германии (DE)');
  const germanPI = await createPaymentIntentWithTax(
    2760, // 27.60 EUR (в центах)
    'eur',
    'DE'
  );
  
  if (germanPI) {
    // Проверяем созданный PaymentIntent
    await getPaymentIntent(germanPI.id);
  }
  
  // Тест 2: Создание PaymentIntent для Франции (с НДС 20%)
  console.log('\n🧪 Тест 2: Создание PaymentIntent для Франции (FR)');
  const frenchPI = await createPaymentIntentWithTax(
    1500, // 15.00 EUR (в центах)
    'eur',
    'FR'
  );
  
  console.log('\n✅ Выполнение скрипта завершено');
}

main().catch(error => console.error('❌ Ошибка выполнения скрипта:', error));