import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { apiRequest } from './queryClient';
import { getCurrencyForCountry } from './currency';
import { queryClient } from './queryClient';
import type { Product } from '@/types';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Функция для проверки доступности URL
const checkUrlAvailability = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 секунды таймаут
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error(`Failed to connect to ${url}:`, error);
    return false;
  }
};

// Функция с повторными попытками для загрузки Stripe
const loadStripeWithRetry = async (key: string, maxRetries = 3, delay = 2000): Promise<Stripe | null> => {
  // Сначала проверим доступность основного домена Stripe
  const isStripeAvailable = await checkUrlAvailability('https://js.stripe.com/v3/');
  
  if (!isStripeAvailable) {
    console.warn("Stripe.js is not available at the moment. Network might be limited.");
    return null;
  }
  
  let lastError: any = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Пробуем загрузить Stripe
      return await loadStripe(key);
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1}/${maxRetries} to load Stripe failed:`, error);
      
      if (attempt < maxRetries - 1) {
        // Ждем перед следующей попыткой (с увеличивающейся задержкой)
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
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
  // Используем функцию с повторными попытками
  stripePromise = loadStripeWithRetry(stripeKey);
}

/**
 * Create a payment intent for a product
 * @param productId The ID of the product to purchase
 * @param userId The ID of the user making the purchase
 * @param country The country of the user (for currency determination)
 */
export async function createPaymentIntent(productId: number, userId: number, country?: string | null) {
  // Determine the appropriate currency based on country
  const currency = getCurrencyForCountry(country);
  
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
    currency
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
