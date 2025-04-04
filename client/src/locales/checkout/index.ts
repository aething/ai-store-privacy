/**
 * Индексный файл для экспорта всех локализаций checkout
 */
import { LocaleCode } from '@/context/LocaleContext';
import { en } from './en';
import { de } from './de';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { ja } from './ja';
import { zh } from './zh';
import { CheckoutTranslations } from '@/types';

// Объект со всеми локализациями
const checkoutTranslations: Record<LocaleCode, CheckoutTranslations> = {
  en,
  de,
  es,
  fr,
  it,
  ja,
  zh
};

export default checkoutTranslations;