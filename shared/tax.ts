/**
 * Утилиты для работы с налогами и валютами в зависимости от страны
 */

/**
 * Список стран Европейского Союза
 */
export const EU_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
];

/**
 * Проверяет, является ли страна частью Европейского Союза
 * @param country Код страны (ISO 3166-1 alpha-2)
 * @returns Булево значение, указывающее, является ли страна частью ЕС
 */
export function isEUCountry(country: string): boolean {
  return EU_COUNTRIES.includes(country.toUpperCase());
}

/**
 * Определяет, нужно ли использовать EUR в качестве валюты для данной страны
 * @param country Код страны (ISO 3166-1 alpha-2)
 * @returns Булево значение, указывающее, нужно ли использовать EUR
 */
export function shouldUseEUR(country: string): boolean {
  return isEUCountry(country);
}

/**
 * Карта для налоговых ставок по странам ЕС
 * Источник: https://ec.europa.eu/taxation_customs/vat-rates_en
 */
export const EU_VAT_RATES: Record<string, number> = {
  'AT': 0.20, // Austria - 20%
  'BE': 0.21, // Belgium - 21%
  'BG': 0.20, // Bulgaria - 20%
  'HR': 0.25, // Croatia - 25%
  'CY': 0.19, // Cyprus - 19%
  'CZ': 0.21, // Czech Republic - 21%
  'DK': 0.25, // Denmark - 25%
  'EE': 0.20, // Estonia - 20%
  'FI': 0.24, // Finland - 24%
  'FR': 0.20, // France - 20%
  'DE': 0.19, // Germany - 19%
  'GR': 0.24, // Greece - 24%
  'HU': 0.27, // Hungary - 27%
  'IE': 0.23, // Ireland - 23%
  'IT': 0.22, // Italy - 22%
  'LV': 0.21, // Latvia - 21%
  'LT': 0.21, // Lithuania - 21%
  'LU': 0.17, // Luxembourg - 17%
  'MT': 0.18, // Malta - 18%
  'NL': 0.21, // Netherlands - 21%
  'PL': 0.23, // Poland - 23%
  'PT': 0.23, // Portugal - 23%
  'RO': 0.19, // Romania - 19%
  'SK': 0.20, // Slovakia - 20%
  'SI': 0.22, // Slovenia - 22%
  'ES': 0.21, // Spain - 21%
  'SE': 0.25, // Sweden - 25%
};

/**
 * Стандартная налоговая ставка для США
 * В США налог на продажу варьируется по штатам и городам
 * По умолчанию используем 0, так как нет единого федерального налога с продаж
 */
export const US_TAX_RATE = 0;

/**
 * Получает налоговую ставку для указанной страны
 * @param country Код страны (ISO 3166-1 alpha-2)
 * @returns Налоговая ставка (от 0 до 1)
 */
export function getTaxRateForCountry(country: string): number {
  const countryCode = country.toUpperCase();
  
  // Если страна в ЕС, используем ставку VAT
  if (isEUCountry(countryCode)) {
    return EU_VAT_RATES[countryCode] || 0.20; // Если ставка неизвестна, используем 20%
  }
  
  // Для США используем налог с продаж (по умолчанию 0)
  if (countryCode === 'US') {
    return US_TAX_RATE;
  }
  
  // Для других стран по умолчанию возвращаем 0
  return 0;
}

/**
 * Форматирует сумму в указанной валюте
 * @param amount Сумма в наименьших единицах валюты (центы, евроценты)
 * @param currency Валюта ('usd' или 'eur')
 * @returns Форматированная строка с суммой и символом валюты
 */
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount / 100);
}

/**
 * Рассчитывает сумму налога для указанной страны и суммы
 * @param amount Сумма без налога
 * @param country Код страны
 * @returns Сумма налога
 */
export function calculateTaxAmount(amount: number, country: string): number {
  const taxRate = getTaxRateForCountry(country);
  return Math.round(amount * taxRate);
}

/**
 * Определяет валюту для указанной страны
 * @param country Код страны
 * @returns Код валюты ('usd' или 'eur')
 */
export function getCurrencyForCountry(country: string): string {
  return shouldUseEUR(country) ? 'eur' : 'usd';
}

/**
 * Формирует подпись для отображения налога
 * @param country Код страны
 * @param taxRate Налоговая ставка
 * @returns Строка с описанием налога
 */
export function getTaxLabel(country: string, taxRate: number): string {
  if (isEUCountry(country)) {
    return `VAT (${(taxRate * 100).toFixed(0)}%)`;
  } else if (country === 'US') {
    return 'Sales Tax';
  }
  return 'Tax';
}

/**
 * Получает информацию о налоге для указанной страны
 * @param country Код страны (ISO 3166-1 alpha-2)
 * @returns Объект с информацией о налоге (ставка и метка)
 */
export function calculateTaxRate(country?: string | null) {
  console.log(`[TAX DEBUG] calculateTaxRate called with country: ${country}`);
  
  if (!country) {
    console.log(`[TAX DEBUG] No country provided, returning default rate`);
    return { rate: 0, label: 'No VAT/Tax' };
  }
  
  const countryCode = country.toUpperCase();
  console.log(`[TAX DEBUG] Processing country code: ${countryCode}`);
  
  // Для США - возвращаем нулевую ставку
  if (countryCode === 'US') {
    return { rate: 0, label: 'No Sales Tax' };
  }
  
  // Для стран ЕС и других - налоговые ставки и метки
  const taxRate = getTaxRateForCountry(countryCode);
  
  // Определяем метку налога в зависимости от страны
  let taxLabel = '';
  
  if (countryCode === 'DE') {
    taxLabel = `MwSt. ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === 'FR') {
    taxLabel = `TVA ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === 'IT') {
    taxLabel = `IVA ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === 'ES') {
    taxLabel = `IVA ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === 'AT') {
    taxLabel = `MwSt. ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === 'BE') {
    taxLabel = `BTW ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === 'NL') {
    taxLabel = `BTW ${(taxRate * 100).toFixed(0)}%`;
  } else {
    taxLabel = `VAT ${(taxRate * 100).toFixed(0)}%`;
  }
  
  return { rate: taxRate, label: taxLabel };
}