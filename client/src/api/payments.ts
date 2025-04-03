/**
 * API модуль для работы с платежами через Stripe
 * 
 * Этот модуль содержит функции для создания и управления платежами,
 * включая расчет налогов в зависимости от страны пользователя.
 */

// Функция для определения ставки налога на основе страны пользователя
export const calculateTaxRate = (country?: string | null) => {
  if (!country) return { rate: 0, label: 'No VAT/Tax' };
  
  // Для США - специальная обработка
  if (country === 'US') {
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
  
  return euVatRates[country] || { rate: 0, label: 'No VAT/Tax' };
};

// Функция определения валюты на основе страны
export const getCurrencyForCountry = (country: string): string => {
  if (!country) return 'usd';
  
  // Коды стран Европейского Союза (в верхнем регистре)
  const eurCountryCodes = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE'
  ];
  
  return eurCountryCodes.includes(country) ? 'eur' : 'usd';
};

// Функция для создания платежного намерения с учетом налогов
export async function createPaymentIntent(
  productId: number,
  userId: number,
  country?: string | null,
  price?: number,
  currency?: string
) {
  // Если цена не указана, то получаем её из продукта
  // Это должен делать вызывающий код
  if (!price || !currency) {
    throw new Error('Price and currency must be provided');
  }
  
  // Рассчитываем налог на основе страны пользователя
  const { rate, label } = calculateTaxRate(country);
  
  // Вычисляем сумму налога (округляем до целого)
  const taxAmount = rate > 0 ? Math.round(price * rate) : 0;
  
  // Вычисляем полную сумму с налогом
  const totalAmount = price + taxAmount;
  
  // Формируем метаданные для создания платежного намерения
  const metadata = {
    country: country || 'unknown',
    taxRate: rate.toString(),
    taxLabel: label,
    basePrice: price.toString(),
    taxAmount: taxAmount.toString(),
    totalWithTax: totalAmount.toString()
  };
  
  console.log('Creating payment intent with tax calculation:', {
    productId,
    userId,
    country,
    currency,
    basePrice: price,
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
    body: JSON.stringify({
      productId,
      amount: totalAmount, // ВАЖНО: отправляем ПОЛНУЮ сумму с налогом
      baseAmount: price,   // Базовая цена для информации
      taxAmount,          // ВАЖНО: явно передаем сумму налога
      taxRate: rate,      // ВАЖНО: явно передаем ставку налога
      taxLabel: label,    // ВАЖНО: явно передаем метку налога
      currency,
      userId,
      country,           // ВАЖНО: явно передаем страну
      override_user_country: true, // ВАЖНО: принудительно использовать переданную страну
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