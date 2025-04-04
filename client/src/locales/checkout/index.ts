/**
 * Index file for checkout translations
 */

import { CheckoutTranslations } from '@/types';
import en from './en';
import de from './de';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import zh from './zh';

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