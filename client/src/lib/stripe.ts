import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { apiRequest } from './queryClient';
import { getCurrencyForCountry } from './currency';
import { queryClient } from './queryClient';
import type { Product } from '@/types';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Решение по мотивам обсуждения в https://github.com/stripe/stripe-js/pull/518
// Создаем функцию для динамического добавления скрипта Stripe вручную
const injectStripeScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Проверим, не загружен ли уже скрипт
    if (document.querySelector('script[src*="js.stripe.com/v3"]')) {
      console.log('Stripe script already loaded');
      resolve();
      return;
    }

    // Создаем элемент скрипта
    const script = document.createElement('script');
    
    // Добавляем параметры для обхода кэширования и политик CSP
    script.src = 'https://js.stripe.com/v3/?v=' + Date.now();
    script.id = 'stripe-js';
    script.crossOrigin = 'anonymous'; // важный параметр для CSP
    script.async = true;
    script.defer = true;
    
    // Отслеживаем загрузку или ошибку
    script.onload = () => {
      console.log('Stripe script loaded manually');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Stripe script manually:', error);
      reject(new Error('Failed to load Stripe script'));
    };
    
    // Добавляем скрипт в DOM
    document.head.appendChild(script);
  });
};

// Модифицированная функция для загрузки Stripe с ручным добавлением скрипта
const customLoadStripe = async (key: string, maxRetries = 5): Promise<Stripe | null> => {
  // Сначала пробуем загрузить скрипт вручную
  try {
    await injectStripeScript();
  } catch (error) {
    console.error('Failed to inject Stripe script:', error);
  }
  
  // Теперь попробуем загрузить Stripe с повторными попытками
  let lastError: any = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Добавляем небольшую задержку между попытками
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      // Пробуем загрузить Stripe с нашим ключом
      const stripe = await loadStripe(key, {
        stripeAccount: undefined,
      });
      
      console.log('Stripe loaded successfully!');
      return stripe;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1}/${maxRetries} to load Stripe failed:`, error);
    }
  }
  
  console.error("All attempts to load Stripe failed:", lastError);
  return null;
};

// Создаем типизированную заглушку для stripePromise
let stripePromise: Promise<Stripe | null>;

// Проверяем наличие ключа и инициализируем Stripe только если он есть
if (!stripeKey) {
  console.warn("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
  // Создаем резолвящийся в null промис, чтобы избежать ошибок
  stripePromise = Promise.resolve(null);
} else {
  // Используем нашу новую функцию загрузки с ручным внедрением
  stripePromise = customLoadStripe(stripeKey);
}

/**
 * Create a payment intent for a product with tax calculation
 * @param productId The ID of the product to purchase
 * @param userId The ID of the user making the purchase
 * @param country The country of the user (for currency and tax determination)
 * @param couponCode Optional coupon code for tracking and discounts
 */
export async function createPaymentIntent(
  productId: number, 
  userId: number, 
  country?: string | null,
  couponCode?: string | null,
  overridePrice?: number,
  overrideCurrency?: string,
  quantity: number = 1
) {
  console.log('Creating payment intent for:', { productId, userId, country });
  
  // Determine the appropriate currency based on country
  const currency = getCurrencyForCountry(country);
  
  // Check if there's a coupon in localStorage if not provided explicitly
  if (!couponCode) {
    couponCode = localStorage.getItem('currentCouponCode');
    
    // After retrieving, clear the coupon from localStorage to prevent reuse
    if (couponCode) {
      localStorage.removeItem('currentCouponCode');
    }
  }
  
  // Fetch the product to get the price
  const response = await fetch(`/api/products/${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }
  
  const product: Product = await response.json();
  
  // Use the appropriate price based on currency or override
  const baseAmount = overridePrice || (currency === 'eur' ? product.priceEUR : product.price);
  const finalCurrency = overrideCurrency || currency;
  
  // Применяем множитель количества к базовой цене
  const baseAmountWithQuantity = baseAmount * quantity;
  
  // Расчет налога в зависимости от страны пользователя
  let taxRate = 0;
  let taxLabel = 'No VAT/Tax';
  
  // Для стран ЕС применяем соответствующие ставки НДС
  if (country) {
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
    
    if (euVatRates[country]) {
      taxRate = euVatRates[country].rate;
      taxLabel = euVatRates[country].label;
    }
  }
  
  // Вычисляем сумму налога с учетом количества
  const taxAmount = taxRate > 0 ? Math.round(baseAmountWithQuantity * taxRate) : 0;
  
  // Вычисляем полную сумму с налогом
  const totalAmount = baseAmountWithQuantity + taxAmount;
  
  console.log('Payment calculation with tax:', {
    baseAmount,
    baseAmountWithQuantity,
    quantity,
    taxRate,
    taxAmount,
    totalAmount,
    country,
    taxLabel
  });
  
  // Check if this is a Stripe product (already in dollar/euro amounts, not cents)
  const isStripePrice = !!product.stripeProductId;
  
  // For Stripe products, convert dollar/euro amounts to cents
  const baseAmountInCents = isStripePrice ? Math.round(baseAmountWithQuantity * 100) : baseAmountWithQuantity;
  const totalAmountInCents = isStripePrice ? Math.round(totalAmount * 100) : totalAmount;
  const taxAmountInCents = isStripePrice ? Math.round(taxAmount * 100) : taxAmount;
  
  // Create the payment intent with tax information
  const paymentResponse = await apiRequest('POST', '/api/create-payment-intent', {
    amount: totalAmountInCents, // ВАЖНО: отправляем ПОЛНУЮ сумму с налогом
    baseAmount: baseAmountInCents, // Базовая сумма без налога
    taxAmount: taxAmountInCents, // Сумма налога
    taxRate: taxRate,
    taxLabel: taxLabel,
    userId,
    productId,
    currency: finalCurrency,
    quantity, // Передаем количество
    couponCode: couponCode || undefined, // Only include if we have a coupon
    metadata: {
      country: country || 'unknown',
      taxRate: taxRate.toString(),
      taxLabel: taxLabel,
      basePrice: baseAmount.toString(),       // Цена за единицу
      baseAmount: baseAmountWithQuantity.toString(), // Общая базовая сумма с учетом количества
      taxAmount: taxAmount.toString(),
      totalWithTax: totalAmount.toString(),
      quantity: quantity.toString()           // Добавляем количество в метаданные
    }
  });
  
  if (!paymentResponse.ok) {
    throw new Error('Failed to create payment intent');
  }
  
  const responseData = await paymentResponse.json();
  console.log('Payment intent created with tax data:', responseData);
  
  return responseData;
}

/**
 * Sync products with Stripe
 * This is typically an admin function
 */
export async function syncProductsWithStripe() {
  const response = await apiRequest('POST', '/api/stripe/sync-products');
  
  if (!response.ok) {
    throw new Error('Failed to sync products with Stripe');
  }
  
  // Invalidate products cache to refresh product listings
  queryClient.invalidateQueries({ queryKey: ['/api/products'] });
  
  return response.json();
}

/**
 * Create a price for a product in Stripe
 * @param productId The ID of the product
 * @param amount The amount in dollars/euros (will be converted to cents for Stripe)
 * @param currency The currency code (usd, eur, etc.)
 * @param recurring Whether this is a recurring price (subscription)
 */
export async function createPrice(
  productId: number,
  amount: number,
  currency: string = 'usd',
  recurring: boolean = false
) {
  // Convert dollar/euro amount to cents for Stripe
  const amountInCents = Math.round(amount * 100);
  
  const response = await apiRequest('POST', '/api/stripe/create-price', {
    productId,
    amount: amountInCents,
    currency,
    recurring
  });
  
  if (!response.ok) {
    throw new Error('Failed to create price in Stripe');
  }
  
  return response.json();
}

/**
 * Get or create a subscription for the current user
 * @param priceId The Stripe price ID to subscribe to
 * @param currency The currency code (usd, eur, etc.)
 */
export async function getOrCreateSubscription(
  priceId: string,
  currency: string = 'usd'
) {
  const response = await apiRequest('POST', '/api/get-or-create-subscription', {
    priceId,
    currency
  });
  
  if (!response.ok) {
    throw new Error('Failed to create subscription');
  }
  
  return response.json();
}

/**
 * Manage an existing subscription (cancel, reactivate, etc.)
 * @param action The action to perform ('cancel', 'reactivate', 'cancel_immediately')
 */
export async function manageSubscription(
  action: 'cancel' | 'reactivate' | 'cancel_immediately'
) {
  const response = await apiRequest('POST', '/api/manage-subscription', {
    action
  });
  
  if (!response.ok) {
    throw new Error(`Failed to ${action} subscription`);
  }
  
  return response.json();
}

export default stripePromise;
