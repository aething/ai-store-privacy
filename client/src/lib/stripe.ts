import { loadStripe, Stripe } from '@stripe/stripe-js';
import { apiRequest } from './queryClient';
import { getCurrencyForCountry } from './currency';
import { queryClient } from './queryClient';
import type { Product } from '@/types';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Для отладки - проверяем значение ключа
console.log('Stripe public key (first few chars):', stripeKey ? stripeKey.substring(0, 5) + '...' : 'undefined');

if (!stripeKey) {
  console.error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
  // В случае отсутствия ключа, создаем заглушку
  alert("Stripe configuration is missing. Please ensure VITE_STRIPE_PUBLIC_KEY is set.");
}

// Оборачиваем загрузку в try-catch, чтобы избежать неожиданных ошибок
let stripePromise: Promise<Stripe | null>;
try {
  stripePromise = loadStripe(stripeKey || '');
} catch (error) {
  console.error('Error loading Stripe.js:', error);
  // Создаем заглушку для обещания, чтобы избежать ошибок нулевой ссылки
  stripePromise = Promise.resolve(null);
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
