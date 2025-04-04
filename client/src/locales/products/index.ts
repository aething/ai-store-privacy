/**
 * Index file for all product translations
 */

import { ProductTranslations } from '@/types';
import en from './en';
import de from './de';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import zh from './zh';

// Map of all available translations by locale
const translations: Record<string, ProductTranslations> = {
  en,
  de,
  es,
  fr,
  it,
  ja,
  zh
};

export default translations;