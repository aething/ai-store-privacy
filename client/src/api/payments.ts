/**
 * API модуль для работы с платежами через Stripe
 * 
 * Этот модуль содержит функции для создания и управления платежами,
 * включая расчет налогов в зависимости от страны пользователя.
 */

// Функция для определения ставки налога на основе страны пользователя
export const calculateTaxRate = (country?: string | null) => {
  if (!country) return { rate: 0, label: 'No VAT/Tax' };
  
  // Нормализуем входное значение страны к верхнему регистру
  const normalizedCountry = String(country).toUpperCase();
  
  // Для США - специальная обработка
  if (normalizedCountry === 'US') {
    // В настоящий момент налоги для США не применяются, так как пороги nexus не достигнуты
    return { rate: 0, label: 'No Sales Tax' };
  }
  
  // Для стран ЕС и других - НДС по правилам каждой страны
  // Актуальные данные на 2025 год
  const euVatRates: Record<string, { rate: number; label: string }> = {
    // Страны ЕС
    'AT': { rate: 0.20, label: 'MwSt. 20%' }, // Австрия
    'BE': { rate: 0.21, label: 'BTW 21%' },   // Бельгия
    'BG': { rate: 0.20, label: 'ДДС 20%' },   // Болгария
    'HR': { rate: 0.25, label: 'PDV 25%' },   // Хорватия
    'CY': { rate: 0.19, label: 'ΦΠΑ 19%' },   // Кипр
    'CZ': { rate: 0.21, label: 'DPH 21%' },   // Чехия
    'DK': { rate: 0.25, label: 'MOMS 25%' },  // Дания
    'EE': { rate: 0.22, label: 'KM 22%' },    // Эстония
    'FI': { rate: 0.255, label: 'ALV 25.5%' }, // Финляндия
    'FR': { rate: 0.20, label: 'TVA 20%' },   // Франция
    'DE': { rate: 0.19, label: 'MwSt. 19%' }, // Германия
    'GR': { rate: 0.24, label: 'ΦΠΑ 24%' },   // Греция
    'HU': { rate: 0.27, label: 'ÁFA 27%' },   // Венгрия
    'IE': { rate: 0.23, label: 'VAT 23%' },   // Ирландия
    'IT': { rate: 0.22, label: 'IVA 22%' },   // Италия
    'LV': { rate: 0.21, label: 'PVN 21%' },   // Латвия
    'LT': { rate: 0.21, label: 'PVM 21%' },   // Литва
    'LU': { rate: 0.16, label: 'TVA 16%' },   // Люксембург
    'MT': { rate: 0.18, label: 'VAT 18%' },   // Мальта
    'NL': { rate: 0.21, label: 'BTW 21%' },   // Нидерланды
    'PL': { rate: 0.23, label: 'VAT 23%' },   // Польша
    'PT': { rate: 0.23, label: 'IVA 23%' },   // Португалия
    'RO': { rate: 0.19, label: 'TVA 19%' },   // Румыния
    'SK': { rate: 0.23, label: 'DPH 23%' },   // Словакия
    'SI': { rate: 0.22, label: 'DDV 22%' },   // Словения
    'ES': { rate: 0.21, label: 'IVA 21%' },   // Испания
    'SE': { rate: 0.25, label: 'MOMS 25%' },  // Швеция
    'GB': { rate: 0.20, label: 'VAT 20%' },   // Великобритания
    // Другие европейские страны
    'CH': { rate: 0.081, label: 'MWST 8.1%' }, // Швейцария
    'IS': { rate: 0.24, label: 'VSK 24%' },    // Исландия
    'NO': { rate: 0.25, label: 'MVA 25%' },    // Норвегия
  };
  
  return euVatRates[normalizedCountry] || { rate: 0, label: 'No VAT/Tax' };
};

// Функция определения валюты на основе страны
export const getCurrencyForCountry = (country: string): string => {
  if (!country) return 'usd';
  
  // Преобразуем код страны к верхнему регистру для сравнения
  const normalizedCountry = String(country).toUpperCase();
  
  // Коды стран Европейского Союза (в верхнем регистре)
  const eurCountryCodes = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE'
  ];
  
  return eurCountryCodes.includes(normalizedCountry) ? 'eur' : 'usd';
};

// Функция для создания платежного намерения с учетом налогов
export async function createPaymentIntent(
  productId: number,
  userId: number,
  country?: string | null,
  price?: number,
  currency?: string,
  quantity: number = 1 // Добавлен новый параметр quantity со значением по умолчанию 1
) {
  // Если цена не указана, то получаем её из продукта
  // Это должен делать вызывающий код
  if (!price || !currency) {
    throw new Error('Price and currency must be provided');
  }
  
  // Рассчитываем налог на основе страны пользователя
  const { rate, label } = calculateTaxRate(country);
  
  // ВАЖНО: Наш price уже в центах (например, 2760 для €27.60)
  // Stripe требует указывать суммы в мельчайших единицах валюты (центы, копейки)
  // Сначала вычисляем базовую сумму в центах
  const baseAmount = price * quantity;
  
  // Вычисляем сумму налога (в центах)
  const taxAmount = rate > 0 ? Math.round(baseAmount * rate) : 0;
  
  // Вычисляем полную сумму с налогом (в центах)
  const totalAmount = baseAmount + taxAmount;
  
  console.log(`Расчет цены для API Stripe:
  - Базовая цена: ${price} центов (${(price/100).toFixed(2)} ${currency})
  - Количество: ${quantity}
  - Итого без налога: ${baseAmount} центов (${(baseAmount/100).toFixed(2)} ${currency})
  - Налог (${rate * 100}%): ${taxAmount} центов (${(taxAmount/100).toFixed(2)} ${currency})
  - Итого с налогом: ${totalAmount} центов (${(totalAmount/100).toFixed(2)} ${currency})
  `);
  
  // Создаем структуру line_items для более точного представления товаров в корзине
  const lineItems = [{
    product_id: productId.toString(),
    quantity: quantity,
    unit_amount: price,
    currency: currency
  }];
  
  // Формируем метаданные для создания платежного намерения
  const metadata = {
    country: country || 'unknown',
    taxRate: rate.toString(),
    taxLabel: label,
    basePrice: price.toString(), // Важно! Цена за единицу товара
    baseAmount: baseAmount.toString(), // Общая базовая сумма с учетом количества
    taxAmount: taxAmount.toString(),
    totalWithTax: totalAmount.toString(),
    quantity: quantity.toString(), // Важно! Количество товаров в заказе
    unitPrice: price.toString(), // Альтернативное поле для единичной цены (для совместимости)
    items: JSON.stringify(lineItems) // Сохраняем детальную информацию о товарах для последующего обновления
  };
  
  console.log('Creating payment intent with tax calculation:', {
    productId,
    userId,
    country,
    currency,
    basePrice: price,
    quantity,
    baseAmount,
    taxRate: rate,
    taxAmount,
    totalWithTax: totalAmount,
    taxLabel: label
  });
  
  // Отправляем запрос на сервер для создания платежного намерения
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Добавляем передачу cookies для аутентификации
    body: JSON.stringify({
      productId,
      amount: baseAmount, // Отправляем базовую сумму для правильного расчета налогов
      baseAmount,        // Базовая сумма для информации
      taxAmount,         // Явно передаем сумму налога
      taxRate: rate,     // Явно передаем ставку налога
      taxLabel: label,   // Явно передаем метку налога
      currency: currency.toLowerCase(), // Всегда используем нижний регистр для валюты
      userId,
      country,           // Явно передаем страну
      quantity,          // Добавляем количество товара
      override_user_country: true, // Принудительно использовать переданную страну
      use_provided_country: true,  // Для совместимости со старым API
      force_country: country,      // Для совместимости со старым API
      metadata: {
        ...metadata,
        country,
        force_country: country
      }
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error creating payment intent:', errorText);
    throw new Error('Error creating payment intent');
  }
  
  return await response.json();
}

// Добавляем новую функцию для обновления PaymentIntent с новым количеством
export async function updatePaymentIntentQuantity(
  paymentIntentId: string,
  userId: number,
  quantity: number,
  productId?: number
) {
  if (!paymentIntentId || !userId || quantity < 1) {
    throw new Error('Invalid parameters for updating payment intent');
  }
  
  console.log(`[PAYMENT API] Updating payment intent ${paymentIntentId} with new quantity: ${quantity}`);
  
  // Готовим данные с line_items для обновления PaymentIntent
  // Если productId не предоставлен, серверная сторона получит его из метаданных
  // существующего PaymentIntent
  const response = await fetch('/api/update-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Добавляем передачу cookies для аутентификации
    body: JSON.stringify({
      paymentIntentId,
      userId,
      quantity,
      productId, // Опционально передаем ID продукта, если он известен
      newItems: productId ? [{ 
        product_id: productId.toString(), 
        quantity 
      }] : undefined // Передаем новую структуру товаров, если известен ID продукта
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error updating payment intent:', errorText);
    throw new Error('Error updating payment intent');
  }
  
  return await response.json();
}