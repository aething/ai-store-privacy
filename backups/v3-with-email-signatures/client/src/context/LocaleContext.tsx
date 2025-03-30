import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";

// Import all language translations
import en from "../locales/en";
import es from "../locales/es";
import de from "../locales/de";
import fr from "../locales/fr";
import it from "../locales/it";
import zh from "../locales/zh";
import ja from "../locales/ja";

// Define locale types
export type LocaleCode = 'en' | 'es' | 'de' | 'fr' | 'it' | 'zh' | 'ja';

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
  // Get stored locale or default to English
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>(() => {
    const savedLocale = localStorage.getItem("locale") as LocaleCode;
    return (savedLocale && Object.keys(localesData).includes(savedLocale)) 
      ? savedLocale 
      : "en";
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