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
  pageId: InfoPageId,
  language: string = 'en'
): InfoPageTranslations => {
  // Check if the requested language exists
  const lang = (language in infopages) ? language : 'en';
  
  // Get the info page in the requested language
  const localizedInfoPage = infopages[lang as keyof typeof infopages][pageId];
  
  if (!localizedInfoPage) {
    // Fallback to English if the page doesn't exist in the requested language
    return infopages.en[pageId];
  }
  
  return localizedInfoPage;
};

export default infopages;