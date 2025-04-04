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
}

export type InfoPageId = keyof InfoPages;

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
  pageId: InfoPageId | string,
  language: string = 'en'
): InfoPageTranslations => {
  // Check if the requested language exists
  const lang = (language in infopages) ? language : 'en';
  
  // Handle numeric IDs for product-linked info pages
  let mappedPageId: InfoPageId;
  
  // If pageId is a number string (from URL parameter)
  if (!isNaN(Number(pageId))) {
    // Map product ID to corresponding info page ID
    // This is a simplified mapping based on the convention used in ProductDetail.tsx
    const productId = Number(pageId);
    // Map product IDs (1, 2, 3) to info page IDs
    switch(productId) {
      case 0: // Product ID 1 - 1 (Orin)
        mappedPageId = 'about';
        break;
      case 1: // Product ID 2 - 1 (Vision Pro)
        mappedPageId = 'about';
        break;
      case 2: // Product ID 3 - 1 (Edge AI)
        mappedPageId = 'about';  
        break;
      default:
        mappedPageId = 'about'; // Default to About page
    }
  } else {
    // If pageId is already a valid InfoPageId key
    mappedPageId = pageId as InfoPageId;
  }
  
  // Get the info page in the requested language
  const localizedInfoPage = infopages[lang as keyof typeof infopages][mappedPageId];
  
  if (!localizedInfoPage) {
    // Fallback to English if the page doesn't exist in the requested language
    return infopages.en[mappedPageId];
  }
  
  return localizedInfoPage;
};

export default infopages;