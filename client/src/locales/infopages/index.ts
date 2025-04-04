import en from './en';
import de from './de';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import zh from './zh';

export interface InfoPageTranslations {
  title: string;
  content: string;
}

export interface InfoPages {
  privacyPolicy: InfoPageTranslations;
  termsOfService: InfoPageTranslations;
  deliveryPolicy: InfoPageTranslations;
  returnPolicy: InfoPageTranslations;
  about: InfoPageTranslations;
  contact: InfoPageTranslations;
  // Дополнительные ID для страниц продуктов
  'product-1': InfoPageTranslations;
  'product-2': InfoPageTranslations;
  'product-3': InfoPageTranslations;
}

export type InfoPageId = keyof InfoPages | string;

// Fallback to English if specific language isn't available yet
const infopages = {
  en,
  de: de || en,
  es: es || en,
  fr: fr || en,
  it: it || en,
  ja: ja || en,
  zh: zh || en,
};

/**
 * Gets localized information page content based on the page ID and language
 * 
 * @param pageId The ID of the information page
 * @param language The language code (e.g., 'en', 'de', 'fr')
 * @returns The localized title and content
 */
export const getLocalizedInfoPageById = (
  pageId: InfoPageId,
  language: string = 'en'
): InfoPageTranslations => {
  // Check if the requested language exists
  const lang = (language in infopages) ? language : 'en';
  
  try {
    // Get the info page in the requested language
    const langPages = infopages[lang as keyof typeof infopages];
    
    // Проверка на страницу продукта
    if (typeof pageId === 'string' && pageId.startsWith('product-')) {
      const productId = pageId.replace('product-', '');
      console.log(`Looking for product info: ${pageId}, product ID: ${productId}`);
      
      // Ищем страницу по ключу 'product-X'
      const key = pageId as keyof typeof langPages;
      if (langPages[key]) {
        return langPages[key];
      }
      
      // Пробуем найти в английской версии
      if (lang !== 'en' && infopages.en[key as keyof typeof infopages.en]) {
        return infopages.en[key as keyof typeof infopages.en];
      }
      
      // Если не нашли, возвращаем объект с сообщением об ошибке
      return {
        title: `Product Information`,
        content: `# Product Information\n\nDetailed information about this product is not available at the moment.\n\nPlease check back later or contact customer support for more details.`
      };
    }
    
    // Обычная обработка для не-продуктовых страниц
    const pageKey = pageId as keyof typeof langPages;
    const localizedInfoPage = langPages[pageKey];
    
    if (!localizedInfoPage) {
      // Fallback to English if the page doesn't exist in the requested language
      const enPage = infopages.en[pageKey as keyof typeof infopages.en];
      if (enPage) {
        return enPage;
      }
      
      // If not found in English either, return a generic error page
      return {
        title: `Page Not Found`,
        content: `# Page Not Found\n\nThe requested page could not be found.`
      };
    }
    
    return localizedInfoPage;
  } catch (error) {
    console.error(`Error loading page ${pageId} in ${language}:`, error);
    // Return a generic error page
    return {
      title: `Error Loading Page`,
      content: `# Error Loading Page\n\nThere was an error loading the requested page.`
    };
  }
};

export default infopages;