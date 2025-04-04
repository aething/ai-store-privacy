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
        title: `Page Not Found: ${pageId}`,
        content: `# Page Not Found\n\nThe requested page "${pageId}" could not be found.`
      };
    }
    
    return localizedInfoPage;
  } catch (error) {
    console.error(`Error loading page ${pageId} in ${language}:`, error);
    // Return a generic error page
    return {
      title: `Error Loading Page: ${pageId}`,
      content: `# Error Loading Page\n\nThere was an error loading the requested page "${pageId}".`
    };
  }
};

export default infopages;