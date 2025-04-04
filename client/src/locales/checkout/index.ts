/**
 * Index file for checkout translations
 */

import { CheckoutTranslations } from '@/types';

// Define a safe import function to handle potential missing modules
function safeImport(modulePath: string) {
  try {
    return require(modulePath).default;
  } catch (error) {
    console.warn(`Failed to import ${modulePath}:`, error);
    return null;
  }
}

// Import with fallbacks
const en = safeImport('./en');
const de = safeImport('./de') || en;
const es = safeImport('./es') || en;
const fr = safeImport('./fr') || en;
const it = safeImport('./it') || en;
const ja = safeImport('./ja') || en;
const zh = safeImport('./zh') || en;

const checkoutTranslations: Record<string, CheckoutTranslations> = {
  en,
  de,
  es,
  fr,
  it,
  ja,
  zh
};

export default checkoutTranslations;