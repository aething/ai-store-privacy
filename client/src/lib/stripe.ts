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
 * Create a payment intent for a product
 * @param productId The ID of the product to purchase
 * @param userId The ID of the user making the purchase
 * @param country The country of the user (for currency determination)
 * @param couponCode Optional coupon code for tracking and discounts
 */
export async function createPaymentIntent(
  productId: number, 
  userId: number, 
  country?: string | null,
  couponCode?: string | null
) {
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
  
  // Use the appropriate price based on currency
  const amount = currency === 'eur' ? product.priceEUR : product.price;
  
  // Create the payment intent
  const paymentResponse = await apiRequest('POST', '/api/create-payment-intent', {
    amount,
    userId,
    productId,
    currency,
    couponCode: couponCode || undefined // Only include if we have a coupon
  });
  
  if (!paymentResponse.ok) {
    throw new Error('Failed to create payment intent');
  }
  
  return paymentResponse.json();
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

export default stripePromise;
