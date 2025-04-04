import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";

// Import all general language translations
import en from "../locales/en";
import es from "../locales/es";
import de from "../locales/de";
import fr from "../locales/fr";
import it from "../locales/it";
import zh from "../locales/zh";
import ja from "../locales/ja";

// Import product-specific translations
import productTranslations from "../locales/products";

// Define locale types
export type LocaleCode = 'en' | 'es' | 'de' | 'fr' | 'it' | 'zh' | 'ja';

// Карта соответствия стран и языков
export const countryToLocaleMap: Record<string, LocaleCode> = {
  // Европейские страны
  'DE': 'de', // Германия
  'AT': 'de', // Австрия
  'CH': 'de', // Швейцария
  
  'FR': 'fr', // Франция
  'BE': 'fr', // Бельгия (фр.)
  'LU': 'fr', // Люксембург (фр.)
  
  'ES': 'es', // Испания
  'MX': 'es', // Мексика
  'AR': 'es', // Аргентина
  'CL': 'es', // Чили
  'CO': 'es', // Колумбия
  
  'IT': 'it', // Италия
  'SM': 'it', // Сан-Марино
  'VA': 'it', // Ватикан
  
  'CN': 'zh', // Китай
  'TW': 'zh', // Тайвань
  'SG': 'zh', // Сингапур (частично)
  
  'JP': 'ja', // Япония
  
  // Англоязычные страны
  'US': 'en', // США
  'GB': 'en', // Великобритания
  'CA': 'en', // Канада (англ.)
  'AU': 'en', // Австралия
  'NZ': 'en', // Новая Зеландия
  'IE': 'en', // Ирландия
};

// Available locales object
const localesData = {
  en: { name: "English", translations: en },
  es: { name: "Español", translations: es },
  de: { name: "Deutsch", translations: de },
  fr: { name: "Français", translations: fr },
  it: { name: "Italiano", translations: it },
  zh: { name: "中文", translations: zh },
  ja: { name: "日本語", translations: ja }
};

// Define context type
export interface LocaleContextType {
  currentLocale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: string) => string;
  getLocaleOptions: () => { value: LocaleCode; label: string }[];
  translations: any; // Доступ к объекту переводов
  getLocalizedProductInfo: (productId: number) => { title: string; description: string };
}

// Create context
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Provider props
interface LocaleProviderProps {
  children: ReactNode;
}

// Функция для определения языка по стране пользователя
export function getLocaleFromCountry(countryCode: string | undefined | null): LocaleCode {
  if (!countryCode) {
    return 'en'; // По умолчанию английский, если страна не указана
  }
  
  const upperCaseCountry = countryCode.toUpperCase();
  return countryToLocaleMap[upperCaseCountry] || 'en';
}

// Create provider component
export function LocaleProvider({ children }: LocaleProviderProps) {
  // Get stored locale or determine from user's country or default to English
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>(() => {
    // Проверяем сначала, есть ли сохраненная локаль
    const savedLocale = localStorage.getItem("locale") as LocaleCode;
    if (savedLocale && Object.keys(localesData).includes(savedLocale)) {
      return savedLocale;
    }
    
    // Если нет сохраненной локали, пытаемся определить по стране пользователя
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.country) {
          const localeFromCountry = getLocaleFromCountry(userData.country);
          // Сохраняем определенную локаль в localStorage
          localStorage.setItem("locale", localeFromCountry);
          return localeFromCountry;
        }
      }
    } catch (error) {
      console.error("Error parsing user data to determine locale:", error);
    }
    
    // Если не удалось определить локаль, используем английский по умолчанию
    return "en";
  });

  // Update locale and save to localStorage
  const setLocale = (locale: LocaleCode) => {
    setCurrentLocale(locale);
    localStorage.setItem("locale", locale);
  };

  // Translation function
  const t = (key: string): string => {
    // @ts-ignore - We can't type this properly because each locale file has different keys
    const translatedText = localesData[currentLocale].translations[key];
    return translatedText || key;
  };

  // Get locale options for dropdown select
  const getLocaleOptions = () => {
    return Object.entries(localesData).map(([code, { name }]) => ({
      value: code as LocaleCode,
      label: name
    }));
  };

  // Set document language attribute
  useEffect(() => {
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);
  
  // Слушатель изменений страны пользователя
  useEffect(() => {
    // Функция для обработки изменений в localStorage (например, когда меняется страна пользователя)
    const handleStorageChange = (event: StorageEvent) => {
      // Если изменился пользователь, проверяем, изменилась ли его страна
      if (event.key === 'user' && event.newValue !== null) {
        try {
          const userData = JSON.parse(event.newValue);
          // Только если локаль еще не задана вручную пользователем
          const savedLocale = localStorage.getItem("locale");
          const isDefaultLocale = !savedLocale || savedLocale === "en";
          
          if (userData && userData.country && isDefaultLocale) {
            const newLocale = getLocaleFromCountry(userData.country);
            if (newLocale !== currentLocale) {
              setCurrentLocale(newLocale);
              localStorage.setItem("locale", newLocale);
              console.log(`Locale automatically updated to ${newLocale} based on country ${userData.country}`);
            }
          }
        } catch (error) {
          console.error("Error handling storage change for locale update:", error);
        }
      }
    };

    // Добавляем слушатель событий изменения localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Удаляем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentLocale]);

  // Function to get localized product information
  const getLocalizedProductInfo = (productId: number) => {
    // Try to get from product translations for current locale
    const localizedInfo = productTranslations[currentLocale]?.[productId];
    
    // Fallback to English if translation not available
    if (!localizedInfo && currentLocale !== 'en') {
      return productTranslations['en']?.[productId] || { 
        title: `Product #${productId}`, 
        description: "No description available" 
      };
    }
    
    return localizedInfo || { 
      title: `Product #${productId}`, 
      description: "No description available" 
    };
  };

  const value = {
    currentLocale,
    setLocale,
    t,
    getLocaleOptions,
    translations: localesData[currentLocale].translations,
    getLocalizedProductInfo
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

// Hook for using translations
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}