/**
 * Файл с основной информацией о компании
 * Здесь хранятся данные, которые используются в разных частях приложения
 */

export const COMPANY_INFO = {
  // Название компании
  name: 'Aething Inc.',
  
  // Юридический адрес
  address: {
    street: '1111B S Gove St',
    city: 'Tech Valley',
    region: 'CA',
    postalCode: '94123',
    country: 'USA'
  },
  
  // Контактная информация
  contact: {
    email: 'support@aething.com',
    phone: '+1 (555) 123-4567'
  },
  
  // Информация о налогах
  tax: {
    // Идентификационный номер плательщика НДС в Германии
    germanVatId: 'DE123456789',
    
    // Дополнительные налоговые идентификаторы для других стран могут быть добавлены здесь
    euVatIds: {
      DE: 'DE123456789',
      FR: 'FR12345678901',
      IT: 'IT12345678901',
      ES: 'ESX12345678'
    }
  },
  
  // Социальные сети
  social: {
    twitter: 'https://twitter.com/aething',
    linkedin: 'https://linkedin.com/company/aething',
    facebook: 'https://facebook.com/aethinginc'
  },
  
  // Правовая информация
  legal: {
    privacyPolicyUrl: '/info/privacy-policy',
    termsOfServiceUrl: '/info/terms-of-service',
    cookiePolicyUrl: '/info/cookie-policy'
  }
};

/**
 * Получить VAT ID для конкретной страны
 * @param countryCode ISO код страны (например, 'DE', 'FR')
 * @returns VAT ID для указанной страны или общий VAT ID по умолчанию
 */
export function getVatIdForCountry(countryCode?: string): string {
  if (!countryCode) return COMPANY_INFO.tax.germanVatId;
  
  // Если у нас есть специфичный VAT ID для этой страны, возвращаем его
  if (countryCode in COMPANY_INFO.tax.euVatIds) {
    return COMPANY_INFO.tax.euVatIds[countryCode as keyof typeof COMPANY_INFO.tax.euVatIds];
  }
  
  // По умолчанию возвращаем немецкий VAT ID
  return COMPANY_INFO.tax.germanVatId;
}