/**
 * Скрипт для обновления названий продуктов в Stripe
 * 
 * Этот скрипт использует Stripe API для обновления названий продуктов.
 * Запуск:
 * node update-stripe-products.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function updateProductNames() {
  try {
    console.log('Получение продуктов из Stripe...');
    const products = await stripe.products.list({
      limit: 100,
      active: true
    });

    console.log(`Найдено ${products.data.length} активных продуктов в Stripe`);

    // Мапа ID продуктов и их новых названий
    const productUpdates = {
      'prod_S2weDSF2MH6Hl7': 'AI Solutions',
      'prod_S2whEs3ic8h33z': 'ML Systems',
      'prod_S2wtA0M11BUBKs': 'Automation Systems'
    };

    for (const product of products.data) {
      if (productUpdates[product.id]) {
        const newName = productUpdates[product.id];
        console.log(`Обновление продукта "${product.name}" (${product.id}) на "${newName}"...`);
        
        await stripe.products.update(product.id, {
          name: newName
        });
        
        console.log(`✅ Продукт успешно обновлен`);
      }
    }

    console.log('Все продукты обновлены');
  } catch (error) {
    console.error('Ошибка при обновлении продуктов:', error);
  }
}

updateProductNames();