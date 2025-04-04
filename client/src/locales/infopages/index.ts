import { InfoPage } from "@/types";
// Импортируем все локализованные файлы с информационными страницами
import { en } from "./en";
import { de } from "./de"; 
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";
import { zh } from "./zh";

export const infoPageTranslations: Record<string, InfoPage[]> = {
  en,
  de,
  es,
  fr,
  it,
  ja,
  zh
};

/**
 * Получить информационную страницу по ID и локали
 * 
 * @param id ID информационной страницы
 * @param locale Код языка (en, de, fr, ...)
 * @returns Локализованная информационная страница или undefined если не найдена
 */
export const getLocalizedInfoPageById = (id: number, locale: string = "en"): InfoPage | undefined => {
  // Если локаль не существует, используем английский по умолчанию
  const pages = infoPageTranslations[locale] || infoPageTranslations.en;
  
  // Найти страницу по ID
  return pages.find(page => page.id === id);
};