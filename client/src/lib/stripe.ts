import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from './queryClient';
import { getCurrencyForCountry } from './currency';
import { queryClient } from './queryClient';
import type { Product } from '@/types';

// Публичный ключ из переменных окружения
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;

// Только для диагностики - логируем частичный ключ
if (typeof window !== 'undefined') {
  console.log('Stripe Public Key available:', 
    STRIPE_PUBLIC_KEY ? 'Yes' : 'No');
}

// Проверяем наличие ключа
if (!STRIPE_PUBLIC_KEY) {
  console.error('Stripe public key is missing!');
}

// Загружаем Stripe вне компонентов - это рекомендуемый подход
// В stripe.js обеспечивается загрузка только один раз, даже при повторных вызовах
let stripePromise: Promise<any> | null = null;

// Функция для инициализации Stripe
const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

// Экспортируем промис
const stripe = getStripe();

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

export default stripe;
