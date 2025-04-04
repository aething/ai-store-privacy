import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";

// В соответствии с требованиями задачи, оставляем только английский язык
// в первом релизе. Другие языки будут добавлены в следующих версиях.
import en from "../locales/en";

// Для сохранения типизации, оставляем все языковые коды, но используем только английский
export type LocaleCode = 'en' | 'es' | 'de' | 'fr' | 'it' | 'zh' | 'ja';

// Временно оставляем только английский локализацию
const localesData = {
  en: { name: "English", translations: en },
  // Остальные языки закомментированы до следующего релиза
  /*
  es: { name: "Español", translations: es },
  de: { name: "Deutsch", translations: de },
  fr: { name: "Français", translations: fr },
  it: { name: "Italiano", translations: it },
  zh: { name: "中文", translations: zh },
  ja: { name: "日本語", translations: ja }
  */
};

// Define context type
export interface LocaleContextType {
  currentLocale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: string) => string;
  getLocaleOptions: () => { value: LocaleCode; label: string }[];
  translations: any; // Добавляем доступ к объекту переводов
}

// Create context
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Provider props
interface LocaleProviderProps {
  children: ReactNode;
}

// Create provider component
export function LocaleProvider({ children }: LocaleProviderProps) {
  // В текущей версии приложения всегда используем только английский язык
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>("en");

  // Update locale and save to localStorage
  // В текущей версии приложения используется только английский язык
  const setLocale = (locale: LocaleCode) => {
    // Всегда устанавливаем английский язык независимо от переданного параметра
    setCurrentLocale("en");
    localStorage.setItem("locale", "en");
    
    // Для отладки логгируем попытку изменения языка
    if (locale !== "en") {
      console.log(`[LocaleContext] Attempt to change language to ${locale} was ignored. Only English is supported in this version.`);
    }
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

  const value = {
    currentLocale,
    setLocale,
    t,
    getLocaleOptions,
    // Добавляем доступ к текущим переводам
    translations: localesData[currentLocale].translations
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