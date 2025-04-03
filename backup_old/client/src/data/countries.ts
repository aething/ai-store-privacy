/**
 * Список стран для выбора в профиле пользователя
 * 
 * Формат: { code: string, name: string, currencyType: 'EUR' | 'USD' }
 * - code: ISO код страны (2 символа)
 * - name: Название страны
 * - currencyType: Тип валюты для данной страны (EUR для Европейских стран, USD для остальных)
 */

export interface Country {
  code: string;
  name: string;
  currencyType: 'EUR' | 'USD';
}

// Список европейских стран, использующих EUR
const europeanCountries = [
  { code: 'AT', name: 'Austria', currencyType: 'EUR' },
  { code: 'BE', name: 'Belgium', currencyType: 'EUR' },
  { code: 'BG', name: 'Bulgaria', currencyType: 'EUR' },
  { code: 'HR', name: 'Croatia', currencyType: 'EUR' },
  { code: 'CY', name: 'Cyprus', currencyType: 'EUR' },
  { code: 'CZ', name: 'Czech Republic', currencyType: 'EUR' },
  { code: 'DK', name: 'Denmark', currencyType: 'EUR' },
  { code: 'EE', name: 'Estonia', currencyType: 'EUR' },
  { code: 'FI', name: 'Finland', currencyType: 'EUR' },
  { code: 'FR', name: 'France', currencyType: 'EUR' },
  { code: 'DE', name: 'Germany', currencyType: 'EUR' },
  { code: 'GR', name: 'Greece', currencyType: 'EUR' },
  { code: 'HU', name: 'Hungary', currencyType: 'EUR' },
  { code: 'IE', name: 'Ireland', currencyType: 'EUR' },
  { code: 'IT', name: 'Italy', currencyType: 'EUR' },
  { code: 'LV', name: 'Latvia', currencyType: 'EUR' },
  { code: 'LT', name: 'Lithuania', currencyType: 'EUR' },
  { code: 'LU', name: 'Luxembourg', currencyType: 'EUR' },
  { code: 'MT', name: 'Malta', currencyType: 'EUR' },
  { code: 'NL', name: 'Netherlands', currencyType: 'EUR' },
  { code: 'PL', name: 'Poland', currencyType: 'EUR' },
  { code: 'PT', name: 'Portugal', currencyType: 'EUR' },
  { code: 'RO', name: 'Romania', currencyType: 'EUR' },
  { code: 'SK', name: 'Slovakia', currencyType: 'EUR' },
  { code: 'SI', name: 'Slovenia', currencyType: 'EUR' },
  { code: 'ES', name: 'Spain', currencyType: 'EUR' },
  { code: 'SE', name: 'Sweden', currencyType: 'EUR' },
];

// Другие основные страны, использующие USD и другие валюты
// Для нашей системы используем USD для всех не-европейских стран
const otherCountries = [
  { code: 'US', name: 'United States', currencyType: 'USD' },
  { code: 'CA', name: 'Canada', currencyType: 'USD' },
  { code: 'GB', name: 'United Kingdom', currencyType: 'USD' },
  { code: 'AU', name: 'Australia', currencyType: 'USD' },
  { code: 'NZ', name: 'New Zealand', currencyType: 'USD' },
  { code: 'JP', name: 'Japan', currencyType: 'USD' },
  { code: 'CN', name: 'China', currencyType: 'USD' },
  { code: 'RU', name: 'Russia', currencyType: 'USD' },
  { code: 'BR', name: 'Brazil', currencyType: 'USD' },
  { code: 'IN', name: 'India', currencyType: 'USD' },
  { code: 'ZA', name: 'South Africa', currencyType: 'USD' },
  { code: 'AE', name: 'United Arab Emirates', currencyType: 'USD' },
  { code: 'SG', name: 'Singapore', currencyType: 'USD' },
  { code: 'MX', name: 'Mexico', currencyType: 'USD' },
  { code: 'AR', name: 'Argentina', currencyType: 'USD' },
  { code: 'CL', name: 'Chile', currencyType: 'USD' },
  { code: 'CO', name: 'Colombia', currencyType: 'USD' },
  { code: 'PE', name: 'Peru', currencyType: 'USD' },
  { code: 'SA', name: 'Saudi Arabia', currencyType: 'USD' },
  { code: 'KR', name: 'South Korea', currencyType: 'USD' },
  { code: 'ID', name: 'Indonesia', currencyType: 'USD' },
  { code: 'MY', name: 'Malaysia', currencyType: 'USD' },
  { code: 'TH', name: 'Thailand', currencyType: 'USD' },
  { code: 'VN', name: 'Vietnam', currencyType: 'USD' },
  { code: 'TR', name: 'Turkey', currencyType: 'USD' },
];

// Объединяем все страны и сортируем по имени
export const countries: Country[] = [...europeanCountries, ...otherCountries].sort((a, b) => 
  a.name.localeCompare(b.name)
);

// Получаем список кодов европейских стран (в нижнем регистре)
export const europeanCountryCodes: string[] = europeanCountries.map(country => 
  country.code.toLowerCase()
);

// Получаем список названий европейских стран (в нижнем регистре)
export const europeanCountryNames: string[] = europeanCountries.map(country => 
  country.name.toLowerCase()
);

/**
 * Получение страны по коду
 * @param code Код страны
 * @returns Объект страны или undefined, если страна не найдена
 */
export function getCountryByCode(code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  return countries.find(country => country.code.toLowerCase() === code.toLowerCase());
}

/**
 * Получение страны по имени
 * @param name Имя страны
 * @returns Объект страны или undefined, если страна не найдена
 */
export function getCountryByName(name: string | null | undefined): Country | undefined {
  if (!name) return undefined;
  return countries.find(country => country.name.toLowerCase() === name.toLowerCase());
}

/**
 * Определение, использует ли страна валюту EUR
 * @param countryCodeOrName Код или имя страны
 * @returns true, если страна использует EUR, иначе false
 */
export function isEuropeanCountry(countryCodeOrName: string | null | undefined): boolean {
  if (!countryCodeOrName) return false;
  
  const normalizedInput = countryCodeOrName.trim().toLowerCase();
  
  // Если длина ввода 2 символа, считаем это кодом страны
  if (normalizedInput.length === 2) {
    return europeanCountryCodes.includes(normalizedInput);
  }
  
  // Иначе считаем это названием страны
  return europeanCountryNames.includes(normalizedInput);
}

/**
 * Получение типа валюты для страны
 * @param countryCodeOrName Код или имя страны
 * @returns 'EUR' для европейских стран, 'USD' для остальных
 */
export function getCurrencyTypeForCountry(countryCodeOrName: string | null | undefined): 'EUR' | 'USD' {
  return isEuropeanCountry(countryCodeOrName) ? 'EUR' : 'USD';
}