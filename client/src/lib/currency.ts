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

// Коды стран Европейского Союза
const europeanCountryCodes = [
  'at', // Austria
  'be', // Belgium
  'bg', // Bulgaria
  'hr', // Croatia
  'cy', // Cyprus
  'cz', // Czech Republic
  'dk', // Denmark
  'ee', // Estonia
  'fi', // Finland
  'fr', // France
  'de', // Germany
  'gr', // Greece
  'hu', // Hungary
  'ie', // Ireland
  'it', // Italy
  'lv', // Latvia
  'lt', // Lithuania
  'lu', // Luxembourg
  'mt', // Malta
  'nl', // Netherlands
  'pl', // Poland
  'pt', // Portugal
  'ro', // Romania
  'sk', // Slovakia
  'si', // Slovenia
  'es', // Spain
  'se', // Sweden
];

/**
 * Determine if the country should use EUR as currency
 * @param country Country name or country code
 * @returns true if country should use EUR, false otherwise
 */
export function shouldUseEUR(country: string | undefined | null): boolean {
  if (!country) return false;
  
  const normalizedCountry = country.trim().toLowerCase();
  
  // Проверяем, является ли это кодом страны (например, 'DE')
  if (normalizedCountry.length === 2) {
    console.log(`Checking if country code ${normalizedCountry} is in European country codes`);
    return europeanCountryCodes.includes(normalizedCountry);
  }
  
  // Проверяем полное название страны
  console.log(`Checking if country ${normalizedCountry} is in European countries`);
  return europeanCountries.includes(normalizedCountry);
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
 * @param price Price in cents (USD or EUR) or direct price if isStripePrice
 * @param currency Currency code ('usd' or 'eur')
 * @param isStripePrice Whether the price is from Stripe (not in cents)
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(
  price: number, 
  currency: 'usd' | 'eur' = 'usd',
  isStripePrice: boolean = false
): string {
  if (price === 0) {
    return currency === 'eur' ? '€0.00' : '$0.00';
  }
  
  // Конвертируем цены из центов умноженных на 100 в тысячи (для отображения €1,399.99 вместо €27.60)
  const amount = isStripePrice ? price : price / 10000;
  
  if (currency === 'eur') {
    return `€${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
  
  return `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

/**
 * Get the price in the appropriate currency based on the country
 * @param product Product with price in USD and EUR
 * @param country User's country
 * @returns The price in the appropriate currency (in cents)
 */
export function getPriceForCountry(
  product: { price: number; priceEUR: number; stripeProductId?: string }, 
  country: string | undefined | null
): number {
  // ВАЖНО: Все цены в базе данных хранятся в центах и умножены на 100 для отображения в тысячах
  // (например, 1399900 представляет €1,399.99)
  // Эта функция возвращает цену в этом формате для API Stripe
  
  // Для европейских стран всегда возвращаем цену в EUR
  // Для других стран возвращаем цену в USD
  return shouldUseEUR(country) ? product.priceEUR : product.price;
}

/**
 * Format currency amount with appropriate currency symbol
 * @param amount Amount in cents (or smallest currency unit) or direct amount if isStripePrice
 * @param currency Currency code (e.g., 'usd', 'eur')
 * @param isStripePrice Whether the amount is from Stripe (not in cents)
 * @returns Formatted currency string with symbol
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'usd', 
  isStripePrice: boolean = false
): string {
  if (amount === 0) {
    return getCurrencySymbol(currency) + '0.00';
  }
  
  // Конвертируем цены из центов умноженных на 100 в тысячи (для отображения €1,399.99 вместо €27.60)
  const value = isStripePrice ? amount : amount / 10000;
  
  const currencyCode = currency.toLowerCase();
  
  if (currencyCode === 'eur') {
    return `€${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  } else if (currencyCode === 'gbp') {
    return `£${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  } else if (currencyCode === 'jpy') {
    return `¥${Math.round(value).toLocaleString('en-US')}`; // JPY typically doesn't use decimals
  } else if (currencyCode === 'rub') {
    return `₽${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  } else if (currencyCode === 'cny' || currencyCode === 'rmb') {
    return `¥${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  } else {
    // Default to USD
    return `$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
}

/**
 * Get currency symbol for currency code
 * @param currency Currency code
 * @returns Currency symbol
 */
function getCurrencySymbol(currency: string = 'usd'): string {
  const currencyCode = currency.toLowerCase();
  
  if (currencyCode === 'eur') {
    return '€';
  } else if (currencyCode === 'gbp') {
    return '£';
  } else if (currencyCode === 'jpy' || currencyCode === 'cny' || currencyCode === 'rmb') {
    return '¥';
  } else if (currencyCode === 'rub') {
    return '₽';
  } else {
    // Default to USD
    return '$';
  }
}