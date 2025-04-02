/**
 * Реализация кастомной интеграции налогов со Stripe согласно
 * документации https://docs.stripe.com/tax/custom
 * 
 * Этот скрипт демонстрирует, как правильно:
 * 1. Рассчитать налоги самостоятельно
 * 2. Передать налоговую информацию в Stripe
 * 3. Создать PaymentIntent с кастомными налогами
 * 
 * Использование: 
 * node custom-tax-implementation.js
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Загружаем Stripe API Key
const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_API_KEY) {
  console.error('❌ Отсутствует STRIPE_SECRET_KEY в переменных окружения');
  process.exit(1);
}

// Используем динамический импорт для Stripe
async function getStripe() {
  try {
    const Stripe = (await import('stripe')).default;
    return new Stripe(STRIPE_API_KEY, {
      apiVersion: '2025-02-24.acacia',
      telemetry: false
    });
  } catch (error) {
    console.error('❌ Ошибка инициализации Stripe:', error);
    process.exit(1);
  }
}

// Функция определения налоговой ставки по стране
function getTaxRateForCountry(country) {
  // Для стран ЕС
  const euRates = {
    'AT': 0.20, // Австрия
    'BE': 0.21, // Бельгия
    'BG': 0.20, // Болгария
    'HR': 0.25, // Хорватия
    'CY': 0.19, // Кипр
    'CZ': 0.21, // Чехия
    'DK': 0.25, // Дания
    'EE': 0.20, // Эстония
    'FI': 0.24, // Финляндия
    'FR': 0.20, // Франция
    'DE': 0.19, // Германия
    'GR': 0.24, // Греция
    'HU': 0.27, // Венгрия
    'IE': 0.23, // Ирландия
    'IT': 0.22, // Италия
    'LV': 0.21, // Латвия
    'LT': 0.21, // Литва
    'LU': 0.17, // Люксембург
    'MT': 0.18, // Мальта
    'NL': 0.21, // Нидерланды
    'PL': 0.23, // Польша
    'PT': 0.23, // Португалия
    'RO': 0.19, // Румыния
    'SK': 0.20, // Словакия
    'SI': 0.22, // Словения
    'ES': 0.21, // Испания
    'SE': 0.25, // Швеция
    'GB': 0.20, // Великобритания
  };

  // Для США и других стран - налог не применяется
  if (euRates[country]) {
    return {
      rate: euRates[country],
      type: 'vat',
      label: `VAT ${euRates[country] * 100}%`
    };
  } else if (country === 'US') {
    return {
      rate: 0,
      type: 'sales_tax',
      label: 'No Sales Tax'
    };
  } else {
    return {
      rate: 0,
      type: 'none',
      label: 'No Tax'
    };
  }
}

// Создание PaymentIntent с кастомными налогами
async function createPaymentIntentWithCustomTax(productId, amount, currency, country) {
  console.log(`\n🔄 Создание PaymentIntent с кастомными налогами:`);
  console.log(`Продукт: ${productId}, Сумма: ${amount} ${currency}, Страна: ${country}`);
  
  const stripe = await getStripe();
  
  // Расчет налога
  const taxInfo = getTaxRateForCountry(country);
  const taxAmount = Math.round(amount * taxInfo.rate);
  
  console.log(`Расчет налога: ${taxInfo.label}, Ставка: ${taxInfo.rate * 100}%, Сумма налога: ${taxAmount} ${currency}`);
  
  try {
    // Создаем PaymentIntent согласно документации Stripe Tax Custom
    // https://docs.stripe.com/tax/custom
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount + taxAmount, // Общая сумма включая налог
      currency,
      payment_method_types: ['card'],
      metadata: {
        product_id: productId.toString(),
        base_amount: amount.toString(),
        tax_amount: taxAmount.toString(),
        tax_rate: (taxInfo.rate * 100).toString() + '%',
        tax_type: taxInfo.type,
        country,
      },
      description: `Order with ${taxInfo.label} (${taxAmount} ${currency.toUpperCase()})`,
      /* 
       * Для правильного отображения налога в Stripe мы указываем его
       * в описании и метаданных заказа
       */
      /* 
       * Примечание: параметр 'tax' не поддерживается в текущей версии API
       * Налоговую информацию храним в метаданных и передаем в description
       * Согласно https://docs.stripe.com/tax/custom при работе с PaymentIntent
       * нужно указывать все необходимые налоговые метаданные, но они будут
       * использоваться только для внутреннего учета, не для автоматических расчетов
       */
    });
    
    console.log(`✅ PaymentIntent создан: ${paymentIntent.id}`);
    console.log(`✅ Общая сумма: ${paymentIntent.amount} ${paymentIntent.currency}`);
    
    if (paymentIntent.tax && paymentIntent.tax.breakdown) {
      console.log('\nРасшифровка налогов:');
      paymentIntent.tax.breakdown.forEach((item, index) => {
        console.log(`[${index + 1}] ${item.tax_rate_display_name}: ${item.amount} ${currency.toUpperCase()}`);
      });
    }
    
    return paymentIntent;
  } catch (error) {
    console.error('❌ Ошибка создания PaymentIntent:', error);
    return null;
  }
}

// Функция для обновления PaymentIntent с новой налоговой информацией
async function updatePaymentIntentTax(paymentIntentId, country) {
  console.log(`\n🔄 Обновление налоговой информации в PaymentIntent ${paymentIntentId}:`);
  
  const stripe = await getStripe();
  
  try {
    // Получаем текущее состояние PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const baseAmount = parseInt(paymentIntent.metadata.base_amount || paymentIntent.amount);
    const currency = paymentIntent.currency;
    
    // Рассчитываем налог для новой страны
    const taxInfo = getTaxRateForCountry(country);
    const taxAmount = Math.round(baseAmount * taxInfo.rate);
    
    console.log(`Новая страна: ${country}, Налог: ${taxInfo.label}, Ставка: ${taxInfo.rate * 100}%, Сумма: ${taxAmount} ${currency}`);
    
    // Обновляем PaymentIntent с новой налоговой информацией
    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: baseAmount + taxAmount, // Обновляем общую сумму
      metadata: {
        ...paymentIntent.metadata,
        tax_amount: taxAmount.toString(),
        tax_rate: (taxInfo.rate * 100).toString() + '%',
        tax_type: taxInfo.type,
        country,
      },
      description: `Order with ${taxInfo.label} (${taxAmount} ${currency})`
      // Примечание: параметр 'tax' не поддерживается в текущей версии API Stripe
    });
    
    console.log(`✅ PaymentIntent обновлен: ${updatedIntent.id}`);
    console.log(`✅ Новая общая сумма: ${updatedIntent.amount} ${updatedIntent.currency}`);
    
    return updatedIntent;
  } catch (error) {
    console.error('❌ Ошибка обновления PaymentIntent:', error);
    return null;
  }
}

// Функция для получения информации о клиенте из PaymentIntent
async function getCustomerFromPaymentIntent(paymentIntentId) {
  console.log(`\n🔄 Получение информации о клиенте из PaymentIntent ${paymentIntentId}:`);
  
  const stripe = await getStripe();
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['customer']
    });
    
    if (!paymentIntent.customer) {
      console.log('Клиент не привязан к данному PaymentIntent');
      return null;
    }
    
    console.log(`✅ Получена информация о клиенте: ${paymentIntent.customer.id}`);
    
    if (typeof paymentIntent.customer === 'string') {
      // Если customer - это строка (ID), получаем полную информацию
      const customer = await stripe.customers.retrieve(paymentIntent.customer);
      console.log(`✅ Email: ${customer.email}`);
      console.log(`✅ Страна: ${customer.address?.country || 'Не указана'}`);
      return customer;
    } else {
      // Если customer уже расширен (объект)
      console.log(`✅ Email: ${paymentIntent.customer.email}`);
      console.log(`✅ Страна: ${paymentIntent.customer.address?.country || 'Не указана'}`);
      return paymentIntent.customer;
    }
  } catch (error) {
    console.error('❌ Ошибка получения информации о клиенте:', error);
    return null;
  }
}

// Тестовые сценарии
async function runTestScenarios() {
  // Тест 1: Создание PaymentIntent для Германии (с НДС 19%)
  console.log('\n🧪 Тест 1: Создание PaymentIntent для Германии (DE)');
  const germanPaymentIntent = await createPaymentIntentWithCustomTax(
    1, // productId
    10000, // Цена 100.00 EUR (в центах)
    'eur', // Валюта
    'DE' // Страна
  );
  
  // Тест 2: Создание PaymentIntent для США (без налога)
  console.log('\n🧪 Тест 2: Создание PaymentIntent для США (US)');
  const usPaymentIntent = await createPaymentIntentWithCustomTax(
    1, // productId
    12000, // Цена 120.00 USD (в центах)
    'usd', // Валюта
    'US' // Страна
  );
  
  // Тест 3: Обновление налоговой информации (смена страны)
  if (germanPaymentIntent) {
    console.log('\n🧪 Тест 3: Обновление PaymentIntent - смена страны с DE на FR');
    await updatePaymentIntentTax(
      germanPaymentIntent.id,
      'FR' // Новая страна - Франция (НДС 20%)
    );
  }
}

// Основная функция
async function main() {
  console.log('🔧 Запуск скрипта кастомной интеграции налогов со Stripe\n');
  
  await runTestScenarios();
  
  console.log('\n✅ Выполнение скрипта завершено');
  console.log('\nℹ️ Следующие шаги:');
  console.log('1. Примените данный подход в вашем приложении:');
  console.log('   - Рассчитывайте налоги на стороне сервера');
  console.log('   - Добавляйте налоговую информацию в metadata и description PaymentIntent');
  console.log('   - Отображайте подробную информацию о налогах в интерфейсе');
  console.log('2. Для локализации и отображения используйте компонент TaxDisplayBox');
}

main().catch(error => console.error('❌ Ошибка выполнения скрипта:', error));