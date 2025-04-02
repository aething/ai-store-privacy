/**
 * Утилиты для мобильного приложения
 * 
 * Этот файл содержит вспомогательные функции для работы 
 * приложения в режиме мобильного PWA в Google Play Store
 */

import { IS_MOBILE_APP, API_BASE_URL } from '@/lib/queryClient';

/**
 * Проверяет, запущено ли приложение как мобильное PWA
 * @returns boolean - true, если приложение запущено как мобильное PWA
 */
export function isMobileApp(): boolean {
  return IS_MOBILE_APP;
}

/**
 * Проверяет корректность настройки API для мобильного приложения
 * @returns {Object} результат проверки
 */
export function checkMobileApiSetup(): {
  isValid: boolean;
  apiUrl: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!API_BASE_URL && IS_MOBILE_APP) {
    errors.push('API_BASE_URL не настроен для мобильного приложения');
  }

  if (IS_MOBILE_APP && !import.meta.env.VITE_API_URL) {
    errors.push('Переменная VITE_API_URL не установлена');
  }
  
  const isValid = errors.length === 0;
  
  return {
    isValid,
    apiUrl: API_BASE_URL,
    errors
  };
}

/**
 * Возвращает тип устройства (мобильное/планшет/десктоп)
 */
export function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  const width = window.innerWidth;
  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Проверяет налоговую информацию для разных стран
 * @param country код страны
 * @returns { налоговая_ставка, метка_налога }
 */
export function getTaxInfoForCountry(country: string): {
  rate: number;
  label: string;
} {
  const taxInfo = {
    'DE': { rate: 0.19, label: 'MwSt. 19%' },
    'FR': { rate: 0.20, label: 'TVA 20%' },
    'IT': { rate: 0.22, label: 'IVA 22%' },
    'ES': { rate: 0.21, label: 'IVA 21%' },
    'US': { rate: 0, label: 'No Sales Tax' },
    'unknown': { rate: 0, label: 'No Tax (Unknown Location)' }
  };
  
  return taxInfo[country] || taxInfo['unknown'];
}

/**
 * Журналирует информацию о конфигурации мобильного приложения
 */
export function logMobileAppConfig(): void {
  if (IS_MOBILE_APP) {
    console.info('Мобильное приложение запущено с конфигурацией:');
    console.info(`API URL: ${API_BASE_URL}`);
    console.info(`Режим: ${import.meta.env.MODE}`);
    console.info(`Устройство: ${getDeviceType()}`);
    
    const apiSetup = checkMobileApiSetup();
    if (!apiSetup.isValid) {
      console.warn('Найдены проблемы в настройке мобильного приложения:');
      apiSetup.errors.forEach(error => console.warn(`  - ${error}`));
    }
  }
}