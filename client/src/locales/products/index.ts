/**
 * Product translations aggregator
 */

import { ProductTranslations } from '@/types';

import en from './en';
import de from './de';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import zh from './zh';

// Экспортируем локализованные описания продуктов, индексированные по языку и ID
export const productTranslations: Record<string, ProductTranslations> = {
  en,
  de,
  es,
  fr,
  it,
  ja,
  zh
};

export default productTranslations;