/**
 * Отладочный скрипт для проверки работы Stripe Tax API
 * 
 * Этот скрипт помогает проверить:
 * 1. Правильность настройки tax_behavior в продуктах и ценах
 * 2. Работу automatic_tax в Checkout Session (поскольку PaymentIntent не поддерживает automatic_tax)
 * 3. Передачу данных о местоположении клиента
 * 
 * Использование:
 * node stripe-tax-debug.js create-product "Product Name" price currency tax_behavior
 * node stripe-tax-debug.js create-checkout-session product_id
 * node stripe-tax-debug.js check-product product_id
 */

const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

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

// Создание нового продукта с указанием tax_behavior
async function createProduct(name, price, currency = 'usd', tax_behavior = 'exclusive') {
  console.log(`🔄 Создание продукта: "${name}" с ценой ${price} ${currency} и tax_behavior: ${tax_behavior}`);
  
  const stripe = await getStripe();
  
  try {
    // Создаем продукт
    const product = await stripe.products.create({
      name,
      description: `Test product for tax debugging - ${name}`,
      metadata: {
        tax_behavior: tax_behavior,
        debug_created: 'true'
      }
    });
    
    console.log(`✅ Продукт создан: ${product.id}`);
    
    // Создаем цену с указанным tax_behavior
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: parseInt(price) * 100, // Stripe работает с минимальными единицами валюты
      currency,
      tax_behavior, // exclusive - налог добавляется сверх, inclusive - налог включен в цену
      metadata: {
        debug_created: 'true'
      }
    });
    
    console.log(`✅ Цена создана: ${priceObj.id} (${priceObj.unit_amount / 100} ${priceObj.currency})`);
    console.log(`✅ Tax behavior: ${priceObj.tax_behavior}`);
    
    return { product, price: priceObj };
  } catch (error) {
    console.error('❌ Ошибка создания продукта:', error);
    return null;
  }
}

// Проверка настроек продукта
async function checkProduct(productId) {
  console.log(`🔄 Проверка продукта: ${productId}`);
  
  const stripe = await getStripe();
  
  try {
    // Получаем информацию о продукте
    const product = await stripe.products.retrieve(productId);
    console.log(`✅ Продукт найден: ${product.id} - ${product.name}`);
    console.log(`Метаданные:`, product.metadata);
    
    // Получаем цены для продукта
    const prices = await stripe.prices.list({
      product: productId,
      limit: 10,
    });
    
    console.log(`\nНайдено цен: ${prices.data.length}`);
    prices.data.forEach((price, index) => {
      console.log(`\nЦена #${index + 1}:`);
      console.log(`ID: ${price.id}`);
      console.log(`Сумма: ${price.unit_amount / 100} ${price.currency}`);
      console.log(`Активна: ${price.active}`);
      console.log(`Tax behavior: ${price.tax_behavior}`);
      console.log(`Метаданные:`, price.metadata);
    });
    
    return { product, prices: prices.data };
  } catch (error) {
    console.error('❌ Ошибка получения информации о продукте:', error);
    return null;
  }
}

// Создание Checkout Session с automatic_tax
async function createCheckoutSession(priceId) {
  console.log(`🔄 Создание Checkout Session для цены: ${priceId}`);
  
  const stripe = await getStripe();
  
  try {
    // Создаем тестового клиента для налоговой информации
    const customer = await stripe.customers.create({
      name: "Test Customer",
      email: "test@example.com",
      address: {
        line1: "1234 Main St",
        city: "Berlin",
        state: null,
        postal_code: "10115",
        country: "DE" // Тестируем с адресом в Германии (19% VAT)
      },
      metadata: {
        debug_created: 'true'
      }
    });
    
    console.log(`✅ Тестовый клиент создан: ${customer.id}`);
    
    // Создаем Checkout Session с automatic_tax
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer: customer.id,
      customer_update: {
        address: 'auto',
      },
      automatic_tax: { 
        enabled: true 
      }, // Включаем автоматический расчет налогов
      tax_id_collection: {
        enabled: true, // Позволяем клиенту вводить VAT ID (для бизнес-клиентов)
      },
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      metadata: {
        debug_created: 'true'
      }
    });
    
    console.log(`\n✅ Checkout Session создана: ${session.id}`);
    console.log(`URL для оплаты: ${session.url}`);
    console.log(`Automatic tax: ${session.automatic_tax.enabled ? 'Включен' : 'Выключен'}`);
    
    return { customer, session };
  } catch (error) {
    console.error('❌ Ошибка создания Checkout Session:', error);
    return null;
  }
}

// Основная функция
async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log(`
Использование:
  node stripe-tax-debug.js create-product "Product Name" price currency tax_behavior
  node stripe-tax-debug.js create-checkout-session product_id
  node stripe-tax-debug.js check-product product_id
  
Примеры:
  node stripe-tax-debug.js create-product "Test Product" 100 usd exclusive
  node stripe-tax-debug.js create-product "Test Product with VAT" 100 eur inclusive
  node stripe-tax-debug.js check-product prod_1234567890
  node stripe-tax-debug.js create-checkout-session price_1234567890
    `);
    return;
  }
  
  switch (command) {
    case 'create-product':
      const name = process.argv[3];
      const price = process.argv[4];
      const currency = process.argv[5] || 'usd';
      const tax_behavior = process.argv[6] || 'exclusive';
      
      if (!name || !price) {
        console.error('❌ Необходимо указать название продукта и цену');
        return;
      }
      
      await createProduct(name, price, currency, tax_behavior);
      break;
      
    case 'check-product':
      const productId = process.argv[3];
      
      if (!productId) {
        console.error('❌ Необходимо указать ID продукта');
        return;
      }
      
      await checkProduct(productId);
      break;
      
    case 'create-checkout-session':
      const priceId = process.argv[3];
      
      if (!priceId) {
        console.error('❌ Необходимо указать ID цены');
        return;
      }
      
      await createCheckoutSession(priceId);
      break;
      
    default:
      console.error(`❌ Неизвестная команда: ${command}`);
  }
}

main()
  .then(() => console.log('\n✅ Выполнение скрипта завершено'))
  .catch(error => console.error('❌ Ошибка выполнения скрипта:', error));