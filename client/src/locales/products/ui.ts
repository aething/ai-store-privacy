/**
 * Общие UI переводы для продуктов, разделенные по языкам
 */

import { ProductUITranslations } from '@/types';

// Английский (en)
export const en: ProductUITranslations = {
  hardwareTab: 'Hardware',
  softwareTab: 'Software',
  hardwareSpecsHeading: 'Hardware Specifications',
  aiCapabilitiesHeading: 'AI Capabilities & Performance',
  softwareArchitectureHeading: 'Software Architecture',
  noHardwareInfo: 'No hardware information available',
  noSoftwareInfo: 'No software information available',
  specificationLabel: 'Specification',
  imageDisclaimer: 'Images are for illustration purposes only. Refer to the description for full specifications.',
  enterCouponCode: 'Enter coupon code (optional)',
  learnMore: 'Learn More'
};

// Немецкий (de)
export const de: ProductUITranslations = {
  hardwareTab: 'Hardware',
  softwareTab: 'Software',
  hardwareSpecsHeading: 'Hardware-Spezifikationen',
  aiCapabilitiesHeading: 'KI-Fähigkeiten & Leistung',
  softwareArchitectureHeading: 'Software-Architektur',
  noHardwareInfo: 'Keine Hardware-Informationen verfügbar',
  noSoftwareInfo: 'Keine Software-Informationen verfügbar',
  specificationLabel: 'Spezifikation',
  imageDisclaimer: 'Die Bilder dienen nur zur Veranschaulichung. Siehe Beschreibung für vollständige Spezifikationen.',
  enterCouponCode: 'Gutscheincode eingeben (optional)',
  learnMore: 'Mehr erfahren'
};

// Испанский (es)
export const es: ProductUITranslations = {
  hardwareTab: 'Hardware',
  softwareTab: 'Software',
  hardwareSpecsHeading: 'Especificaciones de Hardware',
  aiCapabilitiesHeading: 'Capacidades de IA y Rendimiento',
  softwareArchitectureHeading: 'Arquitectura de Software',
  noHardwareInfo: 'No hay información de hardware disponible',
  noSoftwareInfo: 'No hay información de software disponible',
  specificationLabel: 'Especificación',
  imageDisclaimer: 'Las imágenes son solo para fines ilustrativos. Consulte la descripción para las especificaciones completas.',
  enterCouponCode: 'Ingrese código de cupón (opcional)',
  learnMore: 'Más información'
};

// Французский (fr)
export const fr: ProductUITranslations = {
  hardwareTab: 'Matériel',
  softwareTab: 'Logiciel',
  hardwareSpecsHeading: 'Spécifications Matérielles',
  aiCapabilitiesHeading: 'Capacités IA et Performance',
  softwareArchitectureHeading: 'Architecture Logicielle',
  noHardwareInfo: 'Aucune information matérielle disponible',
  noSoftwareInfo: 'Aucune information logicielle disponible',
  specificationLabel: 'Spécification',
  imageDisclaimer: 'Les images sont à titre d\'illustration uniquement. Reportez-vous à la description pour les spécifications complètes.',
  enterCouponCode: 'Entrez le code de coupon (facultatif)',
  learnMore: 'En savoir plus'
};

// Итальянский (it)
export const it: ProductUITranslations = {
  hardwareTab: 'Hardware',
  softwareTab: 'Software',
  hardwareSpecsHeading: 'Specifiche Hardware',
  aiCapabilitiesHeading: 'Capacità di IA e Prestazioni',
  softwareArchitectureHeading: 'Architettura Software',
  noHardwareInfo: 'Nessuna informazione hardware disponibile',
  noSoftwareInfo: 'Nessuna informazione software disponibile',
  specificationLabel: 'Specifica',
  imageDisclaimer: 'Le immagini sono solo a scopo illustrativo. Fare riferimento alla descrizione per le specifiche complete.',
  enterCouponCode: 'Inserisci il codice coupon (opzionale)',
  learnMore: 'Maggiori informazioni'
};

// Японский (ja)
export const ja: ProductUITranslations = {
  hardwareTab: 'ハードウェア',
  softwareTab: 'ソフトウェア',
  hardwareSpecsHeading: 'ハードウェア仕様',
  aiCapabilitiesHeading: 'AI機能とパフォーマンス',
  softwareArchitectureHeading: 'ソフトウェアアーキテクチャ',
  noHardwareInfo: 'ハードウェア情報がありません',
  noSoftwareInfo: 'ソフトウェア情報がありません',
  specificationLabel: '仕様',
  imageDisclaimer: '画像はイメージです。完全な仕様については説明を参照してください。',
  enterCouponCode: 'クーポンコードを入力（任意）',
  learnMore: '詳細を見る'
};

// Китайский (zh)
export const zh: ProductUITranslations = {
  hardwareTab: '硬件',
  softwareTab: '软件',
  hardwareSpecsHeading: '硬件规格',
  aiCapabilitiesHeading: 'AI功能和性能',
  softwareArchitectureHeading: '软件架构',
  noHardwareInfo: '没有可用的硬件信息',
  noSoftwareInfo: '没有可用的软件信息',
  specificationLabel: '规格',
  imageDisclaimer: '图片仅供参考。请参阅描述以获取完整规格。',
  enterCouponCode: '输入优惠码（可选）',
  learnMore: '了解更多'
};

// Экспортируем объект с переводами, индексированными по языку
export const productUITranslations: Record<string, ProductUITranslations> = {
  en,
  de,
  es,
  fr,
  it,
  ja,
  zh
};

export default productUITranslations;