// List of European countries for EUR currency
const europeanCountries = [
  'austria',
  'belgium',
  'bulgaria',
  'croatia',
  'cyprus',
  'czech republic',
  'denmark',
  'estonia',
  'finland',
  'france',
  'germany',
  'greece',
  'hungary',
  'ireland',
  'italy',
  'latvia',
  'lithuania',
  'luxembourg',
  'malta',
  'netherlands',
  'poland',
  'portugal',
  'romania',
  'slovakia',
  'slovenia',
  'spain',
  'sweden',
  // Include other European countries as needed
];

/**
 * Determine if the country should use EUR as currency
 * @param country Country name
 * @returns true if country should use EUR, false otherwise
 */
export function shouldUseEUR(country: string | undefined | null): boolean {
  if (!country) return false;
  return europeanCountries.includes(country.trim().toLowerCase());
}

/**
 * Get the appropriate currency code based on country
 * @param country Country name
 * @returns 'eur' for European countries, 'usd' otherwise
 */
export function getCurrencyForCountry(country: string | undefined | null): 'usd' | 'eur' {
  return shouldUseEUR(country) ? 'eur' : 'usd';
}

/**
 * Format price with appropriate currency symbol
 * @param price Price in cents (USD or EUR)
 * @param currency Currency code ('usd' or 'eur')
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(price: number, currency: 'usd' | 'eur' = 'usd'): string {
  const amount = price / 100; // Convert cents to dollars/euros
  
  if (currency === 'eur') {
    return `€${amount.toFixed(2)}`;
  }
  
  return `$${amount.toFixed(2)}`;
}

/**
 * Get the price in the appropriate currency based on the country
 * @param product Product with price in USD and EUR
 * @param country User's country
 * @returns The price in the appropriate currency
 */
export function getPriceForCountry(
  product: { price: number; priceEUR: number }, 
  country: string | undefined | null
): number {
  return shouldUseEUR(country) ? product.priceEUR : product.price;
}

/**
 * Format currency amount with appropriate currency symbol
 * @param amount Amount in cents (or smallest currency unit)
 * @param currency Currency code (e.g., 'usd', 'eur')
 * @returns Formatted currency string with symbol
 */
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  const value = amount / 100; // Convert cents to dollars/euros/etc.
  
  const currencyCode = currency.toLowerCase();
  
  if (currencyCode === 'eur') {
    return `€${value.toFixed(2)}`;
  } else if (currencyCode === 'gbp') {
    return `£${value.toFixed(2)}`;
  } else if (currencyCode === 'jpy') {
    return `¥${Math.round(value)}`; // JPY typically doesn't use decimals
  } else if (currencyCode === 'rub') {
    return `₽${value.toFixed(2)}`;
  } else if (currencyCode === 'cny' || currencyCode === 'rmb') {
    return `¥${value.toFixed(2)}`;
  } else {
    // Default to USD
    return `$${value.toFixed(2)}`;
  }
}