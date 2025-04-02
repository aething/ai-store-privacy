/**
 * Скрипт для исправления настроек налогов в существующих продуктах Stripe
 * 
 * Этот скрипт проверяет и обновляет:
 * 1. tax_behavior всех цен для продуктов
 * 2. Добавляет tax_code для правильной классификации продуктов
 * 
 * Использование:
 * node fix-stripe-tax-config.js
 */

const fetch = require('node-fetch');
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

// Проверка и обновление настроек продукта
async function updateProduct(productId) {
  console.log(`\n🔄 Обновление настроек продукта: ${productId}`);
  
  const stripe = await getStripe();
  
  try {
    // Получаем информацию о продукте
    const product = await stripe.products.retrieve(productId);
    console.log(`  Продукт: ${product.name}`);
    
    // Устанавливаем tax_code, если не установлен
    // txcd_30060001 - "Electronically Supplied Services"
    let updated = false;
    const updateData = {};
    
    if (!product.tax_code) {
      updateData.tax_code = 'txcd_30060001'; // Код для цифровых/электронных услуг
      updated = true;
    }
    
    if (updated) {
      const updatedProduct = await stripe.products.update(productId, updateData);
      console.log(`  ✅ Продукт обновлен с tax_code: ${updatedProduct.tax_code}`);
    } else {
      console.log(`  ℹ️ Продукт уже имеет tax_code: ${product.tax_code || 'не установлен'}`);
    }
    
    // Получаем цены для продукта
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 100,
    });
    
    console.log(`  Найдено ${prices.data.length} активных цен`);
    
    // Обновляем tax_behavior для каждой цены
    for (const price of prices.data) {
      if (price.tax_behavior !== 'exclusive') {
        console.log(`  🔄 Обновление цены ${price.id}: ${price.unit_amount/100} ${price.currency}`);
        
        try {
          // Создаем новую цену, т.к. tax_behavior нельзя изменить после создания
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: price.unit_amount,
            currency: price.currency,
            tax_behavior: 'exclusive', // Устанавливаем exclusive для правильного расчета налогов
            lookup_key: `migrated_from_${price.id}`,
            transfer_lookup_key: true,
            metadata: {
              original_price_id: price.id,
              migrated_at: new Date().toISOString(),
              ...price.metadata
            }
          });
          
          console.log(`  ✅ Создана новая цена: ${newPrice.id} с tax_behavior: ${newPrice.tax_behavior}`);
          
          // Деактивируем старую цену
          await stripe.prices.update(price.id, { active: false });
          console.log(`  ✅ Старая цена ${price.id} деактивирована`);
        } catch (priceError) {
          console.error(`  ❌ Ошибка обновления цены ${price.id}:`, priceError);
        }
      } else {
        console.log(`  ✓ Цена ${price.id} уже имеет tax_behavior: ${price.tax_behavior}`);
      }
    }
    
    return { product, updated, prices: prices.data };
  } catch (error) {
    console.error(`❌ Ошибка обновления продукта ${productId}:`, error);
    return null;
  }
}

// Получение всех продуктов и их обновление
async function updateAllProducts() {
  console.log('🔄 Получение списка всех активных продуктов');
  
  const stripe = await getStripe();
  
  try {
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });
    
    console.log(`Найдено ${products.data.length} активных продуктов`);
    
    for (const product of products.data) {
      await updateProduct(product.id);
    }
    
    return products.data;
  } catch (error) {
    console.error('❌ Ошибка получения списка продуктов:', error);
    return null;
  }
}

// Проверка настройки Stripe Tax
async function checkStripeTaxSettings() {
  console.log('\n🔄 Проверка настроек Stripe Tax');
  
  const stripe = await getStripe();
  
  try {
    // Получаем информацию о настройках Stripe Tax
    const taxSettings = await stripe.tax.settings.retrieve();
    
    console.log('Настройки Stripe Tax:');
    console.log(`  Статус: ${taxSettings.status || 'Неизвестно'}`);
    console.log(`  Автоматический расчет: ${taxSettings.defaults?.tax_code || 'Не настроен'}`);
    
    return taxSettings;
  } catch (error) {
    if (error.code === 'resource_missing') {
      console.log('❌ Stripe Tax не активирован для этого аккаунта');
    } else {
      console.error('❌ Ошибка получения настроек Stripe Tax:', error);
    }
    return null;
  }
}

// Основная функция
async function main() {
  console.log('🔧 Запуск скрипта исправления настроек Stripe Tax\n');
  
  // Проверяем настройки Stripe Tax
  await checkStripeTaxSettings();
  
  // Обновляем все продукты
  await updateAllProducts();
  
  console.log('\n✅ Выполнение скрипта завершено');
  console.log('\nℹ️ Следующие шаги:');
  console.log('1. Обновите API-запросы для использования новых цен');
  console.log('2. Настройте Stripe Tax в панели управления Stripe');
  console.log('3. Для проверки, используйте Checkout Session вместо Payment Intent для автоматического расчета налогов');
}

main().catch(error => console.error('❌ Ошибка выполнения скрипта:', error));