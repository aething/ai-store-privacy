/**
 * Модуль для расчета налогов на основе страны пользователя
 */

// Налоговые ставки по странам (VAT для ЕС, Sales Tax для США)
const TAX_RATES: Record<string, { rate: number; label: string }> = {
  // Европейский Союз
  'AT': { rate: 0.20, label: 'MwSt. 20%' }, // Австрия
  'BE': { rate: 0.21, label: 'BTW 21%' },   // Бельгия
  'BG': { rate: 0.20, label: 'ДДС 20%' },   // Болгария
  'HR': { rate: 0.25, label: 'PDV 25%' },   // Хорватия
  'CY': { rate: 0.19, label: 'ΦΠΑ 19%' },   // Кипр
  'CZ': { rate: 0.21, label: 'DPH 21%' },   // Чехия
  'DK': { rate: 0.25, label: 'MOMS 25%' },  // Дания
  'EE': { rate: 0.20, label: 'KM 20%' },    // Эстония
  'FI': { rate: 0.24, label: 'ALV 24%' },   // Финляндия
  'FR': { rate: 0.20, label: 'TVA 20%' },   // Франция
  'DE': { rate: 0.19, label: 'MwSt. 19%' }, // Германия
  'GR': { rate: 0.24, label: 'ΦΠΑ 24%' },   // Греция
  'HU': { rate: 0.27, label: 'ÁFA 27%' },   // Венгрия
  'IE': { rate: 0.23, label: 'VAT 23%' },   // Ирландия
  'IT': { rate: 0.22, label: 'IVA 22%' },   // Италия
  'LV': { rate: 0.21, label: 'PVN 21%' },   // Латвия
  'LT': { rate: 0.21, label: 'PVM 21%' },   // Литва
  'LU': { rate: 0.17, label: 'TVA 17%' },   // Люксембург
  'MT': { rate: 0.18, label: 'VAT 18%' },   // Мальта
  'NL': { rate: 0.21, label: 'BTW 21%' },   // Нидерланды
  'PL': { rate: 0.23, label: 'VAT 23%' },   // Польша
  'PT': { rate: 0.23, label: 'IVA 23%' },   // Португалия
  'RO': { rate: 0.19, label: 'TVA 19%' },   // Румыния
  'SK': { rate: 0.20, label: 'DPH 20%' },   // Словакия
  'SI': { rate: 0.22, label: 'DDV 22%' },   // Словения
  'ES': { rate: 0.21, label: 'IVA 21%' },   // Испания
  'SE': { rate: 0.25, label: 'MOMS 25%' },  // Швеция
  
  // Великобритания
  'GB': { rate: 0.20, label: 'VAT 20%' },  // Великобритания
  
  // США - без налога (на текущий момент, пока не достигнуты пороги nexus)
  'US': { rate: 0, label: 'No Sales Tax' },
  
  // Другие страны - без налога по умолчанию
  'unknown': { rate: 0, label: 'No Tax' }
};

/**
 * Рассчитывает налоговую ставку на основе страны
 * @param country ISO код страны (DE, FR, US и т.д.)
 * @returns Объект с налоговой ставкой и названием налога
 */
export function calculateTaxRate(country: string): { rate: number; label: string } {
  if (!country || country === 'unknown') {
    return TAX_RATES['unknown'];
  }
  
  // Приводим к верхнему регистру для соответствия формату ключей
  const countryCode = country.toUpperCase();
  
  // Если для страны определена ставка НДС, возвращаем ее
  if (TAX_RATES[countryCode]) {
    return TAX_RATES[countryCode];
  }
  
  // Для всех остальных стран налог не применяется
  return TAX_RATES['unknown'];
}

/**
 * Проверяет, относится ли страна к Европейскому Союзу
 * @param country ISO код страны
 * @returns true если страна входит в ЕС, иначе false
 */
export function isEUCountry(country: string): boolean {
  if (!country) return false;
  
  const countryCode = country.toUpperCase();
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  return euCountries.includes(countryCode);
}

/**
 * Определяет, должна ли использоваться валюта EUR для страны
 * @param country ISO код страны
 * @returns true если следует использовать EUR, иначе false
 */
export function shouldUseEUR(country: string): boolean {
  if (!country) return false;
  
  return isEUCountry(country);
}

/**
 * Возвращает валюту для страны: EUR для стран ЕС, USD для остальных
 * @param country ISO код страны
 * @returns 'eur' или 'usd'
 */
export function getCurrencyForCountry(country: string): string {
  return shouldUseEUR(country) ? 'eur' : 'usd';
}